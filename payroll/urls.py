from django.urls import path
from .views import (
    CreatePayrollView,
    UpdatePayrollView,
    MyPayrollView,
    AllPayrollView,
    PayrollDetailView
)

urlpatterns = [
    path('create/', CreatePayrollView.as_view(), name='create-payroll'),
    path('<int:pk>/update/', UpdatePayrollView.as_view(), name='update-payroll'),
    path('my-payroll/', MyPayrollView.as_view(), name='my-payroll'),
    path('all/', AllPayrollView.as_view(), name='all-payroll'),
    path('<int:pk>/', PayrollDetailView.as_view(), name='payroll-detail'),
]
