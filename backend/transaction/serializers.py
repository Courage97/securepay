from rest_framework import serializers
from .models import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()


class TransactionSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'sender', 'sender_username', 'receiver', 'receiver_username',
            'amount', 'description', 'transaction_type', 'status',
            'risk_score', 'risk_level', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'sender', 'status', 'risk_score', 'risk_level', 'created_at', 'completed_at']


class SendMoneySerializer(serializers.Serializer):
    receiver_username = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        if value > 1000000:  # Max 1 million per transaction
            raise serializers.ValidationError("Amount exceeds maximum limit of ₦1,000,000")
        return value
    
    def validate_receiver_username(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Receiver not found")
        return value