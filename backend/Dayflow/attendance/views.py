from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date, time
from .models import Attendance
from .serializers import AttendanceSerializer


class CheckInView(APIView):
    """Check-in endpoint"""
    
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
        
        serializer = AttendanceSerializer(attendance)
        return Response({
            'message': 'Checked in successfully',
            'attendance': serializer.data
        }, status=status.HTTP_201_CREATED)


class CheckOutView(APIView):
    """Check-out endpoint"""
    
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
