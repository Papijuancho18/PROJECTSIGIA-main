from django.contrib import admin
from .models import Table, TableData


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')


@admin.register(TableData)
class TableDataAdmin(admin.ModelAdmin):
    list_display = ('table', 'created_at')
    list_filter = ('created_at',)
