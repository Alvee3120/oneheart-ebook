from django.db import models
from core.models import TimeStampedModel
from orders.models import Order


class Payment(TimeStampedModel):
    class Status(models.TextChoices):
        INITIATED = 'initiated'
        SUCCESS = 'success'
        FAILED = 'failed'
        PENDING = 'pending'

    class Gateway(models.TextChoices):
        SSLCOMMERZ = 'sslcommerz'
        BKASH = 'bkash'
        STRIPE = 'stripe'
        OTHER = 'other'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')

    gateway = models.CharField(max_length=50, choices=Gateway.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=20, default="BDT")

    gateway_transaction_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)

    raw_response = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Payment for {self.order.order_number}"
