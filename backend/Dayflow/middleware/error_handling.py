"""
Error Handling Middleware
Provides consistent error responses and handles uncaught exceptions
"""
import logging
import traceback
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Middleware to handle all uncaught exceptions and return consistent JSON error responses
    """
    
    def process_exception(self, request, exception):
        """
        Handle uncaught exceptions and return formatted JSON response
        """
        # Log the full exception traceback
        logger.error(
            f"Unhandled exception in {request.method} {request.path}: {str(exception)}",
            exc_info=True
        )
        
        # Get exception details
        error_type = type(exception).__name__
        error_message = str(exception)
        
        # Determine appropriate status code
        status_code = self.get_status_code(exception)
        
        # Build error response
        error_response = {
            'error': True,
            'error_type': error_type,
            'message': error_message,
            'path': request.path,
            'method': request.method,
        }
        
        # Add traceback in debug mode
        from django.conf import settings
        if settings.DEBUG:
            error_response['traceback'] = traceback.format_exc()
        
        return JsonResponse(
            error_response,
            status=status_code,
            safe=False
        )
    
    @staticmethod
    def get_status_code(exception):
        """
        Determine appropriate HTTP status code based on exception type
        """
        from django.core.exceptions import (
            PermissionDenied, 
            ObjectDoesNotExist,
            ValidationError
        )
        from rest_framework.exceptions import APIException
        
        # Map exception types to status codes
        if isinstance(exception, PermissionDenied):
            return status.HTTP_403_FORBIDDEN
        elif isinstance(exception, ObjectDoesNotExist):
            return status.HTTP_404_NOT_FOUND
        elif isinstance(exception, ValidationError):
            return status.HTTP_400_BAD_REQUEST
        elif isinstance(exception, APIException):
            return exception.status_code
        else:
            return status.HTTP_500_INTERNAL_SERVER_ERROR
