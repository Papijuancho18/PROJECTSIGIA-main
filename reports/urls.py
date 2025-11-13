from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportVersionViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'versions', ReportVersionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
