from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to access their own attendance or admins.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.employee == request.user
