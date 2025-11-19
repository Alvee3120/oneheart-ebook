# backend/accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Profile, Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # You can add/remove fields as needed
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'phone', 'avatar', 'preferred_language', 'is_verified']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'line1',
            'line2',
            'city',
            'postal_code',
            'country',
            'is_default',
        ]


# Optional: simple registration serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    