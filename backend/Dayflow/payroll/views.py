from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Payroll
from .serializers import PayrollSerializer, PayrollCreateSerializer


class CreatePayrollView(APIView):
    """Create payroll record (Admin/HR only)"""
    
    def post(self, request):
        serializer = PayrollCreateSerializer(data=request.data)
        if serializer.is_valid():
            payroll = serializer.save()
            return Response({
                'message': 'Payroll created successfully',
                'payroll': PayrollSerializer(payroll).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePayrollView(APIView):
    """Update payroll record (Admin/HR only)"""
    
    def put(self, request, pk):
        payroll = get_object_or_404(Payroll, pk=pk)
        serializer = PayrollCreateSerializer(payroll, data=request.data, partial=True)
        if serializer.is_valid():
            payroll = serializer.save()
            return Response({
                'message': 'Payroll updated successfully',
                'payroll': PayrollSerializer(payroll).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyPayrollView(APIView):
    """Get current user's payroll records"""
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Filter parameters
        month = request.query_params.get('month', None)
        year = request.query_params.get('year', None)
        
        payrolls = Payroll.objects.filter(employee=user)
        
        if month:
            payrolls = payrolls.filter(month__month=month)
        if year:
            payrolls = payrolls.filter(month__year=year)
        
        serializer = PayrollSerializer(payrolls, many=True)
        return Response({
            'count': payrolls.count(),
            'payroll': serializer.data
        }, status=status.HTTP_200_OK)


class AllPayrollView(APIView):
    """Get all payroll records (Admin/HR only)"""
    
    def get(self, request):
        # Filter parameters
        employee_id = request.query_params.get('employee_id', None)
        month = request.query_params.get('month', None)
        year = request.query_params.get('year', None)
        
        payrolls = Payroll.objects.select_related('employee').all()
        
        if employee_id:
            payrolls = payrolls.filter(employee__id=employee_id)
        if month:
            payrolls = payrolls.filter(month__month=month)
        if year:
            payrolls = payrolls.filter(month__year=year)
        
        serializer = PayrollSerializer(payrolls, many=True)
        return Response({
            'count': payrolls.count(),
            'payroll': serializer.data
        }, status=status.HTTP_200_OK)


class PayrollDetailView(APIView):
    """Get or delete specific payroll record"""
    
    def get(self, request, pk):
        payroll = get_object_or_404(Payroll, pk=pk)
        serializer = PayrollSerializer(payroll)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        payroll = get_object_or_404(Payroll, pk=pk)
        payroll.delete()
        return Response({
            'message': 'Payroll deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
