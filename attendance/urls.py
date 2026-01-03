from django.urls import path
from .views import CheckInView, CheckOutView, MyAttendanceView, AllAttendanceView

urlpatterns = [
    path('check-in/', CheckInView.as_view(), name='check-in'),
    path('check-out/', CheckOutView.as_view(), name='check-out'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('all/', AllAttendanceView.as_view(), name='all-attendance'),
]
