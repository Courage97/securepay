from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Transaction(models.Model):
    """Transaction model for money transfers"""
    
    TRANSACTION_TYPES = [
        ('send', 'Send Money'),
        ('receive', 'Receive Money'),
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('blocked', 'Blocked'),
    ]
    
    RISK_LEVELS = [
        (0, 'Low'),
        (1, 'Medium'),
        (2, 'High'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Sender and receiver
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_transactions'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_transactions'
    )
    
    # Transaction details
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default='send')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Balances after transaction
    sender_balance_before = models.DecimalField(max_digits=12, decimal_places=2)
    sender_balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    receiver_balance_before = models.DecimalField(max_digits=12, decimal_places=2)
    receiver_balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Security
    risk_score = models.FloatField(default=0)
    risk_level = models.IntegerField(choices=RISK_LEVELS, default=0)
    mfa_required = models.BooleanField(default=False)
    mfa_completed = models.BooleanField(default=False)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_fingerprint = models.CharField(max_length=64, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['receiver', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}: ₦{self.amount}"