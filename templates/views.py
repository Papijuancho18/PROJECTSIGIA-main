from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Template, TemplateSection, ContentElement
from .serializers import (
    TemplateSerializer, 
    TemplateCreateSerializer, 
    EnhancedTemplateSerializer,
    TemplateSectionSerializer,
    ContentElementSerializer
)
import json
import logging

logger = logging.getLogger(__name__)

class TemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar plantillas
    """
    queryset = Template.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TemplateCreateSerializer
        elif self.action in ['list', 'retrieve', 'save_enhanced', 'create_personal_copy', 'duplicate']:
            return EnhancedTemplateSerializer
        return TemplateSerializer
    
    def get_queryset(self):
        """
        Filtrar plantillas según el usuario y parámetros
        """
        queryset = Template.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(
                models.Q(created_by=self.request.user) | 
                models.Q(is_public=True)
            )
        
        # Filtros adicionales
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        template_type = self.request.query_params.get('type', None)
        if template_type:
            queryset = queryset.filter(template_type=template_type)
        
        is_public = self.request.query_params.get('public', None)
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear plantilla asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def save_enhanced(self, request, pk=None):
        """
        Guardar plantilla con contenido enhanced
        """
        try:
            template = self.get_object()
            
            # Verificar permisos
            if template.created_by != request.user and not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para editar esta plantilla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Actualizar contenido
            template.content = request.data.get('content', template.content)
            template.save()
            
            serializer = EnhancedTemplateSerializer(template)
            return Response({
                'template': serializer.data,
                'message': 'Plantilla guardada exitosamente'
            })
        except Exception as e:
            logger.error(f"Error saving enhanced template: {e}")
            return Response(
                {'error': 'Error al guardar la plantilla'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def create_personal_copy(self, request, pk=None):
        """
        Crear copia personal de una plantilla
        """
        try:
            original_template = self.get_object()
            
            # Crear copia
            new_template = Template.objects.create(
                name=f"Copia de {original_template.name}",
                description=original_template.description,
                content=original_template.content,
                category=original_template.category,
                template_type=original_template.template_type,
                tags=original_template.tags,
                is_public=False,
                created_by=request.user
            )
            
            serializer = EnhancedTemplateSerializer(new_template)
            return Response({
                'template': serializer.data,
                'message': 'Copia personal creada exitosamente'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating personal copy: {e}")
            return Response(
                {'error': 'Error al crear copia personal'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicar plantilla
        """
        try:
            original_template = self.get_object()
            
            # Crear duplicado
            new_template = Template.objects.create(
                name=f"Duplicado de {original_template.name}",
                description=original_template.description,
                content=original_template.content,
                category=original_template.category,
                template_type=original_template.template_type,
                tags=original_template.tags,
                is_public=False,
                created_by=request.user
            )
            
            serializer = EnhancedTemplateSerializer(new_template)
            return Response({
                'template': serializer.data,
                'message': 'Plantilla duplicada exitosamente'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error duplicating template: {e}")
            return Response(
                {'error': 'Error al duplicar plantilla'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def debug(self, request, pk=None):
        """
        Debug de plantilla
        """
        template = self.get_object()
        return Response({
            'id': template.id,
            'name': template.name,
            'created_by': template.created_by.username if template.created_by else None,
            'is_public': template.is_public,
            'content_length': len(template.content) if template.content else 0
        })
    
    @action(detail=True, methods=['get'])
    def test(self, request, pk=None):
        """
        Test action
        """
        return Response({'message': 'Test successful'})
    
    @action(detail=False, methods=['get'])
    def available_for_reports(self, request):
        """
        Obtener plantillas disponibles para reportes
        """
        try:
            user = request.user
        
            # Obtener plantillas públicas y del usuario
            templates = Template.objects.filter(
                models.Q(is_public=True) | models.Q(created_by=user),
                is_active=True
            ).order_by('-created_at')
        
            serializer = EnhancedTemplateSerializer(templates, many=True)
        
            return Response({
                'results': serializer.data,
                'count': templates.count()
            })
        except Exception as e:
            logger.error(f"Error getting available templates: {e}")
            return Response(
                {'error': 'Error al obtener plantillas disponibles'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ContentElementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar elementos de contenido
    """
    queryset = ContentElement.objects.all()
    serializer_class = ContentElementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar elementos por sección si se proporciona
        """
        queryset = ContentElement.objects.all()
        section_id = self.request.query_params.get('section', None)
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return queryset.order_by('order')

class TemplateSectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar secciones de plantillas
    """
    queryset = TemplateSection.objects.all()
    serializer_class = TemplateSectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar secciones por plantilla si se proporciona
        """
        queryset = TemplateSection.objects.all()
        template_id = self.request.query_params.get('template', None)
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        return queryset.order_by('order')

class TemplateDetailView(APIView):
    """
    Vista detallada de plantilla
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        Obtener detalles de una plantilla
        """
        try:
            template = get_object_or_404(Template, pk=pk)
            
            # Verificar permisos
            if not template.is_public and template.created_by != request.user:
                if not (request.user.is_superuser or request.user.role == 'admin'):
                    return Response(
                        {'error': 'No tienes permisos para ver esta plantilla'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            serializer = EnhancedTemplateSerializer(template)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting template detail: {e}")
            return Response(
                {'error': 'Error al obtener detalles de la plantilla'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
