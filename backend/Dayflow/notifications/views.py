from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer,
    NotificationPreferenceSerializer
)
from users.permissions import IsAdminOrHR


class MyNotificationsView(APIView):
    """Get current user's notifications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Filter parameters
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        notification_type = request.query_params.get('type', None)
        
        notifications = Notification.objects.filter(recipient=user)
        
        if unread_only:
            notifications = notifications.filter(is_read=False)
        
        if notification_type:
            notifications = notifications.filter(notification_type=notification_type.upper())
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'count': notifications.count(),
            'unread_count': Notification.objects.filter(recipient=user, is_read=False).count(),
            'notifications': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationDetailView(APIView):
    """Get or mark notification as read"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        
        # Auto-mark as read when retrieved
        if not notification.is_read:
            notification.mark_as_read()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        """Mark notification as read/unread"""
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        
        is_read = request.data.get('is_read', True)
        
        if is_read and not notification.is_read:
            notification.mark_as_read()
        elif not is_read and notification.is_read:
            notification.is_read = False
            notification.read_at = None
            notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        """Delete notification"""
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.delete()
        return Response({
            'message': 'Notification deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class MarkAllReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        notifications = Notification.objects.filter(recipient=user, is_read=False)
        count = notifications.count()
        
        notifications.update(is_read=True, read_at=timezone.now())
        
        return Response({
            'message': f'{count} notification(s) marked as read'
        }, status=status.HTTP_200_OK)


class CreateNotificationView(APIView):
    """Create notification (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def post(self, request):
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            notification = serializer.save()
            return Response({
                'message': 'Notification created successfully',
                'notification': NotificationSerializer(notification).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BroadcastNotificationView(APIView):
    """Broadcast notification to all users or specific role (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def post(self, request):
        title = request.data.get('title')
        message = request.data.get('message')
        role = request.data.get('role', None)  # Optional: filter by role
        priority = request.data.get('priority', 'MEDIUM')
        notification_type = request.data.get('notification_type', 'GENERAL')
        
        if not title or not message:
            return Response({
                'error': 'Title and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from users.models import User
        
        # Get recipients
        users = User.objects.all()
        if role:
            users = users.filter(role=role.upper())
        
        # Create notifications for all users
        notifications = []
        for user in users:
            notification = Notification.objects.create(
                recipient=user,
                title=title,
                message=message,
                priority=priority,
                notification_type=notification_type
            )
            notifications.append(notification)
        
        return Response({
            'message': f'Notification broadcast to {len(notifications)} user(s)',
            'count': len(notifications)
        }, status=status.HTTP_201_CREATED)


class NotificationPreferencesView(APIView):
    """Get or update notification preferences"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get or create preferences
        preferences, created = NotificationPreference.objects.get_or_create(user=user)
        
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        
        # Get or create preferences
        preferences, created = NotificationPreference.objects.get_or_create(user=user)
        
        serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Preferences updated successfully',
                'preferences': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationStatsView(APIView):
    """Get notification statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        total = Notification.objects.filter(recipient=user).count()
        unread = Notification.objects.filter(recipient=user, is_read=False).count()
        
        # Count by type
        by_type = {}
        for ntype, _ in Notification.NOTIFICATION_TYPES:
            count = Notification.objects.filter(
                recipient=user, 
                notification_type=ntype
            ).count()
            if count > 0:
                by_type[ntype] = count
        
        return Response({
            'total_notifications': total,
            'unread_notifications': unread,
            'read_notifications': total - unread,
            'by_type': by_type
        }, status=status.HTTP_200_OK)
