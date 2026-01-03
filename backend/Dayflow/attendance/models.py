from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import User


class Attendance(models.Model):
    """Attendance tracking model"""
    
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
        ('LEAVE', 'Leave'),
    )
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ABSENT')
    is_late = models.BooleanField(default=False)
    is_early_departure = models.BooleanField(default=False)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'attendance'
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
        unique_together = ['employee', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.status}"
    
    def calculate_working_hours(self):
        """Calculate total working hours"""
        if self.check_in_time and self.check_out_time:
            check_in = datetime.combine(self.date, self.check_in_time)
            check_out = datetime.combine(self.date, self.check_out_time)
            duration = check_out - check_in
            hours = duration.total_seconds() / 3600
            self.working_hours = round(hours, 2)
            
            # Calculate overtime (standard work day is 8 hours)
            if hours > 8:
                self.overtime_hours = round(hours - 8, 2)
            else:
                self.overtime_hours = 0
    
    def check_late_arrival(self, standard_time='09:00'):
        """Check if employee arrived late (default: 9 AM)"""
        if self.check_in_time:
            standard = datetime.strptime(standard_time, '%H:%M').time()
            self.is_late = self.check_in_time > standard
    
    def check_early_departure(self, standard_time='18:00'):
        """Check if employee left early (default: 6 PM)"""
        if self.check_out_time:
            standard = datetime.strptime(standard_time, '%H:%M').time()
            self.is_early_departure = self.check_out_time < standard


class AttendanceRegularization(models.Model):
    """Attendance regularization requests"""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='regularizations')
    date = models.DateField()
    requested_check_in = models.TimeField(null=True, blank=True)
    requested_check_out = models.TimeField(null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_regularizations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance_regularization'
        verbose_name = 'Attendance Regularization'
        verbose_name_plural = 'Attendance Regularizations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.status}"
