from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date
from decimal import Decimal
from users.models import User
from payroll.models import Payroll, PayrollComponent, SalaryStructure


class PayrollEnhancementsTestCase(APITestCase):
    """Test payroll enhancements"""
    
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
    
    def test_create_payroll_component(self):
        """Test creating payroll component"""
        self.client.force_authenticate(user=self.hr)
        
        url = reverse('payroll-components')
        data = {
            'name': 'HRA',
            'component_type': 'ALLOWANCE',
            'description': 'House Rent Allowance'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('component', response.data)
        self.assertEqual(response.data['component']['name'], 'HRA')
    
    def test_list_payroll_components(self):
        """Test listing payroll components"""
        self.client.force_authenticate(user=self.hr)
        
        # Create components
        PayrollComponent.objects.create(
            name='HRA',
            component_type='ALLOWANCE'
        )
        PayrollComponent.objects.create(
            name='PF',
            component_type='DEDUCTION'
        )
        
        url = reverse('payroll-components')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
    
    def test_filter_components_by_type(self):
        """Test filtering components by type"""
        self.client.force_authenticate(user=self.hr)
        
        PayrollComponent.objects.create(name='HRA', component_type='ALLOWANCE')
        PayrollComponent.objects.create(name='PF', component_type='DEDUCTION')
        
        url = reverse('payroll-components')
        response = self.client.get(url, {'type': 'ALLOWANCE'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['components'][0]['name'], 'HRA')
    
    def test_create_salary_structure(self):
        """Test creating salary structure"""
        self.client.force_authenticate(user=self.hr)
        
        url = reverse('salary-structure')
        data = {
            'employee': self.employee.id,
            'basic_salary': 50000,
            'hra': 10000,
            'transport_allowance': 2000,
            'medical_allowance': 1500,
            'provident_fund': 6000,
            'professional_tax': 200,
            'income_tax': 5000,
            'effective_from': str(date.today())
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('structure', response.data)
    
    def test_get_salary_structure(self):
        """Test getting salary structure"""
        self.client.force_authenticate(user=self.employee)
        
        # Create structure
        SalaryStructure.objects.create(
            employee=self.employee,
            basic_salary=50000,
            hra=10000,
            effective_from=date.today()
        )
        
        url = reverse('salary-structure')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['basic_salary']), Decimal('50000'))
    
    def test_salary_structure_calculations(self):
        """Test salary structure automatic calculations"""
        structure = SalaryStructure.objects.create(
            employee=self.employee,
            basic_salary=50000,
            hra=10000,
            transport_allowance=2000,
            medical_allowance=1500,
            provident_fund=6000,
            professional_tax=200,
            income_tax=5000,
            effective_from=date.today()
        )
        
        # Test total allowances
        self.assertEqual(structure.total_allowances(), 13500)
        
        # Test total deductions
        self.assertEqual(structure.total_deductions(), 11200)
        
        # Test gross salary
        self.assertEqual(structure.gross_salary(), 63500)
        
        # Test net salary
        self.assertEqual(structure.net_salary(), 52300)
    
    def test_generate_payroll_from_structure(self):
        """Test generating payroll from salary structure"""
        self.client.force_authenticate(user=self.hr)
        
        # Create salary structure
        SalaryStructure.objects.create(
            employee=self.employee,
            basic_salary=50000,
            hra=10000,
            provident_fund=6000,
            income_tax=5000,
            effective_from=date.today()
        )
        
        url = reverse('generate-payroll')
        data = {
            'employee_id': self.employee.id,
            'month': '2026-01-01'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payroll', response.data)
        self.assertEqual(response.data['payroll']['status'], 'DRAFT')
    
    def test_payroll_status_update(self):
        """Test updating payroll status"""
        self.client.force_authenticate(user=self.hr)
        
        # Create payroll
        payroll = Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            allowances=10000,
            deductions=5000,
            month=date(2026, 1, 1),
            status='DRAFT'
        )
        
        url = reverse('payroll-status', args=[payroll.id])
        response = self.client.patch(url, {'status': 'PROCESSED'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        payroll.refresh_from_db()
        self.assertEqual(payroll.status, 'PROCESSED')
    
    def test_payroll_paid_status_sets_payment_date(self):
        """Test marking payroll as paid sets payment date"""
        self.client.force_authenticate(user=self.hr)
        
        payroll = Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            month=date(2026, 1, 1),
            status='DRAFT'
        )
        
        url = reverse('payroll-status', args=[payroll.id])
        response = self.client.patch(url, {'status': 'PAID'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        payroll.refresh_from_db()
        self.assertEqual(payroll.status, 'PAID')
        self.assertIsNotNone(payroll.payment_date)
    
    def test_payroll_summary(self):
        """Test payroll summary"""
        self.client.force_authenticate(user=self.hr)
        
        # Create multiple payrolls
        Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            allowances=10000,
            deductions=5000,
            tax=2000,
            month=date(2026, 1, 1)
        )
        
        Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            allowances=10000,
            deductions=5000,
            tax=2000,
            month=date(2026, 2, 1)
        )
        
        url = reverse('payroll-summary')
        response = self.client.get(url, {'year': 2026})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payroll_count'], 2)
        self.assertEqual(response.data['summary']['total_basic_salary'], 100000.0)
    
    def test_payroll_calculation(self):
        """Test payroll automatic calculations"""
        payroll = Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            allowances=10000,
            deductions=5000,
            tax=2000,
            month=date(2026, 1, 1)
        )
        
        # Check gross salary
        self.assertEqual(payroll.gross_salary, 60000)
        
        # Check net salary (gross - deductions - tax)
        self.assertEqual(payroll.net_salary, 53000)
    
    def test_employee_cannot_create_components(self):
        """Test employee cannot create payroll components"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('payroll-components')
        data = {
            'name': 'Test Component',
            'component_type': 'ALLOWANCE'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_employee_cannot_create_salary_structure(self):
        """Test employee cannot create salary structure"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('salary-structure')
        data = {
            'employee': self.employee.id,
            'basic_salary': 50000,
            'effective_from': str(date.today())
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_duplicate_payroll_prevention(self):
        """Test preventing duplicate payroll for same month"""
        self.client.force_authenticate(user=self.hr)
        
        # Create first payroll
        Payroll.objects.create(
            employee=self.employee,
            basic_salary=50000,
            month=date(2026, 1, 1)
        )
        
        # Try to create duplicate
        url = reverse('create-payroll')
        data = {
            'employee': self.employee.id,
            'basic_salary': 50000,
            'month': '2026-01-01'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
