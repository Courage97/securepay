from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'amount', 'status', 'risk_level', 'created_at']
    list_filter = ['status', 'risk_level', 'transaction_type', 'created_at']
    search_fields = ['sender__username', 'receiver__username', 'description']
    readonly_fields = ['id', 'created_at', 'completed_at']
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('id', 'sender', 'receiver', 'amount', 'description', 'transaction_type')
        }),
        ('Status', {
            'fields': ('status', 'created_at', 'completed_at')
        }),
        ('Security', {
            'fields': ('risk_score', 'risk_level', 'mfa_required', 'mfa_completed', 'ip_address', 'device_fingerprint')
        }),
        ('Balances', {
            'fields': ('sender_balance_before', 'sender_balance_after', 'receiver_balance_before', 'receiver_balance_after')
        }),
    )