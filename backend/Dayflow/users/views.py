from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class UserRegistrationView(APIView):
    def post(self, request):
        return Response({'message': 'User registered'}, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    def get(self, request):
        return Response({'profile': {}}, status=status.HTTP_200_OK)
    
    def put(self, request):
        return Response({'message': 'Profile updated'}, status=status.HTTP_200_OK)

class EmployeeProfileView(APIView):
    def get(self, request):
        return Response({'employee_profile': {}}, status=status.HTTP_200_OK)
    
    def put(self, request):
        return Response({'message': 'Employee profile updated'}, status=status.HTTP_200_OK)

class EmployeeListView(APIView):
    def get(self, request):
        return Response({'employees': []}, status=status.HTTP_200_OK)

class UserListView(APIView):
    def get(self, request):
        return Response({'users': []}, status=status.HTTP_200_OK)
