from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, EmployeeProfile


class UserSerializer(serializers.ModelSerializer):
    """User Serializer for API responses"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'employee_id', 'role', 'is_active', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User Registration Serializer"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'employee_id', 'password', 'password2', 'role', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class EmployeeProfileSerializer(serializers.ModelSerializer):
    """Employee Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EmployeeProfile
        fields = ['id', 'user', 'full_name', 'phone', 'address', 'profile_picture', 
                  'job_title', 'department', 'date_of_joining']
        read_only_fields = ['id']
