from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/profile/', views.profile, name='profile'),
    path('auth/forgot-password/', views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', views.reset_password, name='reset_password'),
    path('auth/verify-mfa/', views.verify_mfa, name='verify_mfa'),
    path('auth/login-history/', views.login_history, name='login_history'),
    path('auth/resend-otp/', views.resend_otp, name='resend_otp'),

    # Admin endpoints
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/transactions/', views.admin_transactions, name='admin_transactions'),
    
]