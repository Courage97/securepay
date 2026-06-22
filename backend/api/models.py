from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Extended user model for SecurePay"""
    
    # Additional fields
    phone_number = models.CharField(max_length=15, blank=True)
    account_number = models.CharField(max_length=20, unique=True, blank=True)
    wallet_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    slug = models.SlugField(max_length=255, unique=True, blank=True)  
    
    # MFA fields
    totp_secret = models.CharField(max_length=32, blank=True)
    totp_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        # Auto-generate account number if not exists
        if not self.account_number:
            self.account_number = f"SP{str(uuid.uuid4().int)[:10]}"
        
        # Auto-generate slug from username if not exists
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.username)
        
        super().save(*args, **kwargs)


class LoginAttempt(models.Model):
    """Track all login attempts for ML analysis"""
    
    RISK_LEVELS = [
        (0, 'Low'),
        (1, 'Medium'),
        (2, 'High'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending MFA'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('blocked', 'Blocked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150)
    
    # Location & Device Info
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    user_agent = models.TextField()
    device_fingerprint = models.CharField(max_length=64, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # ML Features (simplified for now)
    risk_score = models.FloatField(default=0)
    risk_level = models.IntegerField(choices=RISK_LEVELS, default=0)
    
    # MFA
    mfa_required = models.BooleanField(default=False)
    mfa_completed = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.username} - {self.timestamp}"

class PasswordResetToken(models.Model):
    """Store password reset tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.is_used and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"{self.user.username} - {self.token[:10]}..."

class TrustedDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trusted_devices')
    device_fingerprint = models.CharField(max_length=64)  # ← Removed unique=True
    device_name = models.CharField(max_length=100)
    user_agent = models.TextField()
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    trust_score = models.FloatField(default=1.0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'device_fingerprint']  # This is enough
    
    def __str__(self):
        return f"{self.user.username} - {self.device_name}"

class TrustedLocation(models.Model):
    """Store user's typical login locations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trusted_locations')
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    login_count = models.IntegerField(default=1)
    
    class Meta:
        unique_together = ['user', 'latitude', 'longitude']
    
    def __str__(self):
        return f"{self.user.username} - {self.city}, {self.country}"


class OTPVerification(models.Model):
    """Store OTP codes for email/SMS verification"""
    login_attempt = models.ForeignKey(LoginAttempt, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=10)  # 'email' or 'sms'
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    
    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at and self.attempts < 3
    
    def __str__(self):
        return f"{self.login_attempt.username} - {self.otp_type} - {self.otp_code}"