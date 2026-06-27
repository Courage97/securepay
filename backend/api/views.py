from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, LoginAttempt
from .serializers import UserSerializer, RegisterSerializer
import hashlib
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import secrets
from .models import User, LoginAttempt, PasswordResetToken
from .serializers import UserSerializer, RegisterSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from django.utils import timezone
import joblib
import numpy as np
from datetime import datetime
from .models import User, LoginAttempt, PasswordResetToken, TrustedDevice, TrustedLocation, OTPVerification
from transaction.models import Transaction
import uuid
import os

def send_sms_otp(phone_number, otp_code):
    """Send OTP via SMS using Twilio"""
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=f'Your SecurePay verification code is: {otp_code}. Valid for 10 minutes. Do not share this code.',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        
        print(f"✅ SMS sent to {phone_number}: {message.sid}")
        return True
    except Exception as e:
        print(f"❌ SMS failed: {e}")
        return False

class MLRiskAssessment:
    """ML-based risk assessment for login attempts"""
    
    def __init__(self):
        try:
            # Use absolute path - works both locally and on Render
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(BASE_DIR, 'ml_engine', 'pharming_model.pkl')
            scaler_path = os.path.join(BASE_DIR, 'ml_engine', 'scaler.pkl')
            
            print(f"📁 Loading ML model from: {model_path}")
            print(f"📁 Model exists: {os.path.exists(model_path)}")
            
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.model_loaded = True
            print("✅ ML model loaded successfully!")
        except Exception as e:
            self.model_loaded = False
            print(f"⚠️ ML model not loaded: {e}")
    
    def calculate_risk(self, user, ip_address, device_fingerprint, user_agent):
        """
        Calculate risk score using ML model + manual adjustments
        
        Returns:
        --------
        risk_score : float (0-100)
        risk_level : int (0=Low, 1=Medium, 2=High)
        """
        
        if not self.model_loaded:
            # Fallback to simple rule-based assessment
            return self._fallback_risk_assessment(user, ip_address, device_fingerprint)
        
        # Extract features for ML model
        features = self._extract_features(user, ip_address, device_fingerprint, user_agent)
        
        # Prepare feature array
        feature_array = [
            features['ip_distance_km'],
            features['device_trust_score'],
            features['time_since_last_login_hrs'],
            features['dns_response_time_ms'],
            features['ssl_cert_valid'],
            features['domain_age_days'],
            features['login_hour'],
            features['failed_login_attempts'],
            features['browser_fingerprint_match'],
            features['geolocation_match']
        ]
        
        # Scale and predict
        feature_scaled = self.scaler.transform([feature_array])
        ml_risk_level = int(self.model.predict(feature_scaled)[0])
        
        # Convert ML prediction to base risk score
        if ml_risk_level == 0:
            base_risk_score = 15
        elif ml_risk_level == 1:
            base_risk_score = 55
        else:
            base_risk_score = 90
        
        # MANUAL ADJUSTMENTS - Override ML when necessary
        adjusted_risk_score = base_risk_score
        
        # 1. CRITICAL: Failed login attempts boost risk significantly
        failed_attempts = features['failed_login_attempts']
        if failed_attempts >= 5:
            adjusted_risk_score = max(adjusted_risk_score, 90)  # Force High Risk
            print(f"⚠️ High Risk: {failed_attempts} failed attempts detected!")
        elif failed_attempts >= 3:
            adjusted_risk_score = max(adjusted_risk_score, 60)  # Force Medium Risk
            print(f"⚠️ Medium Risk: {failed_attempts} failed attempts detected!")
        elif failed_attempts >= 1:
            adjusted_risk_score += 20  # Add penalty
        
        # 2. Unknown device penalty
        if features['device_trust_score'] < 0.3:
            adjusted_risk_score += 15
            print(f"⚠️ Unknown device detected!")
        
        # 3. New location penalty
        if features['ip_distance_km'] > 100:
            adjusted_risk_score += 20
            print(f"⚠️ Login from unusual location ({features['ip_distance_km']} km away)!")
        
        # 4. Unusual time penalty (late night/early morning)
        login_hour = features['login_hour']
        if login_hour < 6 or login_hour > 23:
            adjusted_risk_score += 10
            print(f"⚠️ Unusual login time: {login_hour}:00")
        
        # Cap at 100
        adjusted_risk_score = min(adjusted_risk_score, 100)
        
        # Determine final risk level based on adjusted score
        if adjusted_risk_score < 30:
            final_risk_level = 0  # Low
        elif adjusted_risk_score < 70:
            final_risk_level = 1  # Medium
        else:
            final_risk_level = 2  # High
        
        print(f"📊 Risk Assessment: ML={ml_risk_level}, Base={base_risk_score}, Adjusted={adjusted_risk_score}, Final Level={final_risk_level}")
        
        return float(adjusted_risk_score), final_risk_level
        
    def _extract_features(self, user, ip_address, device_fingerprint, user_agent):
        """Extract features for ML model"""
        
        features = {}
        
        if user:
            # Get user's login history
            from .models import LoginAttempt, TrustedDevice, TrustedLocation
            
            # 1. IP Distance (simplified - in production use geolocation API)
            features['ip_distance_km'] = 0  # Same location assumed
            
            # Check if this IP is far from usual
            if not LoginAttempt.objects.filter(
                user=user, 
                ip_address=ip_address,
                status='success'
            ).exists():
                features['ip_distance_km'] = 100  # New location
            
            # 2. Device Trust Score
            trusted_device = TrustedDevice.objects.filter(
                user=user,
                device_fingerprint=device_fingerprint,
                is_active=True
            ).first()
            
            if trusted_device:
                features['device_trust_score'] = 0.9
            else:
                features['device_trust_score'] = 0.1
            
            # 3. Time since last login
            last_login = LoginAttempt.objects.filter(
                user=user,
                status='success'
            ).order_by('-timestamp').first()
            
            if last_login:
                time_diff = timezone.now() - last_login.timestamp
                features['time_since_last_login_hrs'] = time_diff.total_seconds() / 3600
            else:
                features['time_since_last_login_hrs'] = 168  # 1 week
            
            # 4. DNS response time (simulated - in production, measure actual)
            features['dns_response_time_ms'] = 20  # Normal
            
            # 5. SSL certificate valid
            features['ssl_cert_valid'] = 1  # Assume valid
            
            # 6. Domain age (our domain)
            features['domain_age_days'] = 365  # 1 year old
            
            # 7. Login hour
            features['login_hour'] = timezone.now().hour
            
           # 8. Failed login attempts (last 24 hours)
            failed_count = LoginAttempt.objects.filter(
                username=user.username,  # Changed from user=user to username
                status='failed',
                timestamp__gte=timezone.now() - timedelta(hours=24)
            ).count()
            features['failed_login_attempts'] = failed_count
            
            # Debug print (remove later)
            print(f"🔍 Debug - Failed attempts for {user.username}: {failed_count}")
            
            # 9. Browser fingerprint match
            features['browser_fingerprint_match'] = 1 if trusted_device else 0
            
            # 10. Geolocation match (simplified)
            features['geolocation_match'] = 1 if features['ip_distance_km'] < 50 else 0
            
        else:
            # User not found - default suspicious values
            features = {
                'ip_distance_km': 0,
                'device_trust_score': 0.5,
                'time_since_last_login_hrs': 0,
                'dns_response_time_ms': 20,
                'ssl_cert_valid': 1,
                'domain_age_days': 365,
                'login_hour': timezone.now().hour,
                'failed_login_attempts': 1,
                'browser_fingerprint_match': 0,
                'geolocation_match': 0
            }
        
        return features
    
    def _fallback_risk_assessment(self, user, ip_address, device_fingerprint):
        """Simple rule-based risk assessment if ML model unavailable"""
        risk_score = 0
        
        if user:
            from .models import LoginAttempt
            
            # Check if new IP
            if not LoginAttempt.objects.filter(user=user, ip_address=ip_address).exists():
                risk_score += 30
            
            # Check failed attempts
            failed_count = LoginAttempt.objects.filter(
                user=user,
                status='failed',
                timestamp__gte=timezone.now() - timedelta(hours=24)
            ).count()
            risk_score += (failed_count * 20)
        
        risk_score = min(risk_score, 100)
        
        if risk_score < 30:
            risk_level = 0
        elif risk_score < 70:
            risk_level = 1
        else:
            risk_level = 2
        
        return float(risk_score), risk_level


