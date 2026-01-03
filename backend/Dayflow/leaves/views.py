from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Leave
from .serializers import LeaveSerializer, LeaveApprovalSerializer
from users.permissions import IsAdminOrHR, CanApproveLeaves, IsOwnerOrAdmin


class ApplyLeaveView(APIView):
    """Apply for leave"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = LeaveSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee=user)
            return Response({
                'message': 'Leave application submitted successfully',
                'leave': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyLeavesView(APIView):
    """Get current user's leave applications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Filter parameters
        status_filter = request.query_params.get('status', None)
        leave_type = request.query_params.get('leave_type', None)
        from_date = request.query_params.get('from_date', None)
        to_date = request.query_params.get('to_date', None)
        
        leaves = Leave.objects.filter(employee=user)
        
        if status_filter:
            leaves = leaves.filter(status=status_filter.upper())
        if leave_type:
            leaves = leaves.filter(leave_type=leave_type.upper())
        if from_date:
            leaves = leaves.filter(start_date__gte=from_date)
        if to_date:
            leaves = leaves.filter(end_date__lte=to_date)
        
        serializer = LeaveSerializer(leaves, many=True)
        return Response({
            'count': leaves.count(),
            'leaves': serializer.data
        }, status=status.HTTP_200_OK)


class AllLeavesView(APIView):
    """Get all leave applications (Admin/HR/Manager)"""
    permission_classes = [IsAdminOrHR]
    
    def get(self, request):
        # Filter parameters
        employee_id = request.query_params.get('employee_id', None)
        status_filter = request.query_params.get('status', None)
        leave_type = request.query_params.get('leave_type', None)
        from_date = request.query_params.get('from_date', None)
        to_date = request.query_params.get('to_date', None)
        
        leaves = Leave.objects.select_related('employee').all()
        
        if employee_id:
            leaves = leaves.filter(employee__id=employee_id)
        if status_filter:
            leaves = leaves.filter(status=status_filter.upper())
        if leave_type:
            leaves = leaves.filter(leave_type=leave_type.upper())
        if from_date:
            leaves = leaves.filter(start_date__gte=from_date)
        if to_date:
            leaves = leaves.filter(end_date__lte=to_date)
        
        serializer = LeaveSerializer(leaves, many=True)
        return Response({
            'count': leaves.count(),
            'leaves': serializer.data
        }, status=status.HTTP_200_OK)


class LeaveDetailView(APIView):
    """Get, update, or delete specific leave application"""
    permission_classes = [IsOwnerOrAdmin]
    
    def get(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)
        serializer = LeaveSerializer(leave)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)
        
        # Only allow updates if leave is still pending
        if leave.status != 'PENDING':
            return Response({
                'error': 'Cannot update leave that is already approved or rejected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LeaveSerializer(leave, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Leave updated successfully',
                'leave': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)
        
        # Only allow deletion if leave is still pending
        if leave.status != 'PENDING':
            return Response({
                'error': 'Cannot delete leave that is already approved or rejected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        leave.delete()
        return Response({
            'message': 'Leave deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class LeaveApprovalView(APIView):
    """Approve or reject leave application (Admin/HR/Manager)"""
    permission_classes = [CanApproveLeaves]
    
    def post(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)
        
        if leave.status != 'PENDING':
            return Response({
                'error': 'Leave has already been processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LeaveApprovalSerializer(leave, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': f'Leave {serializer.data["status"].lower()} successfully',
                'leave': LeaveSerializer(leave).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LeaveCancelView(APIView):
    """Cancel approved leave"""
    
    def post(self, request, pk):
        user = request.user if hasattr(request, 'user') else None
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        leave = get_object_or_404(Leave, pk=pk, employee=user)
        
        if leave.status == 'REJECTED':
            return Response({
                'error': 'Cannot cancel rejected leave'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        leave.status = 'PENDING'
        leave.admin_comment = 'Cancelled by employee'
        leave.save()
        
        serializer = LeaveSerializer(leave)
        return Response({
            'message': 'Leave cancelled successfully',
            'leave': serializer.data
        }, status=status.HTTP_200_OK)
