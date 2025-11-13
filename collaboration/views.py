from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import CollaborationRequest, CollaborationSession, CollaborationUser, CollaborationChange
from .serializers import (
    CollaborationSessionSerializer,
    CollaborationUserSerializer,
    CollaborationChangeSerializer
)
from reports.models import Report
import json
import logging

logger = logging.getLogger(__name__)

@login_required
def collaboration_request_list(request):
    """
    Lists all collaboration requests.  Only admins and staff can view all requests.
    Other users can only see requests they created or are involved in.
    """
    if request.user.is_staff or request.user.is_superuser:
        collaboration_requests = CollaborationRequest.objects.all()
    else:
        collaboration_requests = CollaborationRequest.objects.filter(requester=request.user) | CollaborationRequest.objects.filter(collaborator=request.user)
    return render(request, 'collaboration/collaboration_request_list.html', {'collaboration_requests': collaboration_requests})

@login_required
def collaboration_request_detail(request, pk):
    """
    Displays the details of a specific collaboration request.
    Only admins, staff, the requester, or the collaborator can view the details.
    """
    collaboration_request = get_object_or_404(CollaborationRequest, pk=pk)
    if not (request.user.is_staff or request.user.is_superuser or collaboration_request.requester == request.user or collaboration_request.collaborator == request.user):
        return HttpResponseForbidden("You do not have permission to view this collaboration request.")
    return render(request, 'collaboration/collaboration_request_detail.html', {'collaboration_request': collaboration_request})

@login_required
def create_collaboration_request(request):
    """
    Allows a user to create a new collaboration request.
    """
    # Placeholder for create view logic.  Needs implementation.
    return render(request, 'collaboration/create_collaboration_request.html') # Replace with actual form and logic

@login_required
def update_collaboration_request(request, pk):
    """
    Allows a user to update an existing collaboration request.
    Only admins, staff, or the requester can update the request.
    """
    collaboration_request = get_object_or_404(CollaborationRequest, pk=pk)
    if not (request.user.is_staff or request.user.is_superuser or collaboration_request.requester == request.user):
        return HttpResponseForbidden("You do not have permission to update this collaboration request.")
    # Placeholder for update view logic. Needs implementation.
    return render(request, 'collaboration/update_collaboration_request.html', {'collaboration_request': collaboration_request}) # Replace with actual form and logic

@login_required
def delete_collaboration_request(request, pk):
    """
    Allows a user to delete an existing collaboration request.
    Only admins, staff, or the requester can delete the request.
    """
    collaboration_request = get_object_or_404(CollaborationRequest, pk=pk)
    if not (request.user.is_staff or request.user.is_superuser or collaboration_request.requester == request.user):
        return HttpResponseForbidden("You do not have permission to delete this collaboration request.")
    # Placeholder for delete view logic. Needs implementation.
    return render(request, 'collaboration/delete_collaboration_request.html', {'collaboration_request': collaboration_request}) # Replace with actual form and logic

class CollaborationSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar sesiones de colaboración
    """
    queryset = CollaborationSession.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    serializer_class = CollaborationSessionSerializer
    
    def get_queryset(self):
        """
        Filtrar sesiones según el usuario
        """
        queryset = CollaborationSession.objects.all().order_by('-created_at')
        
        # Filtrar por sesiones donde el usuario participa
        if not (self.request.user.is_superuser or self.request.user.role == 'admin'):
            queryset = queryset.filter(
                models.Q(created_by=self.request.user) |
                models.Q(users__user=self.request.user)
            ).distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Crear sesión asignando el usuario actual
        """
        serializer.save(created_by=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_collaboration_session(request):
    """
    Crear una nueva sesión de colaboración
    """
    try:
        report_id = request.data.get('report_id')
        report = get_object_or_404(Report, id=report_id)
        
        # Verificar permisos
        if report.created_by != request.user and report.assigned_to != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para colaborar en este reporte'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Crear sesión
        session = CollaborationSession.objects.create(
            report=report,
            created_by=request.user,
            is_active=True
        )
        
        # Agregar usuario creador a la sesión
        CollaborationUser.objects.create(
            session=session,
            user=request.user,
            role='owner'
        )
        
        serializer = CollaborationSessionSerializer(session)
        return Response({
            'session': serializer.data,
            'message': 'Sesión de colaboración creada exitosamente'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error creating collaboration session: {e}")
        return Response(
            {'error': 'Error al crear la sesión de colaboración'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_collaboration_session(request, session_id):
    """
    Unirse a una sesión de colaboración
    """
    try:
        session = get_object_or_404(CollaborationSession, id=session_id)
        
        # Verificar que la sesión esté activa
        if not session.is_active:
            return Response(
                {'error': 'La sesión de colaboración no está activa'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar permisos en el reporte
        report = session.report
        if report.created_by != request.user and report.assigned_to != request.user:
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response(
                    {'error': 'No tienes permisos para unirte a esta sesión'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Verificar si ya está en la sesión
        if session.users.filter(user=request.user).exists():
            return Response(
                {'error': 'Ya estás participando en esta sesión'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Agregar usuario a la sesión
        collaboration_user = CollaborationUser.objects.create(
            session=session,
            user=request.user,
            role='collaborator'
        )
        
        serializer = CollaborationUserSerializer(collaboration_user)
        return Response({
            'collaboration_user': serializer.data,
            'message': 'Te has unido a la sesión exitosamente'
        })
    
    except Exception as e:
        logger.error(f"Error joining collaboration session {session_id}: {e}")
        return Response(
            {'error': 'Error al unirse a la sesión'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_collaboration_session(request, session_id):
    """
    Salir de una sesión de colaboración
    """
    try:
        session = get_object_or_404(CollaborationSession, id=session_id)
        
        # Buscar participación del usuario
        collaboration_user = session.users.filter(user=request.user).first()
        if not collaboration_user:
            return Response(
                {'error': 'No estás participando en esta sesión'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # No permitir que el owner salga si hay otros usuarios
        if collaboration_user.role == 'owner' and session.users.count() > 1:
            return Response(
                {'error': 'No puedes salir siendo el propietario mientras hay otros colaboradores'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        collaboration_user.delete()
        
        # Si era el último usuario, desactivar la sesión
        if session.users.count() == 0:
            session.is_active = False
            session.save()
        
        return Response({'message': 'Has salido de la sesión exitosamente'})
    
    except Exception as e:
        logger.error(f"Error leaving collaboration session {session_id}: {e}")
        return Response(
            {'error': 'Error al salir de la sesión'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_collaboration_change(request, session_id):
    """
    Guardar un cambio en la sesión de colaboración
    """
    try:
        session = get_object_or_404(CollaborationSession, id=session_id)
        
        # Verificar que el usuario esté en la sesión
        if not session.users.filter(user=request.user).exists():
            return Response(
                {'error': 'No estás participando en esta sesión'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        change_data = request.data.get('change', {})
        change_type = request.data.get('type', 'edit')
        
        # Crear cambio
        change = CollaborationChange.objects.create(
            session=session,
            user=request.user,
            change_type=change_type,
            change_data=change_data
        )
        
        serializer = CollaborationChangeSerializer(change)
        return Response({
            'change': serializer.data,
            'message': 'Cambio guardado exitosamente'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error saving collaboration change: {e}")
        return Response(
            {'error': 'Error al guardar el cambio'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collaboration_changes(request, session_id):
    """
    Obtener cambios de una sesión de colaboración
    """
    try:
        session = get_object_or_404(CollaborationSession, id=session_id)
        
        # Verificar que el usuario esté en la sesión
        if not session.users.filter(user=request.user).exists():
            return Response(
                {'error': 'No estás participando en esta sesión'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        changes = session.changes.all().order_by('-created_at')
        
        # Filtrar por timestamp si se proporciona
        since = request.query_params.get('since')
        if since:
            changes = changes.filter(created_at__gt=since)
        
        serializer = CollaborationChangeSerializer(changes, many=True)
        return Response({
            'changes': serializer.data,
            'count': changes.count()
        })
    
    except Exception as e:
        logger.error(f"Error getting collaboration changes: {e}")
        return Response(
            {'error': 'Error al obtener los cambios'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
