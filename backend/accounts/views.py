from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from core.throttles import LoginThrottle

from .models import Profile,Address
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
    AddressSerializer
)

User = get_user_model()

class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginThrottle]
    
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Body: { "username": "", "email": "", "password": "" }
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """
    GET /api/auth/me/           -> get current user + profile
    PATCH /api/auth/me/         -> update profile fields only
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Ensure profile exists
        profile, _ = Profile.objects.get_or_create(user=user)

        user_data = UserSerializer(user).data
        profile_data = ProfileSerializer(profile).data

        return Response({
            "user": user_data,
            "profile": profile_data,
        })

    def patch(self, request, *args, **kwargs):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        # Only update profile fields, not user here
        profile_serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()

        user_data = UserSerializer(user).data

        return Response({
            "user": user_data,
            "profile": profile_serializer.data,
        })

class AddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/auth/addresses/       -> list current user's addresses
    POST /api/auth/addresses/       -> create a new address for current user
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only addresses of the logged-in user
        return Address.objects.filter(user=self.request.user).order_by(
            '-is_default', '-created_at'
        )

    def perform_create(self, serializer):
        # Save with current user
        address = serializer.save(user=self.request.user)

        # If this one is default, unset others
        if address.is_default:
            Address.objects.filter(
                user=self.request.user
            ).exclude(pk=address.pk).update(is_default=False)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/addresses/<id>/    -> retrieve one
    PUT    /api/auth/addresses/<id>/    -> full update
    PATCH  /api/auth/addresses/<id>/    -> partial update
    DELETE /api/auth/addresses/<id>/    -> delete
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only touch their own addresses
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        address = serializer.save()

        # If this one is now default, unset others
        if address.is_default:
            Address.objects.filter(
                user=self.request.user
            ).exclude(pk=address.pk).update(is_default=False)
