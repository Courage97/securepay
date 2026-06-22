from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.send_money, name='send_money'),
    path('history/', views.transaction_history, name='transaction_history'),
    path('add-funds/', views.add_funds, name='add_funds'),
    path('verify-mfa/', views.verify_transaction_mfa, name='verify_transaction_mfa')
]