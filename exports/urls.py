from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExportJobViewSet, ExportConfigViewSet, download_export

router = DefaultRouter()
router.register(r'jobs', ExportJobViewSet)
router.register(r'configs', ExportConfigViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('download/<int:pk>/', download_export, name='download_export'),
]
