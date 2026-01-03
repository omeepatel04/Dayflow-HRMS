from django.contrib import admin
from .models import Leave


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status', 'applied_on']
    list_filter = ['leave_type', 'status', 'applied_on']
    search_fields = ['employee__username', 'employee__employee_id']
    date_hierarchy = 'applied_on'
