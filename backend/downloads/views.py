from datetime import timedelta
import secrets

from django.conf import settings
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PurchaseItem, DownloadLink, DownloadLog
from .serializers import PurchaseItemSerializer

class LibraryListView(generics.ListAPIView):
    """
    GET /api/library/
    -> list of ebooks the current user owns
    """
    serializer_class = PurchaseItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (PurchaseItem.objects
                .filter(user=self.request.user, is_active=True)
                .select_related('book'))

class GenerateDownloadLinkView(APIView):
    """
    POST /api/library/<int:pk>/download-link/
    pk = PurchaseItem id

    Returns:
    {
      "token": "...",
      "url": "http://127.0.0.1:8000/api/download/<token>/",
      "expires_at": "..."
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        purchase_item = get_object_or_404(
            PurchaseItem,
            pk=pk,
            user=request.user,
            is_active=True,
        )

        if not purchase_item.can_download():
            return Response(
                {"detail": "Download limit reached."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # create short-lived token (10 minutes)
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(minutes=10)

        link = DownloadLink.objects.create(
            purchase_item=purchase_item,
            token=token,
            expires_at=expires_at,
            is_used_once=False,  # if you want one-time links, set True and handle below
        )

        url = request.build_absolute_uri(f"/api/download/{link.token}/")

        return Response(
            {
                "token": link.token,
                "url": url,
                "expires_at": link.expires_at,
            },
            status=status.HTTP_201_CREATED,
        )
class DownloadEbookView(APIView):
    """
    GET /api/download/<token>/
    Needs:
      - valid token
      - logged-in owner user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, token, *args, **kwargs):
        link = get_object_or_404(DownloadLink, token=token)
        purchase_item = link.purchase_item

        # Ensure the link belongs to the current user
        if purchase_item.user != request.user:
            raise Http404("Not found")

        # Check token validity & expiry
        if not link.is_valid():
            return Response(
                {"detail": "Download link has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check download limit
        if not purchase_item.can_download():
            return Response(
                {"detail": "Download limit reached."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        book_file = purchase_item.book.file
        if not book_file:
            raise Http404("File not found.")

        # Log the download
        DownloadLog.objects.create(
            purchase_item=purchase_item,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        # Increase download counter
        purchase_item.downloads_count = (purchase_item.downloads_count or 0) + 1
        purchase_item.save(update_fields=["downloads_count"])

        # If one-time links, you can delete or mark as used:
        if link.is_used_once:
            link.delete()

        # Stream the file
        # filename will be last part of path: books/files/xxx.pdf -> xxx.pdf
        filename = book_file.name.split("/")[-1]
        return FileResponse(
            book_file.open("rb"),
            as_attachment=True,
            filename=filename,
        )
