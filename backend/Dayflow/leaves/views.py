from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ApplyLeaveView(APIView):
    def post(self, request):
        return Response({'message': 'Leave application submitted'}, status=status.HTTP_201_CREATED)

class MyLeavesView(APIView):
    def get(self, request):
        return Response({'leaves': []}, status=status.HTTP_200_OK)

class AllLeavesView(APIView):
    def get(self, request):
        return Response({'leaves': []}, status=status.HTTP_200_OK)

class LeaveDetailView(APIView):
    def get(self, request, pk):
        return Response({'id': pk}, status=status.HTTP_200_OK)

class LeaveApprovalView(APIView):
    def post(self, request, pk):
        return Response({'message': 'Leave approved'}, status=status.HTTP_200_OK)
