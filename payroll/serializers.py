from rest_framework import serializers
from .models import Payroll


class PayrollSerializer(serializers.ModelSerializer):
    """Payroll Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Payroll
        fields = ['id', 'employee', 'employee_name', 'basic_salary', 'allowances', 
                  'deductions', 'net_salary', 'month', 'month_display', 'created_on', 'updated_on']
        read_only_fields = ['id', 'net_salary', 'created_on', 'updated_on']
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class PayrollCreateSerializer(serializers.ModelSerializer):
    """Payroll Create Serializer (Admin/HR only)"""
    
    class Meta:
        model = Payroll
        fields = ['employee', 'basic_salary', 'allowances', 'deductions', 'month']
    
    def validate(self, attrs):
        # Check for duplicate payroll for same employee and month
        employee = attrs.get('employee')
        month = attrs.get('month')
        
        if self.instance is None:  # Creating new record
            if Payroll.objects.filter(employee=employee, month=month).exists():
                raise serializers.ValidationError("Payroll already exists for this employee and month.")
        
        return attrs
