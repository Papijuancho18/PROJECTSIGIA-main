#!/usr/bin/env python
"""
Script para verificar que todas las URLs de templates estén funcionando correctamente
"""
import os
import sys
import django
import requests
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

def test_urls():
    """Probar las URLs principales de templates"""
    base_url = "http://localhost:8000/api"
    
    # URLs a probar
    urls_to_test = [
        "/templates/",
        "/templates/1/",
        "/templates/1/save-enhanced/",
        "/templates/1/create-personal-copy/",
        "/templates/1/duplicate/",
        "/templates/1/debug/",
        "/templates/1/test/",
        "/templates/available-for-reports/",
    ]
    
    print("🔗 Probando URLs de templates...")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    for url_path in urls_to_test:
        full_url = f"{base_url}{url_path}"
        try:
            # Probar con GET primero (sin autenticación)
            response = requests.get(full_url, timeout=5)
            
            if response.status_code == 401:
                status = "✅ OK (Requiere autenticación)"
            elif response.status_code == 404:
                status = "❌ No encontrada"
            elif response.status_code == 405:
                status = "✅ OK (Método no permitido - normal para POST endpoints)"
            elif response.status_code < 500:
                status = f"✅ OK (Status: {response.status_code})"
            else:
                status = f"❌ Error del servidor (Status: {response.status_code})"
                
        except requests.exceptions.ConnectionError:
            status = "❌ No se puede conectar (¿Servidor Django corriendo?)"
        except requests.exceptions.Timeout:
            status = "❌ Timeout"
        except Exception as e:
            status = f"❌ Error: {e}"
        
        print(f"{url_path:<35} {status}")
    
    print("-" * 50)
    print("✅ Verificación completada")
    print("\nNotas:")
    print("- URLs que requieren autenticación son normales")
    print("- Endpoints POST que devuelven 405 en GET son normales")
    print("- Si ves 'No se puede conectar', ejecuta: python manage.py runserver")

if __name__ == "__main__":
    test_urls()
