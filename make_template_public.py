#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

from templates.models import Template
from accounts.models import User

def make_admin_templates_public():
    print("🔄 Haciendo públicas las plantillas del administrador...")
    
    # Obtener usuarios admin
    admin_users = User.objects.filter(role='admin')
    
    if not admin_users.exists():
        print("❌ No se encontraron usuarios administradores")
        return
    
    # Hacer públicas todas las plantillas de administradores
    updated_count = 0
    for admin in admin_users:
        templates = Template.objects.filter(created_by=admin, is_public=False)
        for template in templates:
            template.is_public = True
            template.is_active = True  # También asegurar que esté activa
            template.save()
            print(f"✅ Plantilla '{template.name}' ahora es pública")
            updated_count += 1
    
    print(f"\n🎉 Se actualizaron {updated_count} plantillas")
    
    # Verificar el resultado
    public_admin_templates = Template.objects.filter(
        created_by__role='admin', 
        is_public=True
    )
    print(f"📋 Plantillas públicas del admin: {public_admin_templates.count()}")

if __name__ == "__main__":
    make_admin_templates_public()
