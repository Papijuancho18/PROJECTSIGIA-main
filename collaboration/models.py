from django.db import models
from django.contrib.auth import get_user_model
from reports.models import Report

User = get_user_model()

class CollaborationRequest(models.Model):
    """
    Modelo para solicitudes de colaboración
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
        ('cancelled', 'Cancelada'),
    ]
    
    requester = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaboration_requests_sent'
    )
    collaborator = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaboration_requests_received'
    )
    report = models.ForeignKey(
        Report, 
        on_delete=models.CASCADE, 
        related_name='collaboration_requests'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['requester', 'collaborator', 'report']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Collaboration request from {self.requester.username} to {self.collaborator.username}"

class CollaborationSession(models.Model):
    """
    Modelo para sesiones de colaboración en tiempo real
    """
    name = models.CharField(max_length=255)
    report = models.ForeignKey(
        Report, 
        on_delete=models.CASCADE, 
        related_name='collaboration_sessions'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_collaboration_sessions'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Collaboration session: {self.name}"
    
    class Meta:
        ordering = ['-created_at']

class CollaborationUser(models.Model):
    """
    Modelo para usuarios participantes en una sesión de colaboración
    """
    ROLE_CHOICES = [
        ('owner', 'Propietario'),
        ('collaborator', 'Colaborador'),
        ('viewer', 'Observador'),
    ]
    
    session = models.ForeignKey(
        CollaborationSession, 
        on_delete=models.CASCADE, 
        related_name='users'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaboration_participations'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='collaborator')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['session', 'user']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.session.name} as {self.role}"

class CollaborationChange(models.Model):
    """
    Modelo para tracking de cambios en colaboración
    """
    CHANGE_TYPES = [
        ('text_edit', 'Edición de Texto'),
        ('table_edit', 'Edición de Tabla'),
        ('chart_edit', 'Edición de Gráfico'),
        ('section_add', 'Agregar Sección'),
        ('section_delete', 'Eliminar Sección'),
        ('section_move', 'Mover Sección'),
        ('format_change', 'Cambio de Formato'),
        ('comment_add', 'Agregar Comentario'),
    ]
    
    session = models.ForeignKey(
        CollaborationSession, 
        on_delete=models.CASCADE, 
        related_name='changes'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaboration_changes'
    )
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    change_data = models.JSONField()
    element_id = models.CharField(max_length=255, null=True, blank=True)
    position = models.JSONField(null=True, blank=True)  # Para tracking de cursor/posición
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.change_type} by {self.user.username} at {self.created_at}"

class CollaborationComment(models.Model):
    """
    Modelo para comentarios en colaboración
    """
    session = models.ForeignKey(
        CollaborationSession, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaboration_comments'
    )
    content = models.TextField()
    element_id = models.CharField(max_length=255, null=True, blank=True)
    position = models.JSONField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} in {self.session.name}"
