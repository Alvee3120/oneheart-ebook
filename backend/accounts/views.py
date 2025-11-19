from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
)

User = get_user_model()


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
