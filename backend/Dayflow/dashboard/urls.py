from django.urls import path
from .views import EmployeeDashboardView, HRDashboardView

urlpatterns = [
    path('employee/', EmployeeDashboardView.as_view(), name='employee-dashboard'),
    path('hr/', HRDashboardView.as_view(), name='hr-dashboard'),
]
