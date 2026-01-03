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
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    job_title = serializers.CharField(write_only=True, required=False, allow_blank=True)
    date_of_joining = serializers.DateField(write_only=True, required=False, allow_null=True)
    status = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_active = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'employee_id', 'password', 'password2', 'role',
            'first_name', 'last_name', 'phone', 'department', 'job_title',
            'date_of_joining', 'status', 'is_active'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        # Extract profile-related fields before creating the user
        profile_fields = {
            'phone': validated_data.pop('phone', ''),
            'department': validated_data.pop('department', ''),
            'job_title': validated_data.pop('job_title', ''),
            'date_of_joining': validated_data.pop('date_of_joining', None),
        }

        status_raw = validated_data.pop('status', None)
        is_active_flag = validated_data.pop('is_active', None)
        validated_data.pop('password2')

        user = User.objects.create_user(**validated_data)

        # Apply status/is_active if provided
        if is_active_flag is not None:
            user.is_active = bool(is_active_flag)
            user.save()
        elif status_raw:
            normalized = str(status_raw).strip().lower()
            if normalized in ['inactive', 'disabled', 'false', '0']:
                user.is_active = False
                user.save()

        # Create linked employee profile
        EmployeeProfile.objects.create(
            user=user,
            full_name=f"{user.first_name} {user.last_name}".strip() or user.username,
            **profile_fields,
        )

        return user


class EmployeeProfileSerializer(serializers.ModelSerializer):
    """Employee Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EmployeeProfile
        fields = ['id', 'user', 'full_name', 'phone', 'address', 'profile_picture', 
                  'job_title', 'department', 'date_of_joining', 'resume', 'id_proof']
        read_only_fields = ['id']
