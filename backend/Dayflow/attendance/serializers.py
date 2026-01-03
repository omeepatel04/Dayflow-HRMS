from rest_framework import serializers
from .models import Attendance, AttendanceRegularization


class AttendanceSerializer(serializers.ModelSerializer):
    """Attendance Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'check_in_time', 
                  'check_out_time', 'status', 'is_late', 'is_early_departure',
                  'working_hours', 'overtime_hours', 'notes']
        read_only_fields = ['id', 'employee', 'is_late', 'is_early_departure', 
                           'working_hours', 'overtime_hours']
    
    def validate(self, attrs):
        # Prevent duplicate check-ins on same date
        if self.instance is None:  # Creating new record
            employee = self.context['request'].user
            date = attrs.get('date')
            if Attendance.objects.filter(employee=employee, date=date).exists():
                raise serializers.ValidationError("Attendance already marked for this date.")
        return attrs


class AttendanceRegularizationSerializer(serializers.ModelSerializer):
    """Attendance Regularization Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = AttendanceRegularization
        fields = ['id', 'employee', 'employee_name', 'date', 'requested_check_in',
                  'requested_check_out', 'reason', 'status', 'reviewed_by', 
                  'reviewed_by_name', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'employee', 'reviewed_by', 'reviewed_at', 'created_at']
