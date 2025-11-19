# backend/payments/serializers.py
from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'gateway',
            'amount',
            'currency',
            'gateway_transaction_id',
            'status',
            'raw_response',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
