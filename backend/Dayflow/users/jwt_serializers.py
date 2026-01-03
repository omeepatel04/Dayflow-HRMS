"""
Custom JWT Token Serializers
Adds custom claims like role and employee_id to JWT tokens
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


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
