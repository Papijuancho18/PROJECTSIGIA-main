from django.contrib import admin
from .models import Report, ReportVersion


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'template', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'created_at', 'template')
    search_fields = ('title', 'description')


@admin.register(ReportVersion)
class ReportVersionAdmin(admin.ModelAdmin):
    list_display = ('report', 'version_number', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('report__title', 'notes')
