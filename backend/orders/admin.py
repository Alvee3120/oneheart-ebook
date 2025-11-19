from django.contrib import admin
from . models import OrderItem, Order, Cart, CartItem
# Register your models here.
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)