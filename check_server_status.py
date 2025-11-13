#!/usr/bin/env python3
"""
Script para verificar el estado del servidor Django
"""
import requests
import subprocess
import sys
import os

def check_django_server():
    print("🔍 Verificando servidor Django...")
    
    # Verificar si manage.py existe
    if not os.path.exists("manage.py"):
        print("❌ manage.py no encontrado. ¿Estás en el directorio correcto?")
        return False
    
    # Verificar si el servidor responde
    try:
        response = requests.get("http://localhost:8000/admin/", timeout=5)
        if response.status_code in [200, 302]:
            print("✅ Servidor Django funcionando en http://localhost:8000")
            return True
        else:
            print(f"⚠️ Servidor responde pero con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor en http://localhost:8000")
        print("💡 El servidor Django no está ejecutándose")
        return False
    except Exception as e:
        print(f"❌ Error verificando servidor: {e}")
        return False

def check_dependencies():
    print("\n🔍 Verificando dependencias...")
    
    dependencies = ["django", "djangorestframework", "django_cors_headers", "rest_framework_simplejwt"]
    missing = []
    
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} - NO INSTALADO")
            missing.append(dep)
    
    return len(missing) == 0

def main():
    print("🎯 VERIFICADOR DE ESTADO DEL SERVIDOR DJANGO")
    print("="*50)
    
    # Verificar dependencias
    deps_ok = check_dependencies()
    
    # Verificar servidor
    server_ok = check_django_server()
    
    print("\n" + "="*50)
    print("📋 RESUMEN:")
    print(f"   • Dependencias: {'✅' if deps_ok else '❌'}")
    print(f"   • Servidor Django: {'✅' if server_ok else '❌'}")
    
    if not deps_ok:
        print("\n💡 Para instalar dependencias:")
        print("   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt")
    
    if not server_ok:
        print("\n💡 Para iniciar el servidor:")
        print("   python setup_django_server.py")
        print("   O manualmente:")
        print("   python manage.py runserver")
    
    if deps_ok and server_ok:
        print("\n🎉 ¡Todo está funcionando correctamente!")
        print("🌐 Puedes usar tu aplicación frontend ahora")

if __name__ == "__main__":
    main()
