from django.contrib import admin
from . models import Coupon, CouponRedemption
# Register your models here.
admin.site.register(Coupon)
admin.site.register(CouponRedemption)