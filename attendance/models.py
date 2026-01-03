from django.db import models
from users.models import User


class Attendance(models.Model):
    """Attendance Model"""
    
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
    
    class Meta:
        db_table = 'attendance'
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
        unique_together = ['employee', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.status}"
