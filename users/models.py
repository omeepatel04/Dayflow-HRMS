from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User Model"""
    
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'HR'),
        ('EMPLOYEE', 'Employee'),
    )
    
    employee_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMPLOYEE')
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.employee_id})"


class EmployeeProfile(models.Model):
    """Employee Profile Model"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    job_title = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    
    class Meta:
        db_table = 'employee_profiles'
        verbose_name = 'Employee Profile'
        verbose_name_plural = 'Employee Profiles'
    
    def __str__(self):
        return self.full_name
