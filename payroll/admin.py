from django.contrib import admin
from .models import Payroll


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ['employee', 'month', 'basic_salary', 'allowances', 'deductions', 'net_salary']
    list_filter = ['month']
    search_fields = ['employee__username', 'employee__employee_id']
    date_hierarchy = 'month'
