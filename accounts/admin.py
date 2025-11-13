from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Campos que se muestran en la lista
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active', 'date_joined')
    list_filter = ('role', 'department', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    # Campos en el formulario de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Información Académica', {'fields': ('role', 'department')}),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Campos para crear usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'role', 'department'),
        }),
    )
    
    # Acciones personalizadas
    actions = ['activate_users', 'deactivate_users', 'make_staff']
    
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} usuarios activados.")
    activate_users.short_description = "Activar usuarios seleccionados"
    
    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} usuarios desactivados.")
    deactivate_users.short_description = "Desactivar usuarios seleccionados"
    
    def make_staff(self, request, queryset):
        queryset.update(role='staff')
        self.message_user(request, f"{queryset.count()} usuarios cambiados a Personal.")
    make_staff.short_description = "Cambiar rol a Personal"
    
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'website')
    search_fields = ('user__username', 'user__email', 'location')
    list_filter = ('location',)
