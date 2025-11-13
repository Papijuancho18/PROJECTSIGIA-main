from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Report, ReportVersion, ReportComment
from .serializers import (
    ReportSerializer, 
    ReportCreateSerializer, 
    ReportVersionSerializer,
    ReportCommentSerializer
)
from templates.models import Template
import json
import logging

logger = logging.getLogger(__name__)

def is_admin(user):
    return user.is_staff and user.is_superuser

def is_staff(user):
    return user.is_staff

@login_required
@user_passes_test(is_admin)
def admin_report(request):
    """
    View for generating reports accessible only to admin users.
    """
    return HttpResponse("Admin Report")

@login_required
@user_passes_test(is_staff)
def staff_report(request):
    """
    View for generating reports accessible only to staff users.
    """
    return HttpResponse("Staff Report")

@login_required
def user_report(request):
    """
    View for generating reports accessible to all logged-in users.
    """
    return HttpResponse("User Report")

class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reportes
    """
    queryset = Report.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_queryset(self):
        """
        Filtrar reportes según el usuario y parámetros
        """
        queryset = Report.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(
                models.Q(created_by=self.request.user) | 
                models.Q(assigned_to=self.request.user)
            )
        
        # Filtros adicionales
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        template_id = self.request.query_params.get('template', None)
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear reporte asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """
        Listar reportes con información adicional
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Paginación
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'count': queryset.count(),
                'results': serializer.data,
                'status_choices': Report.STATUS_CHOICES
            })
        except Exception as e:
            logger.error(f"Error listing reports: {e}")
            return Response(
                {'error': 'Error al obtener reportes'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """
        Agregar comentario a un reporte
        """
        try:
            report = self.get_object()
            
            # Verificar permisos
            if report.created_by != request.user and report.assigned_to != request.user:
                if not (request.user.is_superuser or request.user.role == 'admin'):
                    return Response(
                        {'error': 'No tienes permisos para comentar en este reporte'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            data = request.data.copy()
            data['report'] = report.id
            
            serializer = ReportCommentSerializer(data=data)
            
            if serializer.is_valid():
                comment = serializer.save(user=request.user)
                response_serializer = ReportCommentSerializer(comment)
                
                return Response({
                    'comment': response_serializer.data,
                    'message': 'Comentario agregado exitosamente'
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Error adding comment to report {pk}: {e}")
            return Response(
                {'error': 'Error al agregar comentario'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Cambiar el estado de un reporte
        """
        try:
            report = self.get_object()
            new_status = request.data.get('status')
            
            if new_status not in dict(Report.STATUS_CHOICES):
                return Response(
                    {'error': 'Estado inválido'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar permisos
            if report.created_by != request.user and report.assigned_to != request.user:
                if not (request.user.is_superuser or request.user.role == 'admin'):
                    return Response(
                        {'error': 'No tienes permisos para cambiar el estado de este reporte'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            old_status = report.status
            report.status = new_status
            report.save()
            
            # Agregar comentario automático sobre el cambio de estado
            ReportComment.objects.create(
                report=report,
                user=request.user,
                content=f"Estado cambiado de '{dict(Report.STATUS_CHOICES)[old_status]}' a '{dict(Report.STATUS_CHOICES)[new_status]}'"
            )
            
            serializer = ReportSerializer(report)
            return Response({
                'report': serializer.data,
                'message': f'Estado cambiado a {dict(Report.STATUS_CHOICES)[new_status]}'
            })
        
        except Exception as e:
            logger.error(f"Error changing status of report {pk}: {e}")
            return Response(
                {'error': 'Error al cambiar el estado del reporte'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReportVersionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar versiones de reportes
    """
    queryset = ReportVersion.objects.all().order_by('-created_at')
    serializer_class = ReportVersionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar versiones según el usuario y parámetros
        """
        queryset = ReportVersion.objects.all().order_by('-created_at')
        
        # Filtrar por reporte específico si se proporciona
        report_id = self.request.query_params.get('report', None)
        if report_id:
            queryset = queryset.filter(report_id=report_id)
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(
                models.Q(report__created_by=self.request.user) | 
                models.Q(report__assigned_to=self.request.user) |
                models.Q(created_by=self.request.user)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear versión asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restaurar una versión específica como la versión actual del reporte
        """
        try:
            version = self.get_object()
            report = version.report
            
            # Verificar permisos
            if report.created_by != request.user and report.assigned_to != request.user:
                if not (request.user.is_superuser or request.user.role == 'admin'):
                    return Response(
                        {'error': 'No tienes permisos para restaurar versiones de este reporte'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Crear nueva versión con el contenido restaurado
            last_version = report.versions.first()
            new_version_number = (last_version.version_number + 1) if last_version else 1
            
            # Actualizar el contenido del reporte
            report.content = version.content
            report.save()
            
            # Crear nueva versión
            new_version = ReportVersion.objects.create(
                report=report,
                version_number=new_version_number,
                content=version.content,
                created_by=request.user,
                notes=f'Restaurado desde versión {version.version_number}'
            )
            
            # Agregar comentario automático
            ReportComment.objects.create(
                report=report,
                user=request.user,
                content=f'Reporte restaurado desde versión {version.version_number}'
            )
            
            serializer = ReportVersionSerializer(new_version)
            return Response({
                'version': serializer.data,
                'message': f'Versión {version.version_number} restaurada exitosamente'
            })
        
        except Exception as e:
            logger.error(f"Error restoring version {pk}: {e}")
            return Response(
                {'error': 'Error al restaurar la versión'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Crear un nuevo reporte
    """
    try:
        serializer = ReportCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Verificar que la plantilla existe y es accesible
            template_id = serializer.validated_data.get('template').id
            template = get_object_or_404(Template, id=template_id)
            
            if not template.is_public and template.created_by != request.user:
                if not (request.user.is_superuser or request.user.role == 'admin'):
                    return Response(
                        {'error': 'No tienes permisos para usar esta plantilla'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            report = serializer.save(created_by=request.user)
            
            # Crear primera versión
            ReportVersion.objects.create(
                report=report,
                version_number=1,
                content=report.content,
                created_by=request.user,
                notes="Versión inicial"
            )
            
            response_serializer = ReportSerializer(report)
            return Response({
                'report': response_serializer.data,
                'message': 'Reporte creado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error creating report: {e}")
        return Response(
            {'error': 'Error al crear el reporte'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_report(request, report_id):
    """
    Actualizar un reporte existente
    """
    try:
        report = get_object_or_404(Report, id=report_id)
        
        # Verificar permisos
        if report.created_by != request.user and report.assigned_to != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para editar este reporte'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ReportSerializer(report, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Crear nueva versión si el contenido cambió
            old_content = report.content
            updated_report = serializer.save()
            
            if old_content != updated_report.content:
                last_version = report.versions.first()
                new_version_number = (last_version.version_number + 1) if last_version else 1
                
                ReportVersion.objects.create(
                    report=updated_report,
                    version_number=new_version_number,
                    content=updated_report.content,
                    created_by=request.user,
                    notes=request.data.get('version_notes', f'Actualización versión {new_version_number}')
                )
            
            response_serializer = ReportSerializer(updated_report)
            return Response({
                'report': response_serializer.data,
                'message': 'Reporte actualizado exitosamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error updating report {report_id}: {e}")
        return Response(
            {'error': 'Error al actualizar el reporte'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report_by_id(request, report_id):
    """
    Obtener un reporte específico por ID
    """
    try:
        report = get_object_or_404(Report, id=report_id)
        
        # Verificar permisos
        if report.created_by != request.user and report.assigned_to != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para ver este reporte'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ReportSerializer(report)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Error getting report {report_id}: {e}")
        return Response(
            {'error': 'Error al obtener el reporte'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_report(request, report_id):
    """
    Eliminar un reporte
    """
    try:
        report = get_object_or_404(Report, id=report_id)
        
        # Verificar permisos
        if report.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para eliminar este reporte'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        report.delete()
        return Response({'message': 'Reporte eliminado exitosamente'})
    
    except Exception as e:
        logger.error(f"Error deleting report {report_id}: {e}")
        return Response(
            {'error': 'Error al eliminar el reporte'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
