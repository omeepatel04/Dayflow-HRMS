from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRegistrationView, UserProfileView, EmployeeProfileView, EmployeeListView

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('employee-profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
]
