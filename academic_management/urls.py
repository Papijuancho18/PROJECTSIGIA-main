from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/templates/', include('templates.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/charts/', include('charts.urls')),
    path('api/tables/', include('tables.urls')),
    path('api/exports/', include('exports.urls')),
    path('api/collaboration/', include('collaboration.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
