from django.urls import path
from .views import (
    MyNotificationsView,
    NotificationDetailView,
    MarkAllReadView,
    CreateNotificationView,
    BroadcastNotificationView,
    NotificationPreferencesView,
    NotificationStatsView
)

urlpatterns = [
    path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark-all-read'),
    path('create/', CreateNotificationView.as_view(), name='create-notification'),
    path('broadcast/', BroadcastNotificationView.as_view(), name='broadcast-notification'),
    path('preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),
    path('stats/', NotificationStatsView.as_view(), name='notification-stats'),
]
