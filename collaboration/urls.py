from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollaborationSessionViewSet

router = DefaultRouter()
router.register(r'sessions', CollaborationSessionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
