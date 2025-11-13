from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

# Obtener el modelo de usuario personalizado
User = get_user_model()

class Template(models.Model):
    """Modelo para plantillas de reportes"""
    TEMPLATE_TYPES = [
        ('report', 'Reporte'),
        ('document', 'Documento'),
        ('presentation', 'Presentación'),
        ('form', 'Formulario'),
    ]
    
    CATEGORIES = [
        ('académico', 'Académico'),
        ('ejecutivo', 'Ejecutivo'),
        ('investigación', 'Investigación'),
        ('estadístico', 'Estadístico'),
        ('evaluación', 'Evaluación'),
        ('digital', 'Digital'),
        ('personalizada', 'Personalizada'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    content = models.JSONField(default=dict, verbose_name="Contenido")
    category = models.CharField(max_length=50, choices=CATEGORIES, default='académico')
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES, default='report')
    tags = models.JSONField(default=list, blank=True)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plantilla"
        verbose_name_plural = "Plantillas"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class TemplateSection(models.Model):
    """Secciones de las plantillas"""
    SECTION_TYPES = [
        ('text', 'Texto'),
        ('heading', 'Encabezado'),
        ('list', 'Lista'),
        ('table', 'Tabla'),
        ('chart', 'Gráfico'),
        ('image', 'Imagen'),
    ]
    
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    section_type = models.CharField(max_length=50, choices=SECTION_TYPES, default='text')
    content = models.JSONField(default=dict)
    order = models.IntegerField(default=0)
    is_required = models.BooleanField(default=False)
    is_expanded = models.BooleanField(default=True)
    parent_section = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subsections')
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.template.name} - {self.title}"

class ContentElement(models.Model):
    """Elementos de contenido dentro de las secciones"""
    ELEMENT_TYPES = [
        ('text', 'Texto'),
        ('heading1', 'Título 1'),
        ('heading2', 'Título 2'),
        ('list', 'Lista'),
        ('chart', 'Gráfico'),
        ('table', 'Tabla'),
        ('image', 'Imagen'),
    ]
    
    section = models.ForeignKey(TemplateSection, on_delete=models.CASCADE, related_name='elements')
    element_type = models.CharField(max_length=50, choices=ELEMENT_TYPES)
    content = models.JSONField(default=dict)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.section.title} - {self.element_type}"

class TemplateVariable(models.Model):
    """Variables para las plantillas"""
    VARIABLE_TYPES = [
        ('text', 'Texto'),
        ('number', 'Número'),
        ('date', 'Fecha'),
        ('boolean', 'Booleano'),
        ('list', 'Lista'),
    ]
    
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='variables')
    name = models.CharField(max_length=100)
    variable_type = models.CharField(max_length=50, choices=VARIABLE_TYPES)
    default_value = models.JSONField(default=dict, blank=True)
    is_required = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"
