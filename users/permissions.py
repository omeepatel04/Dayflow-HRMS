from rest_framework import permissions


class IsAdminOrHR(permissions.BasePermission):
    """
    Custom permission to only allow admins or HR to access.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['ADMIN', 'HR']


class IsEmployee(permissions.BasePermission):
    """
    Custom permission to only allow employees.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'EMPLOYEE'


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to access their own data or admins.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.user == request.user or obj == request.user
