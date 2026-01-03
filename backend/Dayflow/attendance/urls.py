from django.urls import path
from .views import (
    CheckInView,
    CheckOutView,
    MyAttendanceView,
    AllAttendanceView,
    AttendanceDetailView,
    MonthlyAttendanceSummaryView,
    RegularizationRequestView,
    MyRegularizationsView,
    AllRegularizationsView,
    RegularizationApprovalView
)

urlpatterns = [
    path('check-in/', CheckInView.as_view(), name='check-in'),
    path('check-out/', CheckOutView.as_view(), name='check-out'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('monthly-summary/', MonthlyAttendanceSummaryView.as_view(), name='monthly-summary'),
    path('all/', AllAttendanceView.as_view(), name='all-attendance'),
    path('<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    
    # Regularization endpoints
    path('regularization/request/', RegularizationRequestView.as_view(), name='regularization-request'),
    path('regularization/my-requests/', MyRegularizationsView.as_view(), name='my-regularizations'),
    path('regularization/all/', AllRegularizationsView.as_view(), name='all-regularizations'),
    path('regularization/<int:pk>/approve/', RegularizationApprovalView.as_view(), name='regularization-approval'),
]
