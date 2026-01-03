from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    """Attendance Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'check_in_time', 
                  'check_out_time', 'status']
        read_only_fields = ['id', 'employee']
    
    def validate(self, attrs):
        # Prevent duplicate check-ins
        if self.instance is None:  # Creating new record
            employee = self.context['request'].user
            date = attrs.get('date')
            if Attendance.objects.filter(employee=employee, date=date).exists():
                raise serializers.ValidationError("Attendance already marked for this date.")
        return attrs
