from rest_framework import permissions


class IsAdminOrHR(permissions.BasePermission):
    """Only Admin or HR can access"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['ADMIN', 'HR']


class IsEmployee(permissions.BasePermission):
    """Only Employees can access"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'EMPLOYEE'


class IsSelfOrAdmin(permissions.BasePermission):
    """Users can access their own data or Admins can access all"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.user == request.user or obj == request.user


class IsOwnerOrAdmin(permissions.BasePermission):
    """Users can access their own records or Admins access all"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.employee == request.user
