"""
Custom Permission Classes for RBAC (Role-Based Access Control)
Implements comprehensive permission logic for different user roles: EMPLOYEE, HR, ADMIN
"""
from rest_framework import permissions


class IsAdminOrHR(permissions.BasePermission):
    """Only Admin or HR can access"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['ADMIN', 'HR']


class IsAdminOnly(permissions.BasePermission):
    """Only ADMIN users can access - for critical operations"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'ADMIN'


class IsEmployee(permissions.BasePermission):
    """Only Employees can access"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'EMPLOYEE'


class IsSelfOrAdmin(permissions.BasePermission):
    """Users can access their own data or Admins can access all"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        return obj.user == request.user or obj == request.user


class IsOwnerOrAdmin(permissions.BasePermission):
    """Users can access their own records or Admins access all"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'HR']:
            return True
        
        # Handle different object structures
        if hasattr(obj, 'employee'):
            return obj.employee == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class ReadOnlyForEmployees(permissions.BasePermission):
    """
    HR/ADMIN have full access, EMPLOYEE have read-only access
    Used for payroll - employees can view but not modify
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # HR and ADMIN have full access
        if request.user.role in ['HR', 'ADMIN']:
            return True
        
        # Employees have read-only access
        return request.method in permissions.SAFE_METHODS
    
    def has_object_permission(self, request, view, obj):
        # HR and ADMIN have full access
        if request.user.role in ['HR', 'ADMIN']:
            return True
        
        # Employees can only read their own data
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'employee'):
                return obj.employee == request.user
            if hasattr(obj, 'user'):
                return obj.user == request.user
        
        return False


class CanApproveLeaves(permissions.BasePermission):
    """Only HR and ADMIN can approve/reject leaves"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['HR', 'ADMIN']


class CanModifyAttendance(permissions.BasePermission):
    """
    Employees can check-in/out for themselves
    HR/ADMIN can modify any attendance
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['HR', 'ADMIN']:
            return True
        
        if hasattr(obj, 'employee'):
            return obj.employee == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
