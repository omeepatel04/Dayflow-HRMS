from django.urls import path
from .views import (
    ApplyLeaveView,
    MyLeavesView,
    AllLeavesView,
    LeaveDetailView,
    LeaveApprovalView,
    LeaveCancelView
)

urlpatterns = [
    path('apply/', ApplyLeaveView.as_view(), name='apply-leave'),
    path('my-leaves/', MyLeavesView.as_view(), name='my-leaves'),
    path('all/', AllLeavesView.as_view(), name='all-leaves'),
    path('<int:pk>/', LeaveDetailView.as_view(), name='leave-detail'),
    path('<int:pk>/approve/', LeaveApprovalView.as_view(), name='leave-approval'),
    path('<int:pk>/cancel/', LeaveCancelView.as_view(), name='leave-cancel'),
]
