from django.contrib import admin
from .models import Template, TemplateSection


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'created_by', 'created_at')
    list_filter = ('template_type', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TemplateSection)
class TemplateSectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'template', 'section_type', 'order', 'is_required')
    list_filter = ('section_type', 'is_required')
    search_fields = ('name', 'template__name')
