from django.contrib import admin
from .models import User, EmployeeProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin panel for User model"""
    list_display = ['username', 'employee_id', 'email', 'role', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'employee_id', 'first_name', 'last_name']
    readonly_fields = ['date_joined', 'last_login']
    fieldsets = (
        ('Personal Info', {'fields': ('username', 'email', 'first_name', 'last_name')}),
        ('Employee Info', {'fields': ('employee_id', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('date_joined', 'last_login')}),
    )
    ordering = ['-date_joined']


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    """Admin panel for EmployeeProfile model"""
    list_display = ['full_name', 'user', 'job_title', 'department', 'date_of_joining']
    list_filter = ['department', 'date_of_joining']
    search_fields = ['full_name', 'user__username', 'job_title', 'department']
    readonly_fields = ['user']
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'address', 'profile_picture')}),
        ('Job Info', {'fields': ('job_title', 'department', 'date_of_joining')}),
    )
    ordering = ['-date_of_joining']
