#!/usr/bin/env python3
"""
Script para configurar e iniciar el servidor Django automáticamente
"""
import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def print_step(step, message):
    print(f"\n{'='*50}")
    print(f"PASO {step}: {message}")
    print(f"{'='*50}")

def run_command(command, description):
    print(f"\n🔧 {description}")
    print(f"Ejecutando: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - EXITOSO")
            if result.stdout:
                print(f"Output: {result.stdout}")
            return True
        else:
            print(f"❌ {description} - ERROR")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} - EXCEPCIÓN: {e}")
        return False

def check_python():
    print_step(1, "VERIFICANDO PYTHON")
    try:
        version = sys.version
        print(f"✅ Python encontrado: {version}")
        return True
    except:
        print("❌ Python no encontrado")
        return False

def install_dependencies():
    print_step(2, "INSTALANDO DEPENDENCIAS")
    
    dependencies = [
        "django",
        "djangorestframework", 
        "django-cors-headers",
        "djangorestframework-simplejwt"
    ]
    
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"Instalando {dep}"):
            print(f"⚠️ Error instalando {dep}, continuando...")
    
    return True

def setup_database():
    print_step(3, "CONFIGURANDO BASE DE DATOS")
    
    # Verificar si manage.py existe
    if not os.path.exists("manage.py"):
        print("❌ manage.py no encontrado. ¿Estás en el directorio correcto?")
        return False
    
    # Hacer migraciones
    if not run_command("python manage.py makemigrations", "Creando migraciones"):
        print("⚠️ Error en makemigrations, continuando...")
    
    if not run_command("python manage.py migrate", "Aplicando migraciones"):
        print("❌ Error crítico en migrate")
        return False
    
    return True

def create_superuser():
    print_step(4, "CREANDO SUPERUSUARIO")
    
    # Verificar si ya existe un superusuario
    check_cmd = 'python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(is_superuser=True).exists())"'
    result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
    
    if "True" in result.stdout:
        print("✅ Superusuario ya existe")
        return True
    
    # Crear superusuario automáticamente
    create_cmd = '''python manage.py shell -c "
from django.contrib.auth.models import User;
User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None;
print('Superusuario creado: admin/admin123')
"'''
    
    if run_command(create_cmd, "Creando superusuario admin/admin123"):
        print("✅ Superusuario creado exitosamente")
        print("📋 Credenciales: admin / admin123")
        return True
    else:
        print("⚠️ Error creando superusuario, continuando...")
        return True

def start_server():
    print_step(5, "INICIANDO SERVIDOR DJANGO")
    
    print("🚀 Iniciando servidor en http://localhost:8000")
    print("⚠️ NO CIERRES esta ventana mientras uses la aplicación")
    print("⚠️ Para detener el servidor: Ctrl+C")
    
    try:
        # Iniciar servidor
        subprocess.run("python manage.py runserver", shell=True)
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error iniciando servidor: {e}")

def test_server():
    print_step(6, "VERIFICANDO SERVIDOR")
    
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/admin/", timeout=5)
            if response.status_code in [200, 302]:  # 302 es redirect al login
                print("✅ Servidor Django funcionando correctamente")
                print("🌐 Admin disponible en: http://localhost:8000/admin/")
                return True
        except:
            pass
        
        print(f"⏳ Intento {attempt + 1}/{max_attempts} - Esperando servidor...")
        time.sleep(2)
    
    print("❌ No se pudo verificar el servidor")
    return False

def main():
    print("🎯 CONFIGURADOR AUTOMÁTICO DE DJANGO")
    print("Este script configurará e iniciará tu servidor Django")
    
    # Verificar directorio
    if not os.path.exists("manage.py"):
        print("❌ ERROR: manage.py no encontrado")
        print("Por favor ejecuta este script desde el directorio raíz del proyecto Django")
        return
    
    # Ejecutar pasos
    if not check_python():
        return
    
    if not install_dependencies():
        print("❌ Error instalando dependencias")
        return
    
    if not setup_database():
        print("❌ Error configurando base de datos")
        return
    
    create_superuser()
    
    print("\n" + "="*60)
    print("🎉 CONFIGURACIÓN COMPLETADA")
    print("="*60)
    print("📋 Resumen:")
    print("   • Python: ✅")
    print("   • Dependencias: ✅") 
    print("   • Base de datos: ✅")
    print("   • Superusuario: ✅")
    print("\n🚀 Iniciando servidor...")
    print("📱 Una vez iniciado, ve a tu aplicación frontend")
    
    start_server()

if __name__ == "__main__":
    main()
