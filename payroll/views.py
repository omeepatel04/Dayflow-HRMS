from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payroll
from .serializers import PayrollSerializer, PayrollCreateSerializer
from .permissions import IsPayrollOwnerOrAdmin
from users.permissions import IsAdminOrHR


class CreatePayrollView(generics.CreateAPIView):
    """Create Payroll API (Admin/HR only)"""
    
    serializer_class = PayrollCreateSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]


class UpdatePayrollView(generics.UpdateAPIView):
    """Update Payroll API (Admin/HR only)"""
    
    queryset = Payroll.objects.all()
    serializer_class = PayrollCreateSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]


class MyPayrollView(generics.ListAPIView):
    """View own payroll API (Read-only for employees)"""
    
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payroll.objects.filter(employee=self.request.user)


class AllPayrollView(generics.ListAPIView):
    """View all payroll API (Admin/HR only)"""
    
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]


class PayrollDetailView(generics.RetrieveAPIView):
    """View specific payroll details"""
    
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated, IsPayrollOwnerOrAdmin]
