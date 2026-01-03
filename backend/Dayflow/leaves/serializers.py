from rest_framework import serializers
from .models import Leave


class LeaveSerializer(serializers.ModelSerializer):
    """Leave Serializer"""
    
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Leave
        fields = ['id', 'employee', 'employee_name', 'leave_type', 'start_date', 
                  'end_date', 'reason', 'status', 'admin_comment', 'applied_on', 'updated_on']
        read_only_fields = ['id', 'employee', 'status', 'admin_comment', 'applied_on', 'updated_on']
    
    def validate(self, attrs):
        # Normalize type to uppercase to accept case-insensitive inputs
        leave_type = attrs.get('leave_type')
        if leave_type:
            attrs['leave_type'] = leave_type.upper()
            valid_types = {choice[0] for choice in Leave.LEAVE_TYPE_CHOICES}
            if attrs['leave_type'] not in valid_types:
                raise serializers.ValidationError({
                    'leave_type': [f"Invalid leave_type. Must be one of {sorted(valid_types)}."]
                })
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date must be before or equal to end date.")
        
        return attrs


class LeaveApprovalSerializer(serializers.ModelSerializer):
    """Leave Approval Serializer (Admin/HR only)"""
    
    class Meta:
        model = Leave
        fields = ['status', 'admin_comment']
    
    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError("Status must be either APPROVED or REJECTED.")
        return value
