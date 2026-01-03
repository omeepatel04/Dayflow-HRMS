from django.contrib import admin
from .models import Payroll


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    """Admin panel for Payroll model"""
    list_display = ['employee', 'month', 'basic_salary', 'allowances', 'deductions', 'net_salary']
    list_filter = ['month']
    search_fields = ['employee__username', 'employee__employee_id']
    readonly_fields = ['net_salary', 'created_on', 'updated_on']
    date_hierarchy = 'month'
    fieldsets = (
        ('Employee', {'fields': ('employee',)}),
        ('Salary Components', {'fields': ('basic_salary', 'allowances', 'deductions')}),
        ('Net Salary', {'fields': ('net_salary',)}),
        ('Period', {'fields': ('month',)}),
        ('Timestamps', {'fields': ('created_on', 'updated_on')}),
    )
    ordering = ['-month']
