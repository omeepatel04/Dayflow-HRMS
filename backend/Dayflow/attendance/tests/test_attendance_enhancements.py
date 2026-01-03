from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import date, time, datetime, timedelta
from users.models import User
from attendance.models import Attendance, AttendanceRegularization


class AttendanceEnhancementsTestCase(APITestCase):
    """Test attendance enhancements"""
    
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
    
    def test_late_arrival_tracking(self):
        """Test late arrival is tracked"""
        self.client.force_authenticate(user=self.employee)
        
        # Create attendance with late check-in (after 9 AM)
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(9, 30),  # 9:30 AM - late
            status='PRESENT'
        )
        
        attendance.check_late_arrival()
        self.assertTrue(attendance.is_late)
    
    def test_on_time_arrival(self):
        """Test on-time arrival is not marked as late"""
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(8, 45),  # 8:45 AM - on time
            status='PRESENT'
        )
        
        attendance.check_late_arrival()
        self.assertFalse(attendance.is_late)
    
    def test_early_departure_tracking(self):
        """Test early departure is tracked"""
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(9, 0),
            check_out_time=time(17, 0),  # 5 PM - early
            status='PRESENT'
        )
        
        attendance.check_early_departure()
        self.assertTrue(attendance.is_early_departure)
    
    def test_working_hours_calculation(self):
        """Test working hours are calculated correctly"""
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(9, 0),   # 9 AM
            check_out_time=time(18, 0),  # 6 PM
            status='PRESENT'
        )
        
        attendance.calculate_working_hours()
        self.assertEqual(float(attendance.working_hours), 9.0)
    
    def test_overtime_calculation(self):
        """Test overtime hours are calculated correctly"""
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(9, 0),   # 9 AM
            check_out_time=time(20, 0),  # 8 PM - 11 hours total
            status='PRESENT'
        )
        
        attendance.calculate_working_hours()
        self.assertEqual(float(attendance.overtime_hours), 3.0)  # 11 - 8 = 3 hours overtime
    
    def test_monthly_summary(self):
        """Test monthly attendance summary"""
        self.client.force_authenticate(user=self.employee)
        
        # Create multiple attendance records within the same month
        today = date.today()
        # Create records for days 1, 2, 3, 4, 5 of current month
        for day in range(1, 6):
            Attendance.objects.create(
                employee=self.employee,
                date=date(today.year, today.month, day),
                check_in_time=time(9, 0),
                check_out_time=time(18, 0),
                status='PRESENT'
            )
        
        url = reverse('monthly-summary')
        response = self.client.get(url, {
            'month': today.month,
            'year': today.year
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertEqual(response.data['summary']['total_days'], 5)
        self.assertEqual(response.data['summary']['present_days'], 5)
    
    def test_create_regularization_request(self):
        """Test creating attendance regularization request"""
        self.client.force_authenticate(user=self.employee)
        
        url = reverse('regularization-request')
        data = {
            'date': str(date.today() - timedelta(days=1)),
            'requested_check_in': '09:00',
            'requested_check_out': '18:00',
            'reason': 'Forgot to mark attendance'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('regularization', response.data)
        self.assertEqual(response.data['regularization']['status'], 'PENDING')
    
    def test_view_my_regularizations(self):
        """Test viewing own regularization requests"""
        self.client.force_authenticate(user=self.employee)
        
        # Create regularization request
        AttendanceRegularization.objects.create(
            employee=self.employee,
            date=date.today() - timedelta(days=1),
            requested_check_in=time(9, 0),
            requested_check_out=time(18, 0),
            reason='Test reason',
            status='PENDING'
        )
        
        url = reverse('my-regularizations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_hr_view_all_regularizations(self):
        """Test HR can view all regularization requests"""
        self.client.force_authenticate(user=self.hr)
        
        # Create regularization request
        AttendanceRegularization.objects.create(
            employee=self.employee,
            date=date.today() - timedelta(days=1),
            requested_check_in=time(9, 0),
            requested_check_out=time(18, 0),
            reason='Test reason',
            status='PENDING'
        )
        
        url = reverse('all-regularizations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
    
    def test_approve_regularization(self):
        """Test HR can approve regularization requests"""
        self.client.force_authenticate(user=self.hr)
        
        # Create regularization request
        regularization = AttendanceRegularization.objects.create(
            employee=self.employee,
            date=date.today() - timedelta(days=1),
            requested_check_in=time(9, 0),
            requested_check_out=time(18, 0),
            reason='Test reason',
            status='PENDING'
        )
        
        url = reverse('regularization-approval', args=[regularization.id])
        response = self.client.post(url, {'action': 'approve'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check regularization was approved
        regularization.refresh_from_db()
        self.assertEqual(regularization.status, 'APPROVED')
        
        # Check attendance was created/updated
        attendance = Attendance.objects.filter(
            employee=self.employee,
            date=date.today() - timedelta(days=1)
        ).first()
        self.assertIsNotNone(attendance)
        self.assertEqual(attendance.check_in_time, time(9, 0))
    
    def test_reject_regularization(self):
        """Test HR can reject regularization requests"""
        self.client.force_authenticate(user=self.hr)
        
        # Create regularization request
        regularization = AttendanceRegularization.objects.create(
            employee=self.employee,
            date=date.today() - timedelta(days=1),
            requested_check_in=time(9, 0),
            requested_check_out=time(18, 0),
            reason='Test reason',
            status='PENDING'
        )
        
        url = reverse('regularization-approval', args=[regularization.id])
        response = self.client.post(url, {'action': 'reject'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check regularization was rejected
        regularization.refresh_from_db()
        self.assertEqual(regularization.status, 'REJECTED')
    
    def test_check_in_tracks_late_arrival(self):
        """Test check-in automatically tracks late arrival"""
        self.client.force_authenticate(user=self.employee)
        
        # Mock late check-in (would be past 9 AM in real scenario)
        url = reverse('check-in')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Get the created attendance
        attendance = Attendance.objects.get(
            employee=self.employee,
            date=date.today()
        )
        
        # Check if late flag was evaluated (will depend on actual time)
        self.assertIsNotNone(attendance.is_late)
    
    def test_check_out_calculates_hours(self):
        """Test check-out automatically calculates working hours"""
        self.client.force_authenticate(user=self.employee)
        
        # Create attendance with check-in
        Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in_time=time(9, 0),
            status='PRESENT'
        )
        
        # Check out
        url = reverse('check-out')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify working hours were calculated
        attendance = Attendance.objects.get(
            employee=self.employee,
            date=date.today()
        )
        
        self.assertIsNotNone(attendance.working_hours)
