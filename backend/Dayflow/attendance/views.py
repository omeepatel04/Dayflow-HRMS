from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import date, time, datetime
from .models import Attendance, AttendanceRegularization
from .serializers import AttendanceSerializer, AttendanceRegularizationSerializer
from users.permissions import IsAdminOrHR, CanModifyAttendance


class CheckInView(APIView):
    """Check-in endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        today = date.today()
        
        # Check if already checked in today
        if Attendance.objects.filter(employee=user, date=today).exists():
            return Response({
                'error': 'Already checked in today'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create attendance record
        attendance = Attendance.objects.create(
            employee=user,
            date=today,
            check_in_time=timezone.now().time(),
            status='PRESENT'
        )
        
        # Check if late arrival
        attendance.check_late_arrival()
        attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response({
            'message': 'Checked in successfully',
            'attendance': serializer.data
        }, status=status.HTTP_201_CREATED)


class CheckOutView(APIView):
    """Check-out endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        today = date.today()
        
        try:
            attendance = Attendance.objects.get(employee=user, date=today)
            
            if attendance.check_out_time:
                return Response({
                    'error': 'Already checked out today'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            attendance.check_out_time = timezone.now().time()
            
            # Calculate working hours and check early departure
            attendance.calculate_working_hours()
            attendance.check_early_departure()
            attendance.save()
            
            serializer = AttendanceSerializer(attendance)
            return Response({
                'message': 'Checked out successfully',
                'attendance': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Attendance.DoesNotExist:
            return Response({
                'error': 'No check-in record found for today'
            }, status=status.HTTP_404_NOT_FOUND)


class MyAttendanceView(APIView):
    """Get current user's attendance records"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Filter parameters
        from_date = request.query_params.get('from_date', None)
        to_date = request.query_params.get('to_date', None)
        status_filter = request.query_params.get('status', None)
        
        attendances = Attendance.objects.filter(employee=user)
        
        if from_date:
            attendances = attendances.filter(date__gte=from_date)
        if to_date:
            attendances = attendances.filter(date__lte=to_date)
        if status_filter:
            attendances = attendances.filter(status=status_filter.upper())
        
        serializer = AttendanceSerializer(attendances, many=True)
        return Response({
            'count': attendances.count(),
            'attendance': serializer.data
        }, status=status.HTTP_200_OK)


class AllAttendanceView(APIView):
    """Get all attendance records (Admin/HR/Manager)"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        # Filter parameters
        employee_id = request.query_params.get('employee_id', None)
        from_date = request.query_params.get('from_date', None)
        to_date = request.query_params.get('to_date', None)
        status_filter = request.query_params.get('status', None)
        
        attendances = Attendance.objects.select_related('employee').all()
        
        if employee_id:
            attendances = attendances.filter(employee__id=employee_id)
        if from_date:
            attendances = attendances.filter(date__gte=from_date)
        if to_date:
            attendances = attendances.filter(date__lte=to_date)
        if status_filter:
            attendances = attendances.filter(status=status_filter.upper())
        
        serializer = AttendanceSerializer(attendances, many=True)
        return Response({
            'count': attendances.count(),
            'attendance': serializer.data
        }, status=status.HTTP_200_OK)


class AttendanceDetailView(APIView):
    """Get, update, or delete specific attendance record"""
    permission_classes = [CanModifyAttendance]
    
    def get(self, request, pk):
        attendance = get_object_or_404(Attendance, pk=pk)
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        attendance = get_object_or_404(Attendance, pk=pk)
        serializer = AttendanceSerializer(attendance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Attendance updated successfully',
                'attendance': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        attendance = get_object_or_404(Attendance, pk=pk)
        attendance.delete()
        return Response({
            'message': 'Attendance deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class MonthlyAttendanceSummaryView(APIView):
    """Get monthly attendance summary for an employee"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get month and year from query params (default to current month)
        month = int(request.query_params.get('month', datetime.now().month))
        year = int(request.query_params.get('year', datetime.now().year))
        
        # Get all attendance for the month
        attendances = Attendance.objects.filter(
            employee=user,
            date__month=month,
            date__year=year
        )
        
        # Calculate statistics
        total_days = attendances.count()
        present_days = attendances.filter(status='PRESENT').count()
        absent_days = attendances.filter(status='ABSENT').count()
        half_days = attendances.filter(status='HALF_DAY').count()
        leaves = attendances.filter(status='LEAVE').count()
        late_arrivals = attendances.filter(is_late=True).count()
        early_departures = attendances.filter(is_early_departure=True).count()
        
        total_hours = attendances.aggregate(
            total=Sum('working_hours')
        )['total'] or 0
        
        total_overtime = attendances.aggregate(
            total=Sum('overtime_hours')
        )['total'] or 0
        
        return Response({
            'month': month,
            'year': year,
            'summary': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'half_days': half_days,
                'leaves': leaves,
                'late_arrivals': late_arrivals,
                'early_departures': early_departures,
                'total_working_hours': float(total_hours),
                'total_overtime_hours': float(total_overtime)
            }
        }, status=status.HTTP_200_OK)


class RegularizationRequestView(APIView):
    """Create attendance regularization request"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = AttendanceRegularizationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(employee=user)
            return Response({
                'message': 'Regularization request submitted successfully',
                'regularization': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyRegularizationsView(APIView):
    """Get current user's regularization requests"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        regularizations = AttendanceRegularization.objects.filter(employee=user)
        serializer = AttendanceRegularizationSerializer(regularizations, many=True)
        return Response({
            'count': regularizations.count(),
            'regularizations': serializer.data
        }, status=status.HTTP_200_OK)


class AllRegularizationsView(APIView):
    """Get all regularization requests (Admin/HR)"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        status_filter = request.query_params.get('status', None)
        employee_id = request.query_params.get('employee_id', None)
        
        regularizations = AttendanceRegularization.objects.select_related('employee', 'reviewed_by').all()
        
        if status_filter:
            regularizations = regularizations.filter(status=status_filter.upper())
        if employee_id:
            regularizations = regularizations.filter(employee__id=employee_id)
        
        serializer = AttendanceRegularizationSerializer(regularizations, many=True)
        return Response({
            'count': regularizations.count(),
            'regularizations': serializer.data
        }, status=status.HTTP_200_OK)


class RegularizationApprovalView(APIView):
    """Approve or reject regularization request (Admin/HR)"""
    permission_classes = [IsAdminOrHR]
    
    def post(self, request, pk):
        regularization = get_object_or_404(AttendanceRegularization, pk=pk)
        
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action not in ['approve', 'reject']:
            return Response({
                'error': 'Invalid action. Use "approve" or "reject"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if regularization.status != 'PENDING':
            return Response({
                'error': 'Regularization already processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        regularization.status = 'APPROVED' if action == 'approve' else 'REJECTED'
        regularization.reviewed_by = request.user
        regularization.reviewed_at = timezone.now()
        regularization.save()
        
        # If approved, update the attendance record
        if action == 'approve':
            attendance, created = Attendance.objects.get_or_create(
                employee=regularization.employee,
                date=regularization.date,
                defaults={
                    'check_in_time': regularization.requested_check_in,
                    'check_out_time': regularization.requested_check_out,
                    'status': 'PRESENT'
                }
            )
            
            if not created:
                # Update existing attendance
                if regularization.requested_check_in:
                    attendance.check_in_time = regularization.requested_check_in
                if regularization.requested_check_out:
                    attendance.check_out_time = regularization.requested_check_out
                
                # Recalculate hours and flags
                attendance.calculate_working_hours()
                attendance.check_late_arrival()
                attendance.check_early_departure()
                attendance.save()
        
        serializer = AttendanceRegularizationSerializer(regularization)
        return Response({
            'message': f'Regularization {action}d successfully',
            'regularization': serializer.data
        }, status=status.HTTP_200_OK)
