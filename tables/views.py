from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Table, TableData
from .serializers import TableSerializer, TableCreateSerializer, TableDataSerializer
import json
import logging

logger = logging.getLogger(__name__)

class TableViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tablas
    """
    queryset = Table.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TableCreateSerializer
        return TableSerializer
    
    def get_queryset(self):
        """
        Filtrar tablas según el usuario
        """
        queryset = Table.objects.all().order_by('-created_at')
        
        # Filtrar por usuario si no es admin
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear tabla asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)
        
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicar una tabla existente
        """
        try:
            original_table = self.get_object()
            
            # Crear nueva tabla con los mismos datos
            new_table = Table.objects.create(
                name=f"Copia de {original_table.name}",
                description=original_table.description,
                columns=original_table.columns,
                created_by=request.user
            )
            
            # Duplicar filas
            original_rows = TableData.objects.filter(table=original_table)
            for row in original_rows:
                TableData.objects.create(
                    table=new_table,
                    row_data=row.row_data
                )
            
            serializer = self.get_serializer(new_table)
            return Response({
                'table': serializer.data,
                'message': 'Tabla duplicada exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error duplicating table {pk}: {e}")
            return Response(
                {'error': 'Error al duplicar la tabla'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TableDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar datos de tablas
    """
    queryset = TableData.objects.all()
    serializer_class = TableDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar datos según la tabla y permisos
        """
        table_id = self.kwargs.get('table_pk')
        if not table_id:
            return TableData.objects.none()
            
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != self.request.user:
            if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
                return TableData.objects.none()
        
        return TableData.objects.filter(table=table).order_by('created_at')
    
    def perform_create(self, serializer):
        """
        Crear dato asignando la tabla
        """
        table_id = self.kwargs.get('table_pk')
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != self.request.user:
            if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
                raise PermissionError("No tienes permisos para modificar esta tabla")
        
        serializer.save(table=table)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_table(request):
    """
    Crear una nueva tabla
    """
    try:
        serializer = TableCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            table = serializer.save(created_by=request.user)
            
            # Crear datos iniciales si se proporcionan
            initial_rows = request.data.get('rows', [])
            for row_data in initial_rows:
                TableData.objects.create(
                    table=table,
                    row_data=row_data
                )
            
            response_serializer = TableSerializer(table)
            return Response({
                'table': response_serializer.data,
                'message': 'Tabla creada exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error creating table: {e}")
        return Response(
            {'error': 'Error al crear la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_table(request, table_id):
    """
    Actualizar una tabla existente
    """
    try:
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para editar esta tabla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = TableSerializer(table, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_table = serializer.save()
            
            # Actualizar filas si se proporcionan
            new_rows = request.data.get('rows')
            if new_rows is not None:
                # Eliminar filas existentes y crear nuevas
                table.data.all().delete()
                for row_data in new_rows:
                    TableData.objects.create(
                        table=updated_table,
                        row_data=row_data
                    )
            
            response_serializer = TableSerializer(updated_table)
            return Response({
                'table': response_serializer.data,
                'message': 'Tabla actualizada exitosamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error updating table {table_id}: {e}")
        return Response(
            {'error': 'Error al actualizar la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_table_by_id(request, table_id):
    """
    Obtener una tabla específica por ID
    """
    try:
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para ver esta tabla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = TableSerializer(table)
        
        # Incluir datos de las filas
        table_data = table.data.all().order_by('created_at')
        rows = [data.row_data for data in table_data]
        
        response_data = serializer.data
        response_data['rows'] = rows
        
        return Response(response_data)
    
    except Exception as e:
        logger.error(f"Error getting table {table_id}: {e}")
        return Response(
            {'error': 'Error al obtener la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_table(request, table_id):
    """
    Eliminar una tabla
    """
    try:
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para eliminar esta tabla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        table.delete()
        return Response({'message': 'Tabla eliminada exitosamente'})
    
    except Exception as e:
        logger.error(f"Error deleting table {table_id}: {e}")
        return Response(
            {'error': 'Error al eliminar la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_table_row(request, table_id):
    """
    Agregar una fila a una tabla
    """
    try:
        table = get_object_or_404(Table, id=table_id)
        
        # Verificar permisos
        if table.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para modificar esta tabla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        row_data = request.data.get('row_data', {})
        
        table_data = TableData.objects.create(
            table=table,
            row_data=row_data
        )
        
        serializer = TableDataSerializer(table_data)
        return Response({
            'table_data': serializer.data,
            'message': 'Fila agregada exitosamente'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error adding row to table {table_id}: {e}")
        return Response(
            {'error': 'Error al agregar fila a la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_table_row(request, table_id, row_id):
    """
    Eliminar una fila de una tabla
    """
    try:
        table = get_object_or_404(Table, id=table_id)
        table_data = get_object_or_404(TableData, id=row_id, table=table)
        
        # Verificar permisos
        if table.created_by != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para modificar esta tabla'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        table_data.delete()
        return Response({'message': 'Fila eliminada exitosamente'})
    
    except Exception as e:
        logger.error(f"Error deleting row {row_id} from table {table_id}: {e}")
        return Response(
            {'error': 'Error al eliminar fila de la tabla'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
