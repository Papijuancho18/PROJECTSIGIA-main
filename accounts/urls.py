from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # Router URLs (incluye CRUD de usuarios)
    path('', include(router.urls)),
    
    # Autenticación
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Perfil de usuario
    path('profile/', views.profile_view, name='profile'),
    path('me/', views.get_current_user_profile, name='current_user_profile'),
    path('me/update/', views.update_current_user_profile, name='update_current_user_profile'),
    
    # Operaciones en lote
    path('users/bulk-delete/', views.bulk_delete_users, name='bulk-delete-users'),
    path('users/bulk-update/', views.bulk_update_users, name='bulk-update-users'),
    path('users/search/', views.search_users, name='search-users'),
    
    # Utilidades
    path('health/', views.health_check, name='health_check'),
]
