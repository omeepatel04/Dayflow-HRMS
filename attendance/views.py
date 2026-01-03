from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date
from .models import Attendance
from .serializers import AttendanceSerializer
from .permissions import IsOwnerOrAdmin
from users.permissions import IsAdminOrHR


class CheckInView(generics.CreateAPIView):
    """Check-in API"""
    
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        today = date.today()
        
        # Check if already checked in
        if Attendance.objects.filter(employee=request.user, date=today).exists():
            return Response(
                {"error": "Already checked in for today."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = {
            'date': today,
            'check_in_time': request.data.get('check_in_time'),
            'status': 'PRESENT'
        }
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CheckOutView(generics.UpdateAPIView):
    """Check-out API"""
    
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        today = date.today()
        
        try:
            attendance = Attendance.objects.get(employee=request.user, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No check-in record found for today."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        attendance.check_out_time = request.data.get('check_out_time')
        attendance.save()
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)


class MyAttendanceView(generics.ListAPIView):
    """View own attendance API"""
    
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Attendance.objects.filter(employee=self.request.user)


class AllAttendanceView(generics.ListAPIView):
    """View all attendance API (Admin/HR only)"""
    
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]
