from django.contrib import admin
from . models import DownloadLink,DownloadLog,PurchaseItem
# Register your models here.
admin.site.register(DownloadLog)
admin.site.register(DownloadLink)
admin.site.register(PurchaseItem)