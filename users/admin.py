from django.contrib import admin
from .models import User, EmployeeProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'employee_id', 'email', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'employee_id', 'email']


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'job_title', 'department', 'date_of_joining']
    list_filter = ['department', 'date_of_joining']
    search_fields = ['full_name', 'job_title']
