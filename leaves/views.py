from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Leave
from .serializers import LeaveSerializer, LeaveApprovalSerializer
from .permissions import IsLeaveOwnerOrAdmin
from users.permissions import IsAdminOrHR


class ApplyLeaveView(generics.CreateAPIView):
    """Apply Leave API"""
    
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyLeavesView(generics.ListAPIView):
    """View own leaves API"""
    
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Leave.objects.filter(employee=self.request.user)


class AllLeavesView(generics.ListAPIView):
    """View all leaves API (Admin/HR only)"""
    
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]


class LeaveDetailView(generics.RetrieveAPIView):
    """View specific leave details"""
    
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated, IsLeaveOwnerOrAdmin]


class LeaveApprovalView(generics.UpdateAPIView):
    """Approve/Reject Leave API (Admin/HR only)"""
    
    queryset = Leave.objects.all()
    serializer_class = LeaveApprovalSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # TODO: Update attendance records when leave is approved
        
        return Response(LeaveSerializer(instance).data)
