from django.contrib import admin
from .models import Chart, ChartData


@admin.register(Chart)
class ChartAdmin(admin.ModelAdmin):
    list_display = ('name', 'chart_type', 'created_by', 'created_at')
    list_filter = ('chart_type', 'created_at')
    search_fields = ('name', 'description')


@admin.register(ChartData)
class ChartDataAdmin(admin.ModelAdmin):
    list_display = ('chart', 'created_at')
    list_filter = ('created_at',)
