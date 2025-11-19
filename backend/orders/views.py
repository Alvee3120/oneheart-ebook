# backend/orders/views.py

import uuid
from decimal import Decimal

from django.utils import timezone
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemAddSerializer, OrderSerializer
from accounts.models import Address
from downloads.models import PurchaseItem
from payments.models import Payment


def generate_order_number() -> str:
    """
    Simple order number generator.
    You can replace with something like: EBOOK-YYYYMMDD-XXXX
    """
    return uuid.uuid4().hex[:12].upper()


def get_or_create_user_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """
    GET /api/cart/   -> current user's cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(APIView):
    """
    POST /api/cart/items/
    Body: { "book_id": 1, "quantity": 1 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        serializer = CartItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book = serializer.validated_data['book']
        quantity = serializer.validated_data['quantity']

        # unit price from book.effective_price
        unit_price = Decimal(book.effective_price)

        # if already in cart, increase quantity
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            book=book,
            defaults={'quantity': quantity, 'unit_price': unit_price},
        )
        if not created:
            item.quantity += quantity
            item.unit_price = unit_price
            item.save()

        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)


class CartItemUpdateView(APIView):
    """
    PATCH /api/cart/items/<id>/
    Body: { "quantity": 2 }

    DELETE /api/cart/items/<id>/
    -> remove item
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            item = CartItem.objects.select_related('cart').get(
                pk=pk,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response({'detail': 'Quantity must be an integer.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        cart = get_or_create_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request, pk, *args, **kwargs):
        try:
            item = CartItem.objects.select_related('cart').get(
                pk=pk,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        cart = item.cart
        item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CheckoutView(APIView):
    """
    POST /api/checkout/
    Body (optional):
    {
      "billing_address_id": 1,
      "payment_method": "bkash"
    }

    For now:
    - creates Order
    - creates OrderItems
    - marks Order as PAID immediately (fake payment success)
    - creates PurchaseItem (user owns ebooks)
    - clears cart
    - creates Payment record with status SUCCESS
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        cart = get_or_create_user_cart(user)
        cart_items = cart.items.select_related('book')

        if not cart_items.exists():
            return Response(
                {'detail': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        billing_address = None
        billing_address_id = request.data.get('billing_address_id')
        if billing_address_id:
            billing_address = Address.objects.filter(
                id=billing_address_id,
                user=user
            ).first()

        payment_method = request.data.get('payment_method', '')

        # calculate total
        total = Decimal('0.00')
        for item in cart_items:
            total += item.subtotal

        order = Order.objects.create(
            user=user,
            order_number=generate_order_number(),
            status=Order.Status.PAID,   # pretend success for now
            total_amount=total,
            currency='BDT',
            payment_method=payment_method,
            billing_address=billing_address,
            paid_at=timezone.now(),
        )

        # create order items + purchase items
        for item in cart_items:
            order_item = OrderItem.objects.create(
                order=order,
                book=item.book,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            PurchaseItem.objects.create(
                user=user,
                book=item.book,
                order_item=order_item,
                download_limit=None,  # unlimited for now
            )

        # clear cart
        cart_items.delete()

        # create payment record (fake success)
        Payment.objects.create(
            order=order,
            gateway=Payment.Gateway.OTHER,
            amount=total,
            currency='BDT',
            status=Payment.Status.SUCCESS,
        )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    -> list current user's orders
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (Order.objects
                .filter(user=self.request.user)
                .order_by('-created_at'))


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
