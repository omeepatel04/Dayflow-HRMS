from django.db import models
from users.models import User


class Leave(models.Model):
    """Leave Management Model"""
    
    LEAVE_TYPE_CHOICES = (
        ('PAID', 'Paid Leave'),
        ('SICK', 'Sick Leave'),
        ('UNPAID', 'Unpaid Leave'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    admin_comment = models.TextField(null=True, blank=True)
    applied_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leaves'
        verbose_name = 'Leave'
        verbose_name_plural = 'Leaves'
        ordering = ['-applied_on']
    
    def __str__(self):
        return f"{self.employee.username} - {self.leave_type} - {self.status}"
