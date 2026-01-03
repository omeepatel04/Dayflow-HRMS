from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class CheckInView(APIView):
    def post(self, request):
        return Response({'message': 'Check-in successful'}, status=status.HTTP_201_CREATED)

class CheckOutView(APIView):
    def post(self, request):
        return Response({'message': 'Check-out successful'}, status=status.HTTP_200_OK)

class MyAttendanceView(APIView):
    def get(self, request):
        return Response({'attendance': []}, status=status.HTTP_200_OK)

class AllAttendanceView(APIView):
    def get(self, request):
        return Response({'attendance': []}, status=status.HTTP_200_OK)

class AttendanceDetailView(APIView):
    def get(self, request, pk):
        return Response({'id': pk}, status=status.HTTP_200_OK)
