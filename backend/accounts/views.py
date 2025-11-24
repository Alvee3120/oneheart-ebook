from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from core.throttles import LoginThrottle
from rest_framework.permissions import IsAuthenticated
from .models import Profile,Address
from .serializers import RegisterSerializer,UserSerializer,ProfileSerializer,AddressSerializer, MeSerializer

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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .serializers import MeSerializer
        profile = request.user.profile
        addresses = Address.objects.filter(user=request.user)

        serializer = MeSerializer({
            "user": request.user,
            "profile": profile,
            "addresses": addresses,
        })

        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        profile = user.profile

        # update user fields
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()

        # update profile fields
        profile.phone = request.data.get("phone", profile.phone)
        profile.preferred_language = request.data.get("preferred_language", profile.preferred_language)
        profile.save()

        addresses = Address.objects.filter(user=user)

        data = {
            "user": UserSerializer(user).data,
            "profile": ProfileSerializer(profile).data,
            "addresses": AddressSerializer(addresses, many=True).data,
        }
        return Response(data)

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
