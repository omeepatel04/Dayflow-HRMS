"""
Dashboard APIs for Employee and HR
Simple views to display key metrics and data
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from attendance.models import Attendance
from leaves.models import Leave
from payroll.models import Payroll
from users.permissions import IsAdminOrHR


class EmployeeDashboardView(APIView):
    """Simple employee dashboard with key metrics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        employee = request.user
        today = date.today()
        
        # Today's attendance
        today_attendance = Attendance.objects.filter(
            employee=employee, 
            date=today
        ).first()
        
        # Pending leaves
        pending_leaves = Leave.objects.filter(
            employee=employee, 
            status='PENDING'
        ).count()
        
        # This month's payroll
        this_month_payroll = Payroll.objects.filter(
            employee=employee,
            month__year=today.year,
            month__month=today.month
        ).first()
        
        dashboard_data = {
            'employee': {
                'id': employee.id,
                'name': f"{employee.first_name} {employee.last_name}",
                'role': employee.role,
                'email': employee.email
            },
            'attendance': {
                'checked_in': today_attendance.check_in_time if today_attendance else None,
                'checked_out': today_attendance.check_out_time if today_attendance else None,
                'status': today_attendance.status if today_attendance else 'NOT_MARKED'
            },
            'leaves': {
                'pending_count': pending_leaves
            },
            'payroll': {
                'basic_salary': str(this_month_payroll.basic_salary) if this_month_payroll else '0.00',
                'net_salary': str(this_month_payroll.net_salary) if this_month_payroll else '0.00'
            }
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)


class HRDashboardView(APIView):
    """Simple HR dashboard with team metrics"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        today = date.today()
        
        # Count employees
        from users.models import User
        total_employees = User.objects.filter(role='EMPLOYEE').count()
        
        # Today's attendance
        today_present = Attendance.objects.filter(
            date=today,
            status='PRESENT'
        ).count()
        today_absent = Attendance.objects.filter(
            date=today,
            status='ABSENT'
        ).count()
        
        # Pending leaves
        pending_leaves = Leave.objects.filter(status='PENDING').count()
        
        # Payroll summary
        monthly_payroll_count = Payroll.objects.filter(
            month__year=today.year,
            month__month=today.month
        ).count()
        
        dashboard_data = {
            'employees': {
                'total': total_employees
            },
            'attendance': {
                'present': today_present,
                'absent': today_absent,
                'total_marked': today_present + today_absent
            },
            'leaves': {
                'pending_count': pending_leaves
            },
            'payroll': {
                'processed_this_month': monthly_payroll_count,
                'total_employees': total_employees
            }
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
