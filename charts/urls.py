from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChartViewSet, ChartDataViewSet

router = DefaultRouter()
router.register(r'charts', ChartViewSet)
router.register(r'data', ChartDataViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
