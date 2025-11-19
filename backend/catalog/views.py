# backend/catalog/views.py

from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Author, Category, Tag, Book
from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    TagSerializer,
    BookListSerializer,
    BookDetailSerializer,
)


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/books/  -> list books
    GET /api/books/<slug>/  -> single book detail
    Supports:
      - search: ?search=python
      - filter by category: ?category=slug
      - filter by tag: ?tag=slug
      - ordering: ?ordering=price or -price
    """

    queryset = Book.objects.filter(is_published=True).prefetch_related(
        "authors", "categories", "tags"
    )

    permission_classes = [permissions.AllowAny]

    # Filter/Search
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ["title", "description", "authors__name", "tags__name"]
    ordering_fields = ["price", "created_at"]
    filterset_fields = ["categories__slug", "tags__slug", "file_format"]

    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BookDetailSerializer
        return BookListSerializer
