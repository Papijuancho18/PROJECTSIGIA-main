#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

from templates.models import Template
from accounts.models import User

def check_templates():
    print("🔍 Verificando plantillas en la base de datos...")
    
    # Obtener todos los usuarios admin
    admin_users = User.objects.filter(role='admin')
    print(f"👑 Usuarios admin encontrados: {admin_users.count()}")
    for admin in admin_users:
        print(f"  - {admin.username} ({admin.email})")
    
    # Obtener todas las plantillas
    all_templates = Template.objects.all()
    print(f"\n📋 Total de plantillas: {all_templates.count()}")
    
    for template in all_templates:
        print(f"\n📄 Plantilla: {template.name}")
        print(f"   ID: {template.id}")
        print(f"   Creado por: {template.created_by.username} (rol: {template.created_by.role})")
        print(f"   Es pública: {template.is_public}")
        print(f"   Está activa: {template.is_active}")
        print(f"   Categoría: {template.category}")
        print(f"   Fecha creación: {template.created_at}")
        
        # Verificar si tiene contenido
        if template.content:
            content_length = len(str(template.content))
            print(f"   Contenido: {content_length} caracteres")
        else:
            print(f"   Contenido: Vacío")
    
    # Verificar plantillas que debería ver el staff
    print(f"\n🔍 Plantillas que debería ver el personal administrativo:")
    staff_templates = Template.objects.filter(
        models.Q(created_by__role='admin', is_public=True) |
        models.Q(is_public=True)
    )
    print(f"   Total: {staff_templates.count()}")
    for template in staff_templates:
        print(f"   - {template.name} (por {template.created_by.username})")

if __name__ == "__main__":
    from django.db import models
    check_templates()
