from django.db import models
from django.core.validators import MinValueValidator
from users.models import User


class PayrollComponent(models.Model):
    """Payroll component types (allowances/deductions)"""
    
    COMPONENT_TYPE_CHOICES = (
        ('ALLOWANCE', 'Allowance'),
        ('DEDUCTION', 'Deduction'),
    )
    
    name = models.CharField(max_length=100, unique=True)
    component_type = models.CharField(max_length=10, choices=COMPONENT_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payroll_components'
        verbose_name = 'Payroll Component'
        verbose_name_plural = 'Payroll Components'
        ordering = ['component_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.component_type})"


class Payroll(models.Model):
    """Payroll management model"""
    
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PROCESSED', 'Processed'),
        ('PAID', 'Paid'),
    )
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payrolls')
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # First day of month
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payroll'
        verbose_name = 'Payroll'
        verbose_name_plural = 'Payrolls'
        unique_together = ['employee', 'month']
        ordering = ['-month']
    
    def calculate_salary(self):
        """Calculate gross and net salary"""
        self.gross_salary = self.basic_salary + self.allowances
        self.net_salary = self.gross_salary - self.deductions - self.tax
    
    def save(self, *args, **kwargs):
        """Auto-calculate salaries before saving"""
        self.calculate_salary()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.employee.username} - {self.month.strftime('%B %Y')}"


class PayrollDetail(models.Model):
    """Detailed breakdown of payroll components"""
    
    payroll = models.ForeignKey(Payroll, on_delete=models.CASCADE, related_name='details')
    component = models.ForeignKey(PayrollComponent, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'payroll_details'
        verbose_name = 'Payroll Detail'
        verbose_name_plural = 'Payroll Details'
        unique_together = ['payroll', 'component']
    
    def __str__(self):
        return f"{self.payroll} - {self.component.name}: {self.amount}"


class SalaryStructure(models.Model):
    """Define salary structure for employees"""
    
    employee = models.OneToOneField(User, on_delete=models.CASCADE, related_name='salary_structure')
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="House Rent Allowance")
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    provident_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="PF Deduction")
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    income_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    effective_from = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'salary_structures'
        verbose_name = 'Salary Structure'
        verbose_name_plural = 'Salary Structures'
    
    def __str__(self):
        return f"{self.employee.username} - Salary Structure"
    
    def total_allowances(self):
        """Calculate total allowances"""
        return (self.hra + self.transport_allowance + 
                self.medical_allowance + self.special_allowance)
    
    def total_deductions(self):
        """Calculate total deductions"""
        return self.provident_fund + self.professional_tax + self.income_tax
    
    def gross_salary(self):
        """Calculate gross salary"""
        return self.basic_salary + self.total_allowances()
    
    def net_salary(self):
        """Calculate net salary"""
        return self.gross_salary() - self.total_deductions()
