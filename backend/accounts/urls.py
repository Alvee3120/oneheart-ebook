from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, MeView

urlpatterns = [
    # Register
    path('register/', RegisterView.as_view(), name='auth_register'),

    # JWT Login / Refresh
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Current user + profile
    path('me/', MeView.as_view(), name='auth_me'),
]
