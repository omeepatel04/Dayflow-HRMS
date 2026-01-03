from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .jwt_serializers import CustomTokenObtainPairView
from .views import (
    UserRegistrationView, 
    UserProfileView, 
    EmployeeProfileView, 
    EmployeeListView,
    UserListView,
    UserDetailView,
    LogoutView
)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profiles
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('employee-profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    
    # Lists
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
]