# Initialize ML risk assessment
ml_risk_assessor = MLRiskAssessment()

def get_client_ip(request):
    """Extract client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def generate_device_fingerprint(request):
    """Generate simple device fingerprint"""
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    accept = request.META.get('HTTP_ACCEPT', '')
    fingerprint = hashlib.sha256(f"{user_agent}{accept}".encode()).hexdigest()
    return fingerprint[:16]


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register new user
    
    POST /api/auth/register/
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'status': 'success',
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login with ML risk assessment and adaptive MFA
    
    POST /api/auth/login/
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'status': 'error',
            'message': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate
    user = authenticate(username=username, password=password)
    
    # Get request info
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    device_fingerprint = generate_device_fingerprint(request)
    
    # Calculate risk using ML model
    risk_score, risk_level = ml_risk_assessor.calculate_risk(
        user, ip_address, device_fingerprint, user_agent
    )
    
    # Create login attempt record
    login_attempt = LoginAttempt.objects.create(
        user=user,
        username=username,
        ip_address=ip_address,
        user_agent=user_agent,
        device_fingerprint=device_fingerprint,
        risk_score=risk_score,
        risk_level=risk_level,
        status='failed' if not user else 'pending'
    )
    
    if not user:
        login_attempt.status = 'failed'
        login_attempt.save()
        return Response({
            'status': 'error',
            'message': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Convert risk level to text
    risk_level_text = ['low', 'medium', 'high'][risk_level]
    
    # ADAPTIVE MFA: Medium or High Risk requires verification
    if risk_level >= 1:
        # Generate session ID and OTP
        session_id = str(login_attempt.id)
        otp_code = str(random.randint(100000, 999999))
        
        # Create OTP verification record
        otp_verification = OTPVerification.objects.create(
            login_attempt=login_attempt,
            otp_code=otp_code,
            otp_type='email',  # Default, will update if SMS used
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Determine which method to use (SMS preferred if phone available)
        use_sms = user.phone_number and len(user.phone_number) >= 10
        
        if use_sms:
            # Try to send SMS OTP
            sms_sent = send_sms_otp(user.phone_number, otp_code)
            if sms_sent:
                otp_verification.otp_type = 'sms'
                otp_verification.save()
                print(f"📱 SMS OTP sent to {user.phone_number}")
            else:
                # Fallback to email if SMS fails
                use_sms = False
                print(f"⚠️ SMS failed, falling back to email")
        
        if not use_sms:
            # Send Email OTP
            try:
                send_mail(
                    subject='SecurePay - Security Verification Required',
                    message=f'''
Hello {user.username},

We detected unusual activity on your account and need to verify your identity.

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't attempt to login, please secure your account immediately.

Risk Score: {risk_score}/100
Risk Level: {risk_level_text}

Best regards,
SecurePay Security Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
                print(f"✅ Email OTP sent to {user.email}")
            except Exception as e:
                print(f"⚠️ Email error: {e}")
        
        print(f"📧 OTP Code (for testing): {otp_code}")
        
        # Mark login as MFA required
        login_attempt.mfa_required = True
        login_attempt.save()
        
        return Response({
            'status': 'mfa_required',
            'message': f'Verification code sent via {"SMS" if use_sms else "email"}',
            'session_id': session_id,
            # 'otp_code': otp_code,  # Remove in production
            'risk_score': risk_score,
            'risk_level': risk_level,
            'mfa_method': 'sms' if use_sms else 'email'
        }, status=status.HTTP_200_OK)
    
    # Low Risk: Grant access immediately
    login_attempt.status = 'success'
    login_attempt.save()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Update trusted device
    try:
        device, created = TrustedDevice.objects.update_or_create(
            device_fingerprint=device_fingerprint,
            defaults={
                'user': user,
                'device_name': user_agent[:100],
                'user_agent': user_agent,
                'trust_score': 1.0,
                'is_active': True
            }
        )
        if not created and device.user != user:
            device.user = user
            device.save()
    except Exception as e:
        print(f"⚠️ Device save error: {e}")
    
    # Save location as trusted
    TrustedLocation.objects.update_or_create(
        user=user,
        latitude=0.0,
        longitude=0.0,
        defaults={
            'country': 'Nigeria',
            'city': 'Lagos',
        }
    )
    
    return Response({
        'status': 'success',
        'message': 'Login successful',
        'risk_score': risk_score,
        'risk_level': risk_level_text,
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get user profile
    
    GET /api/auth/profile/
    """
    return Response({
        'status': 'success',
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Request password reset
    
    POST /api/auth/forgot-password/
    {
        "email": "user@example.com"
    }
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        user = User.objects.get(email=email)
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        
        # Create reset token (expires in 1 hour)
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        # In production, send actual email
        # For now, just return the token (for testing)
        # send_mail(
        #     'Password Reset Request',
        #     f'Your reset token: {token}',
        #     settings.DEFAULT_FROM_EMAIL,
        #     [email],
        #     fail_silently=False,
        # )
        
        return Response({
            'status': 'success',
            'message': 'Password reset token sent to email',
            'token': token,  # Remove this in production!
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Don't reveal if email exists (security best practice)
        return Response({
            'status': 'success',
            'message': 'If email exists, reset token has been sent'
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_mfa(request):
    """
    Verify MFA code for login
    
    POST /api/auth/verify-mfa/
    Body: { session_id, otp_code, method }
    """
    session_id = request.data.get('session_id')
    otp_code = request.data.get('otp_code')
    method = request.data.get('method', 'email')
    
    if not session_id or not otp_code:
        return Response({
            'status': 'error',
            'message': 'Session ID and OTP code required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get login attempt
    try:
        login_attempt = LoginAttempt.objects.get(id=session_id)
    except LoginAttempt.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Invalid session'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user from login attempt
    user = login_attempt.user
    
    # Find OTP record (only unused ones)
    otp_record = OTPVerification.objects.filter(
        login_attempt=login_attempt,
        otp_code=otp_code,
        is_used=False  # Only get unused OTPs
    ).first()
    
    # Check if OTP exists
    if not otp_record:
        return Response({
            'status': 'error',
            'message': 'Invalid or already used OTP code'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP is expired (BEFORE marking as used)
    if not otp_record.is_valid():
        return Response({
            'status': 'error',
            'message': 'OTP code has expired. Please request a new one.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # OTP is valid - mark as used NOW
    otp_record.is_used = True
    otp_record.save()
    
    # Update login attempt
    login_attempt.status = 'success'
    login_attempt.mfa_completed = True
    login_attempt.save()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Get request info for trusted device
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    device_fingerprint = generate_device_fingerprint(request)
    
    # Update trusted device
    try:
        device, created = TrustedDevice.objects.update_or_create(
            device_fingerprint=device_fingerprint,
            defaults={
                'user': user,
                'device_name': user_agent[:100],
                'user_agent': user_agent,
                'trust_score': 1.0,
                'is_active': True
            }
        )
        if not created and device.user != user:
            device.user = user
            device.save()
    except Exception as e:
        print(f"⚠️ Device save error: {e}")
    
    print(f"✅ MFA verified for {user.username}")
    
    return Response({
        'status': 'success',
        'message': 'MFA verification successful',
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Send password reset email
    
    POST /api/auth/forgot-password/
    Body: { email }
    """
    email = request.data.get('email')
    
    if not email:
        return Response({
            'status': 'error',
            'message': 'Email required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Find user
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists (security)
        return Response({
            'status': 'success',
            'message': 'If that email exists, a reset link has been sent'
        }, status=status.HTTP_200_OK)
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    
    # Create or update reset token
    PasswordResetToken.objects.update_or_create(
        user=user,
        defaults={
            'token': reset_token,
            'expires_at': timezone.now() + timedelta(hours=1)
        }
    )
    
    # Send reset email
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    
    try:
        send_mail(
            subject='SecurePay - Password Reset Request',
            message=f'''
Hello {user.username},

You requested to reset your password. Click the link below to reset:

{reset_link}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
SecurePay Security Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        print(f"✅ Password reset email sent to {user.email}")
        print(f"🔗 Reset link: {reset_link}")
    except Exception as e:
        print(f"⚠️ Email error: {e}")
    
    return Response({
        'status': 'success',
        'message': 'If that email exists, a reset link has been sent'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with token
    
    POST /api/auth/reset-password/
    {
        "token": "abc123...",
        "new_password": "NewPass123",
        "new_password2": "NewPass123"
    }
    """
    serializer = ResetPasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if not reset_token.is_valid():
            return Response({
                'status': 'error',
                'message': 'Token is invalid or expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'status': 'success',
            'message': 'Password reset successful'
        }, status=status.HTTP_200_OK)
        
    except PasswordResetToken.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_history(request):
    """
    Get user's login history
    
    GET /api/auth/login-history/
    """
    user = request.user
    
    # Get all login attempts for this user (last 50)
    login_attempts = LoginAttempt.objects.filter(
        user=user
    ).order_by('-timestamp')[:50]
    
    # Format the data
    history = []
    for attempt in login_attempts:
        history.append({
            'id': str(attempt.id),
            'ip_address': attempt.ip_address,
            'country': attempt.country or 'Unknown',
            'city': attempt.city or 'Unknown',
            'device_fingerprint': attempt.device_fingerprint[:16] + '...' if attempt.device_fingerprint else 'Unknown',
            'user_agent': attempt.user_agent or 'Unknown',
            'risk_score': float(attempt.risk_score),
            'risk_level': attempt.risk_level,
            'status': attempt.status,
            'mfa_required': attempt.mfa_required,
            'mfa_completed': attempt.mfa_completed,
            'timestamp': attempt.timestamp.isoformat(),
        })
    
    return Response({
        'status': 'success',
        'login_history': history,
        'total_attempts': len(history)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """
    Admin dashboard - system overview
    Restricted to superusers only
    
    GET /api/admin/dashboard/
    """
    # Check if user is admin
    if not request.user.is_superuser:
        return Response({
            'status': 'error',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get statistics
    total_users = User.objects.count()
    total_transactions = Transaction.objects.count()
    total_logins = LoginAttempt.objects.count()
    
    # Recent activity
    recent_users = User.objects.order_by('-created_at')[:5]
    recent_transactions = Transaction.objects.order_by('-created_at')[:10]
    recent_logins = LoginAttempt.objects.order_by('-timestamp')[:10]
    
    # Risk statistics
    low_risk = LoginAttempt.objects.filter(risk_level=0).count()
    medium_risk = LoginAttempt.objects.filter(risk_level=1).count()
    high_risk = LoginAttempt.objects.filter(risk_level=2).count()
    
    # Login success/failure
    successful_logins = LoginAttempt.objects.filter(status='success').count()
    failed_logins = LoginAttempt.objects.filter(status='failed').count()
    
    # Transaction statistics
    completed_txns = Transaction.objects.filter(status='completed').count()
    pending_txns = Transaction.objects.filter(status='pending').count()
    failed_txns = Transaction.objects.filter(status='failed').count()
    
    # Total money in system
    from django.db.models import Sum
    total_balance = User.objects.aggregate(Sum('wallet_balance'))['wallet_balance__sum'] or 0
    
    return Response({
        'status': 'success',
        'stats': {
            'total_users': total_users,
            'total_transactions': total_transactions,
            'total_logins': total_logins,
            'total_balance': float(total_balance),
        },
        'risk_distribution': {
            'low': low_risk,
            'medium': medium_risk,
            'high': high_risk,
        },
        'login_stats': {
            'successful': successful_logins,
            'failed': failed_logins,
        },
        'transaction_stats': {
            'completed': completed_txns,
            'pending': pending_txns,
            'failed': failed_txns,
        },
        'recent_users': [
            {
                'username': u.username,
                'email': u.email,
                'wallet_balance': float(u.wallet_balance),
                'created_at': u.created_at.isoformat(),
            }
            for u in recent_users
        ],
        'recent_transactions': [
            {
                'id': str(t.id),
                'sender': t.sender.username,
                'receiver': t.receiver.username,
                'amount': float(t.amount),
                'status': t.status,
                'risk_score': float(t.risk_score),
                'created_at': t.created_at.isoformat(),
            }
            for t in recent_transactions
        ],
        'recent_logins': [
            {
                'username': l.username,
                'ip_address': l.ip_address,
                'risk_score': float(l.risk_score),
                'risk_level': l.risk_level,
                'status': l.status,
                'timestamp': l.timestamp.isoformat(),
            }
            for l in recent_logins
        ]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """
    Get all users for admin
    
    GET /api/admin/users/
    """
    if not request.user.is_superuser:
        return Response({
            'status': 'error',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all().order_by('-created_at')
    
    users_data = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'account_number': u.account_number,
            'wallet_balance': float(u.wallet_balance),
            'is_active': u.is_active,
            'created_at': u.created_at.isoformat(),
            'login_count': LoginAttempt.objects.filter(user=u, status='success').count(),
            'transaction_count': Transaction.objects.filter(sender=u).count(),
        }
        for u in users
    ]
    
    return Response({
        'status': 'success',
        'users': users_data,
        'total': len(users_data)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_transactions(request):
    """
    Get all transactions for admin
    
    GET /api/admin/transactions/
    """
    if not request.user.is_superuser:
        return Response({
            'status': 'error',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    transactions = Transaction.objects.all().order_by('-created_at')[:100]
    
    txns_data = [
        {
            'id': str(t.id),
            'sender': t.sender.username,
            'receiver': t.receiver.username,
            'amount': float(t.amount),
            'description': t.description,
            'status': t.status,
            'risk_score': float(t.risk_score),
            'risk_level': t.risk_level,
            'mfa_required': t.mfa_required,
            'created_at': t.created_at.isoformat(),
        }
        for t in transactions
    ]
    
    return Response({
        'status': 'success',
        'transactions': txns_data,
        'total': len(txns_data)
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP code
    
    POST /api/auth/resend-otp/
    Body: { session_id }
    """
    session_id = request.data.get('session_id')
    
    if not session_id:
        return Response({
            'status': 'error',
            'message': 'Session ID required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get login attempt
    try:
        login_attempt = LoginAttempt.objects.get(id=session_id)
    except LoginAttempt.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Invalid session'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = login_attempt.user
    
    # Generate new OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Mark old OTPs as used
    OTPVerification.objects.filter(
        login_attempt=login_attempt
    ).update(is_used=True)
    
    # Create new OTP
    otp_verification = OTPVerification.objects.create(
        login_attempt=login_attempt,
        otp_code=otp_code,
        otp_type='email',
        expires_at=timezone.now() + timedelta(minutes=10)
    )
    
    # Determine method
    use_sms = user.phone_number and len(user.phone_number) >= 10
    
    if use_sms:
        sms_sent = send_sms_otp(user.phone_number, otp_code)
        if sms_sent:
            otp_verification.otp_type = 'sms'
            otp_verification.save()
            print(f"📱 Resent SMS OTP to {user.phone_number}")
        else:
            use_sms = False
    
    if not use_sms:
        # Send email
        try:
            send_mail(
                subject='SecurePay - New Verification Code',
                message=f'''
Hello {user.username},

Here is your new verification code: {otp_code}

This code will expire in 10 minutes.

Best regards,
SecurePay Security Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            print(f"✅ Resent email OTP to {user.email}")
        except Exception as e:
            print(f"⚠️ Email error: {e}")
    
    print(f"📧 New OTP Code: {otp_code}")
    
    return Response({
        'status': 'success',
        'message': f'New verification code sent via {"SMS" if use_sms else "email"}',
        'mfa_method': 'sms' if use_sms else 'email'
    }, status=status.HTTP_200_OK)