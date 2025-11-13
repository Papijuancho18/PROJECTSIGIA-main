#!/usr/bin/env python
"""
Script para crear y aplicar todas las migraciones necesarias
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

def run_migrations():
    """Crear y aplicar todas las migraciones"""
    
    print("🔄 Creando migraciones para todas las aplicaciones...")
    
    # Lista de aplicaciones que necesitan migraciones
    apps = [
        'accounts',
        'templates', 
        'reports',
        'charts',
        'tables',
        'collaboration',
        'exports'
    ]
    
    # Crear migraciones para cada aplicación
    for app in apps:
        print(f"📝 Creando migraciones para {app}...")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
            print(f"✅ Migraciones creadas para {app}")
        except Exception as e:
            print(f"⚠️ Error creando migraciones para {app}: {e}")
    
    # Crear migraciones generales
    print("📝 Creando migraciones generales...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        print("✅ Migraciones generales creadas")
    except Exception as e:
        print(f"⚠️ Error creando migraciones generales: {e}")
    
    # Aplicar todas las migraciones
    print("🔄 Aplicando todas las migraciones...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Todas las migraciones aplicadas correctamente")
    except Exception as e:
        print(f"❌ Error aplicando migraciones: {e}")
        return False
    
    return True

def verify_tables():
    """Verificar que las tablas se crearon correctamente"""
    from django.db import connection
    
    print("🔍 Verificando tablas creadas...")
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%_report%' 
            OR table_name LIKE '%_template%'
            OR table_name LIKE '%_chart%'
            OR table_name LIKE '%_table%'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        if tables:
            print("📋 Tablas encontradas:")
            for table in tables:
                print(f"  - {table[0]}")
        else:
            print("⚠️ No se encontraron tablas relacionadas")
    
    return len(tables) > 0

if __name__ == '__main__':
    print("🚀 Iniciando proceso de migraciones...")
    
    if run_migrations():
        if verify_tables():
            print("🎉 ¡Proceso completado exitosamente!")
            print("✅ Todas las tablas han sido creadas")
            print("🔄 Ahora puedes intentar eliminar plantillas nuevamente")
        else:
            print("⚠️ Las migraciones se aplicaron pero no se encontraron todas las tablas")
    else:
        print("❌ Error en el proceso de migraciones")
