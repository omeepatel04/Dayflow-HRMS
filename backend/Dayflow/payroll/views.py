from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from datetime import datetime
from .models import Payroll, PayrollComponent, SalaryStructure
from .serializers import (
    PayrollSerializer, PayrollCreateSerializer,
    PayrollComponentSerializer, SalaryStructureSerializer
)
from users.permissions import IsAdminOrHR, ReadOnlyForEmployees


class CreatePayrollView(APIView):
    """Create payroll record (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
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
    permission_classes = [IsAdminOrHR]
    
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
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAdminOrHR]
    
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
    permission_classes = [ReadOnlyForEmployees]
    
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


class PayrollComponentListView(APIView):
    """List and create payroll components (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        component_type = request.query_params.get('type', None)
        
        components = PayrollComponent.objects.filter(is_active=True)
        
        if component_type:
            components = components.filter(component_type=component_type.upper())
        
        serializer = PayrollComponentSerializer(components, many=True)
        return Response({
            'count': components.count(),
            'components': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PayrollComponentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Component created successfully',
                'component': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalaryStructureView(APIView):
    """Get or create salary structure"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Allow HR/Admin to query specific employee
        employee_id = request.query_params.get('employee_id', None)
        if employee_id and user.role in ['ADMIN', 'HR']:
            try:
                from users.models import User
                employee = User.objects.get(id=employee_id)
            except User.DoesNotExist:
                return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            employee = user
        
        try:
            structure = SalaryStructure.objects.get(employee=employee, is_active=True)
            serializer = SalaryStructureSerializer(structure)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SalaryStructure.DoesNotExist:
            return Response({'error': 'Salary structure not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        # Only HR/Admin can create salary structures
        if request.user.role not in ['ADMIN', 'HR']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SalaryStructureSerializer(data=request.data)
        if serializer.is_valid():
            # Deactivate previous structure
            SalaryStructure.objects.filter(
                employee=serializer.validated_data['employee']
            ).update(is_active=False)
            
            serializer.save()
            return Response({
                'message': 'Salary structure created successfully',
                'structure': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GeneratePayrollView(APIView):
    """Generate payroll from salary structure (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def post(self, request):
        employee_id = request.data.get('employee_id')
        month = request.data.get('month')  # Format: YYYY-MM-01
        
        if not employee_id or not month:
            return Response({
                'error': 'employee_id and month are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from users.models import User
            employee = User.objects.get(id=employee_id)
            structure = SalaryStructure.objects.get(employee=employee, is_active=True)
            
            # Check if payroll already exists
            month_date = datetime.strptime(month, '%Y-%m-%d').date()
            if Payroll.objects.filter(employee=employee, month=month_date).exists():
                return Response({
                    'error': 'Payroll already exists for this month'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create payroll from structure
            payroll = Payroll.objects.create(
                employee=employee,
                basic_salary=structure.basic_salary,
                allowances=structure.total_allowances(),
                deductions=structure.total_deductions(),
                tax=structure.income_tax,
                month=month_date,
                status='DRAFT'
            )
            
            serializer = PayrollSerializer(payroll)
            return Response({
                'message': 'Payroll generated successfully',
                'payroll': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        except SalaryStructure.DoesNotExist:
            return Response({
                'error': 'Salary structure not found for this employee'
            }, status=status.HTTP_404_NOT_FOUND)


class PayrollStatusUpdateView(APIView):
    """Update payroll status (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def patch(self, request, pk):
        payroll = get_object_or_404(Payroll, pk=pk)
        new_status = request.data.get('status')
        
        if new_status not in ['DRAFT', 'PROCESSED', 'PAID']:
            return Response({
                'error': 'Invalid status. Use: DRAFT, PROCESSED, or PAID'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payroll.status = new_status
        
        # Set payment date when marking as PAID
        if new_status == 'PAID' and not payroll.payment_date:
            from datetime import date
            payroll.payment_date = date.today()
        
        payroll.save()
        
        serializer = PayrollSerializer(payroll)
        return Response({
            'message': f'Payroll status updated to {new_status}',
            'payroll': serializer.data
        }, status=status.HTTP_200_OK)


class PayrollSummaryView(APIView):
    """Get payroll summary for a specific period (Admin/HR only)"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        year = request.query_params.get('year', datetime.now().year)
        month = request.query_params.get('month', None)
        
        payrolls = Payroll.objects.filter(month__year=year)
        
        if month:
            payrolls = payrolls.filter(month__month=month)
        
        summary = payrolls.aggregate(
            total_basic=Sum('basic_salary'),
            total_allowances=Sum('allowances'),
            total_deductions=Sum('deductions'),
            total_tax=Sum('tax'),
            total_gross=Sum('gross_salary'),
            total_net=Sum('net_salary')
        )
        
        return Response({
            'year': year,
            'month': month,
            'employee_count': payrolls.values('employee').distinct().count(),
            'payroll_count': payrolls.count(),
            'summary': {
                'total_basic_salary': float(summary['total_basic'] or 0),
                'total_allowances': float(summary['total_allowances'] or 0),
                'total_deductions': float(summary['total_deductions'] or 0),
                'total_tax': float(summary['total_tax'] or 0),
                'total_gross_salary': float(summary['total_gross'] or 0),
                'total_net_salary': float(summary['total_net'] or 0)
            }
        }, status=status.HTTP_200_OK)
