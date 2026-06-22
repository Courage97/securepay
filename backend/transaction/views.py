from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction as db_transaction
from datetime import timedelta
from decimal import Decimal
import hashlib
import random
import string

from .models import Transaction
from .serializers import TransactionSerializer, SendMoneySerializer

User = get_user_model()

# Import ML risk assessor and helper functions from api app
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'api'))
from api.views import ml_risk_assessor, get_client_ip, generate_device_fingerprint


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_money(request):
    """
    Send money to another user
    
    POST /api/transactions/send/
    {
        "receiver_username": "john_doe",
        "amount": 1000.00,
        "description": "Payment for lunch"
    }
    """
    serializer = SendMoneySerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    sender = request.user
    receiver_username = serializer.validated_data['receiver_username']
    amount = serializer.validated_data['amount']
    description = serializer.validated_data.get('description', '')
    
    # Get receiver
    try:
        receiver = User.objects.get(username=receiver_username)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Receiver not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Can't send to yourself
    if sender == receiver:
        return Response({
            'status': 'error',
            'message': 'Cannot send money to yourself'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check sufficient balance
    if sender.wallet_balance < amount:
        return Response({
            'status': 'error',
            'message': f'Insufficient balance. Your balance: ₦{sender.wallet_balance}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get request info
    ip_address = get_client_ip(request)
    device_fingerprint = generate_device_fingerprint(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Calculate transaction risk using ML
    risk_score, risk_level = ml_risk_assessor.calculate_risk(
        sender, ip_address, device_fingerprint, user_agent
    )
    
    # Additional transaction-specific risk factors
    if amount > 50000:  # Large transaction
        risk_score = min(risk_score + 20, 100)
    if receiver.created_at > timezone.now() - timedelta(days=7):  # New receiver account
        risk_score = min(risk_score + 15, 100)
    
    # Recalculate risk level based on adjusted score
    if risk_score < 30:
        risk_level = 0
    elif risk_score < 70:
        risk_level = 1
    else:
        risk_level = 2
    
    # Create transaction record
    txn = Transaction.objects.create(
        sender=sender,
        receiver=receiver,
        amount=amount,
        description=description,
        transaction_type='send',
        status='pending',
        sender_balance_before=sender.wallet_balance,
        sender_balance_after=sender.wallet_balance - amount,
        receiver_balance_before=receiver.wallet_balance,
        receiver_balance_after=receiver.wallet_balance + amount,
        risk_score=risk_score,
        risk_level=risk_level,
        ip_address=ip_address,
        device_fingerprint=device_fingerprint
    )
    
    risk_level_text = ['low', 'medium', 'high'][risk_level]
    
    # High or Medium risk: Require MFA
    if risk_level >= 1:
        txn.mfa_required = True
        txn.save()
        
        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        print(f"📧 Transaction OTP: {otp_code}")  # Debug
        
        return Response({
            'status': 'mfa_required',
            'message': f'{risk_level_text.capitalize()} risk transaction. Additional verification required.',
            'transaction_id': str(txn.id),
            'risk_score': risk_score,
            'risk_level': risk_level_text,
            'amount': float(amount),
            'receiver': receiver_username,
            'mfa_required': True,
            # 'otp_code': otp_code,  # For testing - remove in production
        }, status=status.HTTP_200_OK)
    
    # Low risk: Complete transaction immediately
    with db_transaction.atomic():
        # Update balances
        sender.wallet_balance -= amount
        sender.save()
        
        receiver.wallet_balance += amount
        receiver.save()
        
        # Update transaction
        txn.status = 'completed'
        txn.completed_at = timezone.now()
        txn.save()
    
    return Response({
        'status': 'success',
        'message': f'Successfully sent ₦{amount} to {receiver_username}',
        'transaction': TransactionSerializer(txn).data,
        'new_balance': float(sender.wallet_balance)
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """
    Get user's transaction history
    
    GET /api/transactions/history/
    """
    user = request.user
    
    # Get all transactions (sent or received)
    sent = Transaction.objects.filter(sender=user)
    received = Transaction.objects.filter(receiver=user)
    
    all_transactions = (sent | received).distinct().order_by('-created_at')[:20]
    
    serializer = TransactionSerializer(all_transactions, many=True)
    
    return Response({
        'status': 'success',
        'transactions': serializer.data,
        'current_balance': float(user.wallet_balance)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_funds(request):
    """
    Add funds to wallet (for testing)
    
    POST /api/transactions/add-funds/
    {
        "amount": 10000.00
    }
    """
    amount = request.data.get('amount')
    
    if not amount:
        return Response({
            'status': 'error',
            'message': 'Amount is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return Response({
            'status': 'error',
            'message': 'Invalid amount'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    old_balance = user.wallet_balance
    user.wallet_balance += amount
    user.save()
    
    return Response({
        'status': 'success',
        'message': f'Added ₦{amount} to your wallet',
        'old_balance': float(old_balance),
        'new_balance': float(user.wallet_balance)
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_transaction_mfa(request):
    """
    Verify MFA for pending transaction
    
    POST /api/transactions/verify-mfa/
    {
        "transaction_id": "uuid",
        "otp_code": "123456"
    }
    """
    from .models import Transaction
    from .serializers import TransactionSerializer
    
    transaction_id = request.data.get('transaction_id')
    otp_code = request.data.get('otp_code')
    
    if not transaction_id or not otp_code:
        return Response({
            'status': 'error',
            'message': 'transaction_id and otp_code are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        txn = Transaction.objects.get(id=transaction_id, sender=request.user, status='pending')
    except Transaction.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Transaction not found or already completed'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # For now, we'll use a simple OTP validation
    # In production, store OTP in database linked to transaction
    # For testing, we'll just check if OTP is 6 digits
    if len(otp_code) != 6 or not otp_code.isdigit():
        return Response({
            'status': 'error',
            'message': 'Invalid OTP format'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Complete the transaction
    sender = txn.sender
    receiver = txn.receiver
    amount = txn.amount
    
    # Check balance again (in case it changed)
    if sender.wallet_balance < amount:
        txn.status = 'failed'
        txn.save()
        return Response({
            'status': 'error',
            'message': f'Insufficient balance. Your balance: ₦{sender.wallet_balance}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Execute transaction atomically
    with db_transaction.atomic():
        # Update balances
        sender.wallet_balance -= amount
        sender.save()
        
        receiver.wallet_balance += amount
        receiver.save()
        
        # Update transaction
        txn.status = 'completed'
        txn.mfa_completed = True
        txn.completed_at = timezone.now()
        txn.sender_balance_after = sender.wallet_balance
        txn.receiver_balance_after = receiver.wallet_balance
        txn.save()
    
    return Response({
        'status': 'success',
        'message': f'Successfully sent ₦{amount} to {receiver.username}',
        'transaction': TransactionSerializer(txn).data,
        'new_balance': float(sender.wallet_balance)
    }, status=status.HTTP_200_OK)