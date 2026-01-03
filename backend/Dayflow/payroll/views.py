from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class CreatePayrollView(APIView):
    def post(self, request):
        return Response({'message': 'Payroll created'}, status=status.HTTP_201_CREATED)

class UpdatePayrollView(APIView):
    def put(self, request, pk):
        return Response({'message': 'Payroll updated'}, status=status.HTTP_200_OK)

class MyPayrollView(APIView):
    def get(self, request):
        return Response({'payroll': []}, status=status.HTTP_200_OK)

class AllPayrollView(APIView):
    def get(self, request):
        return Response({'payroll': []}, status=status.HTTP_200_OK)

class PayrollDetailView(APIView):
    def get(self, request, pk):
        return Response({'id': pk}, status=status.HTTP_200_OK)
