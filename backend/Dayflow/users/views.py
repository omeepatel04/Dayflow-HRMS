from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import User, EmployeeProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    EmployeeProfileSerializer
)


class UserRegistrationView(APIView):
    """Register a new user"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Get and update current user profile"""
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeProfileView(APIView):
    """Get and update employee profile"""
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            profile = user.profile
            serializer = EmployeeProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except EmployeeProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        profile, created = EmployeeProfile.objects.get_or_create(user=user)
        serializer = EmployeeProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Employee profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    """List all users (Admin/HR only)"""
    
    def get(self, request):
        role_filter = request.query_params.get('role', None)
        is_active = request.query_params.get('is_active', None)
        
        users = User.objects.all()
        
        if role_filter:
            users = users.filter(role=role_filter.upper())
        
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        serializer = UserSerializer(users, many=True)
        return Response({
            'count': users.count(),
            'users': serializer.data
        }, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    """Get, update, or delete a specific user (Admin/HR only)"""
    
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'User updated successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response({
            'message': 'User deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class EmployeeListView(APIView):
    """List all employees with profiles"""
    
    def get(self, request):
        department = request.query_params.get('department', None)
        
        profiles = EmployeeProfile.objects.select_related('user').all()
        
        if department:
            profiles = profiles.filter(department__icontains=department)
        
        serializer = EmployeeProfileSerializer(profiles, many=True)
        return Response({
            'count': profiles.count(),
            'employees': serializer.data
        }, status=status.HTTP_200_OK)
