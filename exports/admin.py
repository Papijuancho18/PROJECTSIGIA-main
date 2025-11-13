from django.contrib import admin
from .models import ExportJob, ExportConfig

@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    list_display = ('name', 'format', 'status', 'created_by', 'created_at')
    list_filter = ('format', 'status', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)

@admin.register(ExportConfig)
class ExportConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'format', 'created_by', 'created_at')
    list_filter = ('format', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)
