from rest_framework import serializers
from .models import Payroll, PayrollComponent, PayrollDetail, SalaryStructure


class PayrollComponentSerializer(serializers.ModelSerializer):
    """Payroll Component Serializer"""
    
    class Meta:
        model = PayrollComponent
        fields = ['id', 'name', 'component_type', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PayrollDetailSerializer(serializers.ModelSerializer):
    """Payroll Detail Serializer"""
    
    component_name = serializers.CharField(source='component.name', read_only=True)
    component_type = serializers.CharField(source='component.component_type', read_only=True)
    
    class Meta:
        model = PayrollDetail
        fields = ['id', 'component', 'component_name', 'component_type', 'amount']
        read_only_fields = ['id']


class PayrollSerializer(serializers.ModelSerializer):
    """Payroll Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    month_display = serializers.SerializerMethodField()
    details = PayrollDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payroll
        fields = ['id', 'employee', 'employee_name', 'employee_id', 'basic_salary', 
                  'allowances', 'deductions', 'gross_salary', 'tax', 'net_salary', 
                  'month', 'month_display', 'status', 'payment_date', 'notes',
                  'details', 'created_on', 'updated_on']
        read_only_fields = ['id', 'gross_salary', 'net_salary', 'created_on', 'updated_on']
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class PayrollCreateSerializer(serializers.ModelSerializer):
    """Payroll Create Serializer (Admin/HR only)"""
    
    class Meta:
        model = Payroll
        fields = ['employee', 'basic_salary', 'allowances', 'deductions', 
                  'tax', 'month', 'status', 'payment_date', 'notes']
    
    def validate(self, attrs):
        employee = attrs.get('employee')
        month = attrs.get('month')
        
        if self.instance is None:  # Creating new record
            if Payroll.objects.filter(employee=employee, month=month).exists():
                raise serializers.ValidationError("Payroll already exists for this employee and month.")
        
        return attrs


class SalaryStructureSerializer(serializers.ModelSerializer):
    """Salary Structure Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    total_allowances = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_deductions = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    gross_salary_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='gross_salary')
    net_salary_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='net_salary')
    
    class Meta:
        model = SalaryStructure
        fields = ['id', 'employee', 'employee_name', 'basic_salary', 'hra', 
                  'transport_allowance', 'medical_allowance', 'special_allowance',
                  'provident_fund', 'professional_tax', 'income_tax',
                  'total_allowances', 'total_deductions', 'gross_salary_amount',
                  'net_salary_amount', 'effective_from', 'is_active',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
