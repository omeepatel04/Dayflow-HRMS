"""
Audit Logging Middleware
Tracks user actions for compliance and security auditing
"""
import logging
import json
from django.utils.deprecation import MiddlewareMixin
from datetime import datetime

logger = logging.getLogger('audit')


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log user actions for audit trail
    Tracks who did what, when, and from where
    """
    
    # Methods and paths that should be audited
    AUDITABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    SENSITIVE_PATHS = [
        '/users/register/',
        '/users/login/',
        '/leaves/',
        '/payroll/',
        '/attendance/',
    ]
    
    def process_response(self, request, response):
        """Log auditable actions after successful response"""
        
        # Only audit specific methods
        if request.method not in self.AUDITABLE_METHODS:
            return response
        
        # Only audit if user is authenticated
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return response
        
        # Check if path should be audited
        should_audit = any(
            request.path.startswith(path) 
            for path in self.SENSITIVE_PATHS
        )
        
        if should_audit and response.status_code < 400:
            self.log_audit_event(request, response)
        
        return response
    
    def log_audit_event(self, request, response):
        """Create detailed audit log entry"""
        user = request.user
        
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'user_id': user.id,
            'username': user.username,
            'employee_id': getattr(user, 'employee_id', None),
            'action': request.method,
            'resource': request.path,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200],
            'status_code': response.status_code,
        }
        
        # Add request data for POST/PUT/PATCH
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.content_type == 'application/json' and request.body:
                    body = json.loads(request.body)
                    # Sanitize sensitive data
                    sanitized_body = self.sanitize_data(body)
                    audit_entry['request_data'] = sanitized_body
            except Exception:
                pass
        
        # Log as structured JSON
        logger.info(json.dumps(audit_entry))
    
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
        """Remove sensitive information before logging"""
        if not isinstance(data, dict):
            return data
        
        sensitive_fields = [
            'password', 'password2', 'token', 'secret', 
            'api_key', 'access_token', 'refresh_token'
        ]
        
        sanitized = {}
        for key, value in data.items():
            if key.lower() in sensitive_fields:
                sanitized[key] = '***REDACTED***'
            elif isinstance(value, dict):
                sanitized[key] = AuditLoggingMiddleware.sanitize_data(value)
            else:
                sanitized[key] = value
        
        return sanitized
