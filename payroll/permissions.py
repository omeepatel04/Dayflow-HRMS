from rest_framework import permissions


class IsPayrollOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to view their own payroll or admins to manage all.
    """
    
    def has_permission(self, request, view):
        # Admin/HR can do anything
        if request.user.role in ['ADMIN', 'HR']:
            return True
        
        # Employees can only read (GET)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.employee == request.user and request.method in permissions.SAFE_METHODS
