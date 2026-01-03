from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, EmployeeProfile
from .serializers import UserRegistrationSerializer, UserSerializer, EmployeeProfileSerializer
from .permissions import IsAdminOrHR, IsSelfOrAdmin


class UserRegistrationView(generics.CreateAPIView):
    """User Registration API"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User Profile View API"""
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]
    
    def get_object(self):
        return self.request.user


class EmployeeProfileView(generics.RetrieveUpdateAPIView):
    """Employee Profile API"""
    
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]
    
    def get_object(self):
        return EmployeeProfile.objects.get(user=self.request.user)


class EmployeeListView(generics.ListAPIView):
    """Employee List API (Admin/HR only)"""
    
    queryset = EmployeeProfile.objects.all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]
