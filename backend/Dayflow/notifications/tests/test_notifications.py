from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from notifications.models import Notification, NotificationPreference
from notifications.utils import create_notification


class NotificationsTestCase(APITestCase):
    """Test notifications system"""
    
    def setUp(self):
        # Create test users
        self.employee = User.objects.create_user(
            username='employee',
            email='employee@example.com',
            password='pass123',
            employee_id='EMP001',
            role='EMPLOYEE'
        )
        
        self.hr = User.objects.create_user(
            username='hr',
            email='hr@example.com',
            password='pass123',
            employee_id='HR001',
            role='HR'
        )
    
    def test_create_notification_utility(self):
        """Test creating notification using utility function"""
        notification = create_notification(
            recipient=self.employee,
            title='Test Notification',
            message='This is a test message',
            notification_type='GENERAL',
            priority='MEDIUM'
        )
        
        self.assertIsNotNone(notification)
        self.assertEqual(notification.recipient, self.employee)
        self.assertEqual(notification.title, 'Test Notification')
    
    def test_list_my_notifications(self):
        """Test listing user's notifications"""
        self.client.force_authenticate(user=self.employee)
        
        # Create notifications
        Notification.objects.create(
            recipient=self.employee,
            title='Notification 1',
            message='Message 1'
        )
        Notification.objects.create(
            recipient=self.employee,
            title='Notification 2',
            message='Message 2'
        )
        
        url = reverse('my-notifications')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
    
    def test_filter_unread_notifications(self):
        """Test filtering unread notifications"""
        self.client.force_authenticate(user=self.employee)
        
        # Create notifications
        Notification.objects.create(
            recipient=self.employee,
            title='Unread Notification',
            message='Message',
            is_read=False
        )
        Notification.objects.create(
            recipient=self.employee,
            title='Read Notification',
            message='Message',
            is_read=True
        )
        
        url = reverse('my-notifications')
        response = self.client.get(url, {'unread_only': 'true'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['notifications'][0]['title'], 'Unread Notification')
    
    def test_mark_notification_as_read(self):
        """Test marking notification as read"""
        self.client.force_authenticate(user=self.employee)
        
        notification = Notification.objects.create(
            recipient=self.employee,
            title='Test',
            message='Message',
            is_read=False
        )
        
        url = reverse('notification-detail', args=[notification.id])
        response = self.client.patch(url, {'is_read': True})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
    
    def test_auto_mark_as_read_on_get(self):
        """Test notification is auto-marked as read when retrieved"""
        self.client.force_authenticate(user=self.employee)
        
        notification = Notification.objects.create(
            recipient=self.employee,
            title='Test',
            message='Message',
            is_read=False
        )
        
        url = reverse('notification-detail', args=[notification.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
    
    def test_mark_all_notifications_as_read(self):
        """Test marking all notifications as read"""
        self.client.force_authenticate(user=self.employee)
        
        # Create multiple unread notifications
        for i in range(3):
            Notification.objects.create(
                recipient=self.employee,
                title=f'Notification {i}',
                message='Message',
                is_read=False
            )
        
        url = reverse('mark-all-read')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check all are marked as read
        unread_count = Notification.objects.filter(
            recipient=self.employee,
            is_read=False
        ).count()
        self.assertEqual(unread_count, 0)
    
    def test_delete_notification(self):
        """Test deleting notification"""
        self.client.force_authenticate(user=self.employee)
        
        notification = Notification.objects.create(
            recipient=self.employee,
            title='Test',
            message='Message'
        )
        
        url = reverse('notification-detail', args=[notification.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Check notification is deleted
        self.assertFalse(
            Notification.objects.filter(id=notification.id).exists()
        )
    
    def test_create_notification_hr_only(self):
        """Test creating notification (HR only)"""
        self.client.force_authenticate(user=self.hr)
        
        url = reverse('create-notification')
        data = {
            'recipient': self.employee.id,
            'title': 'HR Notification',
            'message': 'Important message',
            'notification_type': 'GENERAL',
            'priority': 'HIGH'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_employee_cannot_create_notification(self):
        """Test employee cannot create notification"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('create-notification')
        data = {
            'recipient': self.hr.id,
            'title': 'Test',
            'message': 'Message'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_broadcast_notification(self):
        """Test broadcasting notification to all users"""
        self.client.force_authenticate(user=self.hr)
        
        # Create another employee
        User.objects.create_user(
            username='employee2',
            email='emp2@example.com',
            password='pass123',
            employee_id='EMP002',
            role='EMPLOYEE'
        )
        
        url = reverse('broadcast-notification')
        data = {
            'title': 'System Announcement',
            'message': 'Important announcement for all',
            'priority': 'URGENT'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check all users received notification
        total_notifications = Notification.objects.filter(
            title='System Announcement'
        ).count()
        self.assertGreaterEqual(total_notifications, 2)
    
    def test_broadcast_to_specific_role(self):
        """Test broadcasting to specific role"""
        self.client.force_authenticate(user=self.hr)
        
        url = reverse('broadcast-notification')
        data = {
            'title': 'Employee Announcement',
            'message': 'Message for employees only',
            'role': 'EMPLOYEE'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check only employees received
        employee_notifications = Notification.objects.filter(
            recipient=self.employee,
            title='Employee Announcement'
        ).count()
        self.assertEqual(employee_notifications, 1)
    
    def test_get_notification_preferences(self):
        """Test getting notification preferences"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('notification-preferences')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email_notifications', response.data)
    
    def test_update_notification_preferences(self):
        """Test updating notification preferences"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('notification-preferences')
        data = {
            'email_notifications': False,
            'leave_notifications': True,
            'payroll_notifications': False
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check preferences were updated
        prefs = NotificationPreference.objects.get(user=self.employee)
        self.assertFalse(prefs.email_notifications)
        self.assertTrue(prefs.leave_notifications)
        self.assertFalse(prefs.payroll_notifications)
    
    def test_notification_stats(self):
        """Test getting notification statistics"""
        self.client.force_authenticate(user=self.employee)
        
        # Create notifications
        Notification.objects.create(
            recipient=self.employee,
            title='Test 1',
            message='Message',
            is_read=False,
            notification_type='LEAVE_APPROVED'
        )
        Notification.objects.create(
            recipient=self.employee,
            title='Test 2',
            message='Message',
            is_read=True,
            notification_type='PAYROLL_GENERATED'
        )
        
        url = reverse('notification-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_notifications'], 2)
        self.assertEqual(response.data['unread_notifications'], 1)
        self.assertEqual(response.data['read_notifications'], 1)
    
    def test_notification_respects_preferences(self):
        """Test notification creation respects user preferences"""
        # Create preferences with leave notifications disabled
        NotificationPreference.objects.create(
            user=self.employee,
            leave_notifications=False
        )
        
        # Try to create leave notification
        notification = create_notification(
            recipient=self.employee,
            title='Leave Request',
            message='Your leave has been approved',
            notification_type='LEAVE_APPROVED'
        )
        
        # Should return None as preference is disabled
        self.assertIsNone(notification)
    
    def test_filter_by_notification_type(self):
        """Test filtering notifications by type"""
        self.client.force_authenticate(user=self.employee)
        
        Notification.objects.create(
            recipient=self.employee,
            title='Leave',
            message='Message',
            notification_type='LEAVE_APPROVED'
        )
        Notification.objects.create(
            recipient=self.employee,
            title='Payroll',
            message='Message',
            notification_type='PAYROLL_GENERATED'
        )
        
        url = reverse('my-notifications')
        response = self.client.get(url, {'type': 'LEAVE_APPROVED'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['notifications'][0]['notification_type'], 'LEAVE_APPROVED')
