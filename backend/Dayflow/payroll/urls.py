from django.urls import path
from .views import (
    CreatePayrollView,
    UpdatePayrollView,
    MyPayrollView,
    AllPayrollView,
    PayrollDetailView,
    PayrollComponentListView,
    SalaryStructureView,
    GeneratePayrollView,
    PayrollStatusUpdateView,
    PayrollSummaryView
)

urlpatterns = [
    path('create/', CreatePayrollView.as_view(), name='create-payroll'),
    path('<int:pk>/update/', UpdatePayrollView.as_view(), name='update-payroll'),
    path('my-payroll/', MyPayrollView.as_view(), name='my-payroll'),
    path('all/', AllPayrollView.as_view(), name='all-payroll'),
    path('<int:pk>/', PayrollDetailView.as_view(), name='payroll-detail'),
    
    # Component management
    path('components/', PayrollComponentListView.as_view(), name='payroll-components'),
    
    # Salary structure
    path('salary-structure/', SalaryStructureView.as_view(), name='salary-structure'),
    
    # Payroll generation and status
    path('generate/', GeneratePayrollView.as_view(), name='generate-payroll'),
    path('<int:pk>/status/', PayrollStatusUpdateView.as_view(), name='payroll-status'),
    
    # Summary
    path('summary/', PayrollSummaryView.as_view(), name='payroll-summary'),
]
