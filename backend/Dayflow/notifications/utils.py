"""
Utility functions for creating notifications
"""
from .models import Notification, NotificationPreference


def create_notification(recipient, title, message, notification_type='GENERAL', 
                       priority='MEDIUM', related_object_type='', 
                       related_object_id=None, action_url=''):
    """
    Create a notification for a user
    
    Args:
        recipient: User object
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        priority: Priority level
        related_object_type: Type of related object (e.g., 'leave', 'payroll')
        related_object_id: ID of related object
        action_url: URL for action button
    
    Returns:
        Notification object or None if preferences don't allow
    """
    # Check user preferences
    try:
        preferences = NotificationPreference.objects.get(user=recipient)
        
        # Check if user wants this type of notification
        type_map = {
            'LEAVE_REQUESTED': preferences.leave_notifications,
            'LEAVE_APPROVED': preferences.leave_notifications,
            'LEAVE_REJECTED': preferences.leave_notifications,
            'ATTENDANCE_REGULARIZATION': preferences.attendance_notifications,
            'PAYROLL_GENERATED': preferences.payroll_notifications,
            'PAYROLL_PAID': preferences.payroll_notifications,
            'GENERAL': preferences.general_notifications,
        }
        
        if notification_type in type_map and not type_map[notification_type]:
            return None  # User has disabled this type
            
    except NotificationPreference.DoesNotExist:
        # No preferences set, create notification anyway
        pass
    
    # Create notification
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        related_object_type=related_object_type,
        related_object_id=related_object_id,
        action_url=action_url
    )
    
    return notification


def notify_leave_request(leave_request, approvers):
    """Notify approvers about new leave request"""
    for approver in approvers:
        create_notification(
            recipient=approver,
            title='New Leave Request',
            message=f'{leave_request.employee.username} has requested leave from {leave_request.start_date} to {leave_request.end_date}',
            notification_type='LEAVE_REQUESTED',
            priority='MEDIUM',
            related_object_type='leave',
            related_object_id=leave_request.id,
            action_url=f'/leaves/{leave_request.id}/'
        )


def notify_leave_status(leave_request):
    """Notify employee about leave request status"""
    status_map = {
        'APPROVED': ('Leave Request Approved', 'Your leave request has been approved.', 'LEAVE_APPROVED'),
        'REJECTED': ('Leave Request Rejected', 'Your leave request has been rejected.', 'LEAVE_REJECTED'),
    }
    
    if leave_request.status in status_map:
        title, message, ntype = status_map[leave_request.status]
        create_notification(
            recipient=leave_request.employee,
            title=title,
            message=f'{message} From {leave_request.start_date} to {leave_request.end_date}',
            notification_type=ntype,
            priority='HIGH',
            related_object_type='leave',
            related_object_id=leave_request.id,
            action_url=f'/leaves/{leave_request.id}/'
        )


def notify_attendance_regularization(regularization, approvers):
    """Notify approvers about attendance regularization request"""
    for approver in approvers:
        create_notification(
            recipient=approver,
            title='Attendance Regularization Request',
            message=f'{regularization.employee.username} has requested attendance regularization for {regularization.date}',
            notification_type='ATTENDANCE_REGULARIZATION',
            priority='MEDIUM',
            related_object_type='regularization',
            related_object_id=regularization.id,
            action_url=f'/attendance/regularization/{regularization.id}/'
        )


def notify_payroll_generated(payroll):
    """Notify employee about payroll generation"""
    create_notification(
        recipient=payroll.employee,
        title='Payroll Generated',
        message=f'Your payroll for {payroll.month.strftime("%B %Y")} has been generated. Net Salary: ₹{payroll.net_salary}',
        notification_type='PAYROLL_GENERATED',
        priority='MEDIUM',
        related_object_type='payroll',
        related_object_id=payroll.id,
        action_url=f'/payroll/{payroll.id}/'
    )


def notify_payroll_paid(payroll):
    """Notify employee about payroll payment"""
    create_notification(
        recipient=payroll.employee,
        title='Salary Paid',
        message=f'Your salary for {payroll.month.strftime("%B %Y")} has been paid. Amount: ₹{payroll.net_salary}',
        notification_type='PAYROLL_PAID',
        priority='HIGH',
        related_object_type='payroll',
        related_object_id=payroll.id,
        action_url=f'/payroll/{payroll.id}/'
    )
