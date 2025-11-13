from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth.models import Group
from django.utils import timezone
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, LoginSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint de salud para verificar que la API está funcionando
    """
    return Response({
        'status': 'healthy',
        'message': 'API is working correctly',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint para iniciar sesión y obtener tokens JWT
    """
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            password = serializer.validated_data.get('password')
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                user_serializer = UserSerializer(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_serializer.data
                })
            else:
                return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_view(request):
    """
    Endpoint para registrar nuevos usuarios
    """
    try:
        # Verificar si el usuario es admin o staff
        if not (request.user.is_superuser or request.user.role == 'admin'):
            return Response({
                'error': 'No tienes permisos para crear usuarios. Solo administradores pueden crear usuarios.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Asignar grupos según el rol
            if user.role == 'admin':
                admin_group, _ = Group.objects.get_or_create(name='Administrators')
                user.groups.add(admin_group)
            elif user.role == 'staff':
                staff_group, _ = Group.objects.get_or_create(name='Staff')
                user.groups.add(staff_group)
            
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Endpoint para cerrar sesión (invalidar token)
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
        return Response({'error': 'No se proporcionó token de refresco'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Endpoint para obtener el perfil del usuario actual
    """
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_profile(request):
    """
    Endpoint específico para obtener el perfil del usuario actual autenticado
    """
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_current_user_profile(request):
    """
    Endpoint para actualizar el perfil del usuario actual
    """
    try:
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = UserSerializer(user)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar usuarios
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Solo usuarios autenticados, verificaremos permisos en el método
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        """
        Lista todos los usuarios con paginación
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'count': queryset.count(),
                'next': None,
                'previous': None,
                'results': serializer.data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo usuario
        """
        try:
            # Verificar permisos
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response({
                    'error': 'No tienes permisos para crear usuarios. Solo administradores pueden crear usuarios.',
                    'user_role': request.user.role,
                    'is_superuser': request.user.is_superuser
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # Asignar grupos según el rol
                if user.role == 'admin':
                    admin_group, _ = Group.objects.get_or_create(name='Administrators')
                    user.groups.add(admin_group)
                elif user.role == 'staff':
                    staff_group, _ = Group.objects.get_or_create(name='Staff')
                    user.groups.add(staff_group)
                
                response_serializer = UserSerializer(user)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar un usuario
        """
        try:
            # Verificar permisos
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response({
                    'error': 'No tienes permisos para actualizar usuarios. Solo administradores pueden actualizar usuarios.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar un usuario
        """
        try:
            # Verificar permisos
            if not (request.user.is_superuser or request.user.role == 'admin'):
                return Response({
                    'error': 'No tienes permisos para eliminar usuarios. Solo administradores pueden eliminar usuarios.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_delete_users(request):
    """
    Endpoint para eliminar múltiples usuarios a la vez
    """
    try:
        # Verificar permisos
        if not (request.user.is_superuser or request.user.role == 'admin'):
            return Response({
                'error': 'No tienes permisos para eliminar usuarios. Solo administradores pueden eliminar usuarios.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No se proporcionaron IDs'}, status=status.HTTP_400_BAD_REQUEST)
        
        User.objects.filter(id__in=ids).delete()
        return Response({'detail': f'Se eliminaron {len(ids)} usuarios'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_users(request):
    """
    Endpoint para actualizar múltiples usuarios a la vez
    """
    try:
        # Verificar permisos
        if not (request.user.is_superuser or request.user.role == 'admin'):
            return Response({
                'error': 'No tienes permisos para actualizar usuarios. Solo administradores pueden actualizar usuarios.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        data = request.data.get('data', {})
        
        if not ids or not data:
            return Response({'error': 'No se proporcionaron IDs o datos'}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(id__in=ids)
        users.update(**data)
        
        return Response({'detail': f'Se actualizaron {users.count()} usuarios'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    Endpoint para buscar usuarios
    """
    try:
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'No se proporcionó término de búsqueda'}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(
            models.Q(username__icontains=query) | 
            models.Q(email__icontains=query) |
            models.Q(first_name__icontains=query) |
            models.Q(last_name__icontains=query)
        )
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
