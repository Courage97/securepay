from django.contrib import admin
from .models import User, LoginAttempt, PasswordResetToken, TrustedDevice, TrustedLocation

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'account_number', 'wallet_balance', 'totp_enabled', 'created_at']
    search_fields = ['username', 'email', 'account_number']
    list_filter = ['totp_enabled', 'created_at']
    readonly_fields = ['account_number', 'slug', 'created_at', 'updated_at']


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ['username', 'ip_address', 'risk_level', 'status', 'timestamp']
    list_filter = ['risk_level', 'status', 'timestamp']
    search_fields = ['username', 'ip_address']
    readonly_fields = ['id', 'timestamp']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']


@admin.register(TrustedDevice)
class TrustedDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'trust_score', 'is_active', 'last_seen']
    list_filter = ['is_active', 'first_seen']
    search_fields = ['user__username', 'device_name']


@admin.register(TrustedLocation)
class TrustedLocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'country', 'login_count', 'last_seen']
    list_filter = ['country', 'first_seen']
    search_fields = ['user__username', 'city', 'country']