from django.contrib import admin
from .models import Leave


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    """Admin panel for Leave model"""
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status', 'applied_on']
    list_filter = ['leave_type', 'status', 'applied_on']
    search_fields = ['employee__username', 'employee__employee_id', 'reason']
    readonly_fields = ['employee', 'applied_on', 'updated_on']
    date_hierarchy = 'applied_on'
    fieldsets = (
        ('Employee', {'fields': ('employee',)}),
        ('Leave Details', {'fields': ('leave_type', 'start_date', 'end_date', 'reason')}),
        ('Status', {'fields': ('status', 'admin_comment')}),
        ('Timestamps', {'fields': ('applied_on', 'updated_on')}),
    )
    ordering = ['-applied_on']
