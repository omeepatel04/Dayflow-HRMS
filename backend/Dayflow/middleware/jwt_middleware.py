"""
JWT Enhancement Middleware
Provides additional JWT token handling and validation
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

logger = logging.getLogger(__name__)


class JWTMiddleware(MiddlewareMixin):
    """
    Middleware to enhance JWT token handling
    - Validates tokens on protected endpoints
    - Adds user context from token
    - Handles token expiration gracefully
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = [
        '/users/register/',
        '/users/login/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """Validate JWT token on protected endpoints"""
        
        # Skip public paths
        if any(request.path.startswith(path) for path in self.PUBLIC_PATHS):
            return None
        
        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            # No token provided - let DRF handle it
            return None
        
        # Parse Bearer token
        try:
            if not auth_header.startswith('Bearer '):
                return None
            
            token_string = auth_header.split(' ')[1]
            
            # Validate token
            token = AccessToken(token_string)
            
            # Add token info to request
            request.jwt_token = token
            request.jwt_user_id = token.get('user_id')
            
            # Log token usage for monitoring
            logger.debug(f"JWT validated for user_id: {token.get('user_id')}")
            
        except (TokenError, InvalidToken) as e:
            logger.warning(f"Invalid JWT token: {str(e)}")
            return JsonResponse({
                'error': 'Invalid or expired token',
                'detail': str(e)
            }, status=401)
        except Exception as e:
            logger.error(f"JWT middleware error: {str(e)}")
            # Don't block request on middleware errors
            return None
        
        return None
    
    def process_response(self, request, response):
        """Add token expiration info to response headers"""
        if hasattr(request, 'jwt_token'):
            token = request.jwt_token
            exp_timestamp = token.get('exp')
            
            if exp_timestamp:
                # Add token expiration time to response header
                response['X-Token-Expires-At'] = str(exp_timestamp)
        
        return response
