# backend/downloads/serializers.py
from rest_framework import serializers

from .models import PurchaseItem, DownloadLog, DownloadLink
from catalog.serializers import BookListSerializer


class PurchaseItemSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    can_download = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            'id',
            'book',
            'purchased_at',
            'download_limit',
            'downloads_count',
            'is_active',
            'can_download',
        ]

    def get_can_download(self, obj):
        return obj.can_download()


class DownloadLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DownloadLog
        fields = [
            'id',
            'purchase_item',
            'ip_address',
            'user_agent',
            'downloaded_at',
        ]


class DownloadLinkSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = DownloadLink
        fields = [
            'id',
            'purchase_item',
            'token',
            'expires_at',
            'is_used_once',
            'is_valid',
        ]

    def get_is_valid(self, obj):
        return obj.is_valid()
