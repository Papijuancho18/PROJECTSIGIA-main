from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Chart, ChartData
from .serializers import ChartSerializer, ChartCreateSerializer, ChartDataSerializer
import json
import logging

logger = logging.getLogger(__name__)

class ChartViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar gráficos
    """
    queryset = Chart.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChartCreateSerializer
        return ChartSerializer
    
    def get_queryset(self):
        """
        Filtrar gráficos según el usuario
        """
        queryset = Chart.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(created_by=self.request.user)
        
        # Filtros adicionales
        chart_type = self.request.query_params.get('type', None)
        if chart_type:
            queryset = queryset.filter(chart_type=chart_type)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear gráfico asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicar un gráfico existente
        """
        try:
            chart = self.get_object()
            
            # Crear copia del gráfico
            new_chart = Chart.objects.create(
                name=f"{chart.name} (Copia)",
                chart_type=chart.chart_type,
                description=chart.description,
                config=chart.config,
                created_by=request.user
            )
            
            # Copiar datos más recientes
            latest_data = chart.data.first()
            if latest_data:
                ChartData.objects.create(
                    chart=new_chart,
                    data=latest_data.data
                )
            
            serializer = ChartSerializer(new_chart)
            return Response({
                'chart': serializer.data,
                'message': 'Gráfico duplicado exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error duplicating chart {pk}: {e}")
            return Response(
                {'error': 'Error al duplicar el gráfico'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChartDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar datos de gráficos
    """
    queryset = ChartData.objects.all().order_by('-created_at')
    serializer_class = ChartDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar datos según el usuario y gráfico
        """
        queryset = ChartData.objects.all().order_by('-created_at')
        
        # Filtrar por gráfico si se especifica
        chart_id = self.request.query_params.get('chart', None)
        if chart_id:
            queryset = queryset.filter(chart_id=chart_id)
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(chart__created_by=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear datos verificando permisos del gráfico
        """
        chart = serializer.validated_data['chart']
        
        # Verificar permisos
        if chart.created_by != self.request.user:
            if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
                raise PermissionError('No tienes permisos para modificar este gráfico')
        
        serializer.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chart(request):
    """
    Crear un nuevo gráfico
    """
    try:
        serializer = ChartCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            chart = serializer.save(created_by=request.user)
            
            # Crear datos iniciales si se proporcionan
            initial_data = request.data.get('data')
            if initial_data:
                ChartData.objects.create(
                    chart=chart,
                    data=initial_data
                )
            
            response_serializer = ChartSerializer(chart)
            return Response({
                'chart': response_serializer.data,
                'message': 'Gráfico creado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error creating chart: {e}")
        return Response(
            {'error': 'Error al crear el gráfico'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_chart(request, chart_id):
    """
    Actualizar un gráfico existente
    """
    try:
        chart = get_object_or_404(Chart, id=chart_id)
        
        # Verificar permisos
        if chart.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para editar este gráfico'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ChartSerializer(chart, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_chart = serializer.save()
            
            # Actualizar datos si se proporcionan
            new_data = request.data.get('data')
            if new_data:
                ChartData.objects.create(
                    chart=updated_chart,
                    data=new_data
                )
            
            response_serializer = ChartSerializer(updated_chart)
            return Response({
                'chart': response_serializer.data,
                'message': 'Gráfico actualizado exitosamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error updating chart {chart_id}: {e}")
        return Response(
            {'error': 'Error al actualizar el gráfico'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chart_by_id(request, chart_id):
    """
    Obtener un gráfico específico por ID
    """
    try:
        chart = get_object_or_404(Chart, id=chart_id)
        
        # Verificar permisos
        if chart.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para ver este gráfico'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ChartSerializer(chart)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Error getting chart {chart_id}: {e}")
        return Response(
            {'error': 'Error al obtener el gráfico'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chart(request, chart_id):
    """
    Eliminar un gráfico
    """
    try:
        chart = get_object_or_404(Chart, id=chart_id)
        
        # Verificar permisos
        if chart.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para eliminar este gráfico'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        chart.delete()
        return Response({'message': 'Gráfico eliminado exitosamente'})
    
    except Exception as e:
        logger.error(f"Error deleting chart {chart_id}: {e}")
        return Response(
            {'error': 'Error al eliminar el gráfico'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_chart_data(request, chart_id):
    """
    Agregar datos a un gráfico
    """
    try:
        chart = get_object_or_404(Chart, id=chart_id)
        
        # Verificar permisos
        if chart.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para modificar este gráfico'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        data = request.data.get('data', {})
        
        chart_data = ChartData.objects.create(
            chart=chart,
            data=data
        )
        
        serializer = ChartDataSerializer(chart_data)
        return Response({
            'chart_data': serializer.data,
            'message': 'Datos agregados exitosamente'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error adding data to chart {chart_id}: {e}")
        return Response(
            {'error': 'Error al agregar datos al gráfico'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chart_types(request):
    """
    Obtener tipos de gráficos disponibles
    """
    try:
        return Response({
            'chart_types': Chart.CHART_TYPES,
            'message': 'Tipos de gráficos obtenidos exitosamente'
        })
    except Exception as e:
        logger.error(f"Error getting chart types: {e}")
        return Response(
            {'error': 'Error al obtener tipos de gráficos'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
