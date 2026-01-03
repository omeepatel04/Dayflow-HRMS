from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """Notification Serializer"""
    
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'recipient_name', 'notification_type', 'title', 
                  'message', 'priority', 'is_read', 'read_at', 'related_object_type',
                  'related_object_id', 'action_url', 'created_at', 'time_ago']
        read_only_fields = ['id', 'recipient', 'created_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Get human-readable time difference"""
        from django.utils import timezone
        from datetime import datetime
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Notification Create Serializer"""
    
    class Meta:
        model = Notification
        fields = ['recipient', 'notification_type', 'title', 'message', 
                  'priority', 'related_object_type', 'related_object_id', 'action_url']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Notification Preference Serializer"""
    
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'email_notifications', 'leave_notifications',
                  'attendance_notifications', 'payroll_notifications', 
                  'general_notifications', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
