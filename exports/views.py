from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from django.conf import settings
from .models import ExportJob, ExportConfig
from .serializers import ExportJobSerializer, ExportConfigSerializer
from .utils import PDFExporter, WordExporter, ExcelExporter, HTMLExporter, JSONExporter
from reports.models import Report
import os
import logging

logger = logging.getLogger(__name__)

class ExportJobViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar trabajos de exportación
    """
    queryset = ExportJob.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    serializer_class = ExportJobSerializer
    
    def get_queryset(self):
        """
        Filtrar trabajos de exportación según el usuario
        """
        queryset = ExportJob.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear trabajo de exportación asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)

class ExportConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar configuraciones de exportación
    """
    queryset = ExportConfig.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    serializer_class = ExportConfigSerializer
    
    def get_queryset(self):
        """
        Filtrar configuraciones según el usuario
        """
        queryset = ExportConfig.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear configuración asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_report(request, report_id):
    """
    Exportar un reporte en el formato especificado
    """
    try:
        report = get_object_or_404(Report, id=report_id)
        
        # Verificar permisos
        if report.created_by != request.user and report.assigned_to != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para exportar este reporte'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        export_format = request.data.get('format', 'pdf').lower()
        config = request.data.get('config', {})
        
        # Crear trabajo de exportación
        export_job = ExportJob.objects.create(
            name=f"Exportación de {report.title}",
            format=export_format,
            created_by=request.user
        )
        
        try:
            # Seleccionar exportador según el formato
            if export_format == 'pdf':
                exporter = PDFExporter(report, config)
            elif export_format == 'docx':
                exporter = WordExporter(report, config)
            elif export_format == 'xlsx':
                exporter = ExcelExporter(report, config)
            elif export_format == 'html':
                exporter = HTMLExporter(report, config)
            elif export_format == 'json':
                exporter = JSONExporter(report, config)
            else:
                export_job.status = 'failed'
                export_job.save()
                return Response(
                    {'error': 'Formato de exportación no soportado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Realizar exportación
            export_job.status = 'processing'
            export_job.save()
            
            file_path = exporter.export()
            
            export_job.status = 'completed'
            export_job.file_path = file_path
            export_job.save()
            
            return Response({
                'export_job': ExportJobSerializer(export_job).data,
                'download_url': f'/api/exports/download/{export_job.id}/',
                'message': 'Exportación completada exitosamente'
            })
        
        except Exception as e:
            export_job.status = 'failed'
            export_job.save()
            logger.error(f"Error during export: {e}")
            return Response(
                {'error': 'Error durante la exportación'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        logger.error(f"Error exporting report {report_id}: {e}")
        return Response(
            {'error': 'Error al exportar el reporte'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_export(request, job_id):
    """
    Descargar archivo exportado
    """
    try:
        export_job = get_object_or_404(ExportJob, id=job_id)
        
        # Verificar permisos
        if export_job.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para descargar este archivo'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if export_job.status != 'completed' or not export_job.file_path:
            return Response(
                {'error': 'El archivo no está disponible para descarga'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_path = export_job.file_path
        if not os.path.exists(file_path):
            return Response(
                {'error': 'El archivo no existe'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Determinar tipo de contenido
        content_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'html': 'text/html',
            'json': 'application/json'
        }
        
        content_type = content_types.get(export_job.format, 'application/octet-stream')
        
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
    
    except Exception as e:
        logger.error(f"Error downloading export {job_id}: {e}")
        return Response(
            {'error': 'Error al descargar el archivo'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_export_formats(request):
    """
    Obtener formatos de exportación disponibles
    """
    try:
        return Response({
            'formats': ExportJob.FORMAT_CHOICES,
            'message': 'Formatos de exportación obtenidos exitosamente'
        })
    except Exception as e:
        logger.error(f"Error getting export formats: {e}")
        return Response(
            {'error': 'Error al obtener formatos de exportación'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_export_config(request):
    """
    Crear una nueva configuración de exportación
    """
    try:
        serializer = ExportConfigSerializer(data=request.data)
        
        if serializer.is_valid():
            config = serializer.save(created_by=request.user)
            
            return Response({
                'config': ExportConfigSerializer(config).data,
                'message': 'Configuración creada exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error creating export config: {e}")
        return Response(
            {'error': 'Error al crear la configuración'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
