from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TemplateViewSet,
    TemplateSectionViewSet,
    ContentElementViewSet,
    TemplateDetailView
)

router = DefaultRouter()
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'sections', TemplateSectionViewSet, basename='section')
router.register(r'elements', ContentElementViewSet, basename='element')

urlpatterns = [
    path('', include(router.urls)),
    path('templates/<int:pk>/detail/', TemplateDetailView.as_view(), name='template-detail'),
]
