"""
Custom JWT Token Serializers
Adds custom claims like role and employee_id to JWT tokens
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer to add additional user information to token claims
    """
    
    @classmethod
    def get_token(cls, user):
        """
        Add custom claims to JWT token
        """
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['employee_id'] = user.employee_id
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        return token
    
    def validate(self, attrs):
        """
        Validate credentials and return tokens with user data
        """
        # Allow login via username, email, or employee_id by normalizing to username
        identifier = attrs.get(self.username_field)
        if identifier:
            User = get_user_model()
            try:
                # Match by email
                user = User.objects.filter(email__iexact=identifier).first()
                # If not found by email, try employee_id
                if not user:
                    user = User.objects.filter(employee_id__iexact=identifier).first()
                # If found, replace the identifier with actual username
                if user:
                    attrs[self.username_field] = user.get_username()
            except Exception:
                # Fallback to default behavior if lookup fails
                pass

        data = super().validate(attrs)
        
        # Add user information to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'employee_id': self.user.employee_id,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view using our custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer
