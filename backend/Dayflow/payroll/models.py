from django.db import models
from users.models import User


class Payroll(models.Model):
    """Payroll management model"""
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payrolls')
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # First day of month
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payroll'
        verbose_name = 'Payroll'
        verbose_name_plural = 'Payrolls'
        unique_together = ['employee', 'month']
        ordering = ['-month']
    
    def save(self, *args, **kwargs):
        """Auto-calculate net salary"""
        self.net_salary = self.basic_salary + self.allowances - self.deductions
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.employee.username} - {self.month.strftime('%B %Y')}"
