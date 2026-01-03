from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'check_in_time', 'check_out_time', 'status']
    list_filter = ['status', 'date']
    search_fields = ['employee__username', 'employee__employee_id']
    date_hierarchy = 'date'
