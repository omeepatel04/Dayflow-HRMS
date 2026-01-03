"""
Request Logging Middleware
Logs all incoming requests and responses for debugging and monitoring
"""
import logging
import time
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all HTTP requests and responses
    Tracks request method, path, user, duration, and status code
    """
    
    def process_request(self, request):
        """Called on each request, before Django decides which view to execute"""
        request.start_time = time.time()
        
        # Log request details
        user = getattr(request, 'user', None)
        username = user.username if user and user.is_authenticated else 'Anonymous'
        
        logger.info(
            f"REQUEST | {request.method} {request.path} | User: {username} | "
            f"IP: {self.get_client_ip(request)}"
        )
        
        # Log request body for POST/PUT/PATCH (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH'] and request.content_type == 'application/json':
            try:
                body = json.loads(request.body) if request.body else {}
                # Remove sensitive fields from logging
                safe_body = self.sanitize_data(body)
                logger.debug(f"REQUEST BODY | {json.dumps(safe_body)}")
            except Exception as e:
                logger.debug(f"Could not parse request body: {e}")
    
    def process_response(self, request, response):
        """Called on each response"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            user = getattr(request, 'user', None)
            username = user.username if user and user.is_authenticated else 'Anonymous'
            
            logger.info(
                f"RESPONSE | {request.method} {request.path} | "
                f"Status: {response.status_code} | Duration: {duration:.2f}s | "
                f"User: {username}"
            )
            
            # Add custom header with request duration
            response['X-Request-Duration'] = f"{duration:.3f}s"
        
        return response
    
    def process_exception(self, request, exception):
        """Called when a view raises an exception"""
        user = getattr(request, 'user', None)
        username = user.username if user and user.is_authenticated else 'Anonymous'
        
        logger.error(
            f"EXCEPTION | {request.method} {request.path} | "
            f"User: {username} | Error: {str(exception)}",
            exc_info=True
        )
    
    @staticmethod
    def get_client_ip(request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def sanitize_data(data):
        """Remove sensitive information from data before logging"""
        if not isinstance(data, dict):
            return data
        
        sensitive_fields = ['password', 'password2', 'token', 'secret', 'api_key']
        sanitized = data.copy()
        
        for field in sensitive_fields:
            if field in sanitized:
                sanitized[field] = '***REDACTED***'
        
        return sanitized
