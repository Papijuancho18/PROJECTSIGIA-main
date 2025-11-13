#!/usr/bin/env python3
"""
Script para probar el endpoint de guardado de plantillas
"""

import requests
import json
import os
import sys

# Configuración
API_BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # Cambiar por tu usuario
PASSWORD = "admin123"  # Cambiar por tu contraseña

def test_save_endpoint():
    """Probar el endpoint de guardado de plantillas"""
    
    print("🔍 Iniciando prueba del endpoint de guardado...")
    
    # 1. Login
    print("🔐 Haciendo login...")
    login_response = requests.post(f"{API_BASE_URL}/auth/login/", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.status_code}")
        print(login_response.text)
        return False
    
    login_data = login_response.json()
    token = login_data["access"]
    print(f"✅ Login exitoso. Token: {token[:20]}...")
    
    # Headers con autenticación
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Obtener plantillas
    print("📋 Obteniendo plantillas...")
    templates_response = requests.get(f"{API_BASE_URL}/templates/templates/?enhanced=true", headers=headers)
    
    if templates_response.status_code != 200:
        print(f"❌ Error obteniendo plantillas: {templates_response.status_code}")
        print(templates_response.text)
        return False
    
    templates_data = templates_response.json()
    print(f"✅ Plantillas obtenidas: {templates_data['count']} encontradas")
    
    if templates_data['count'] == 0:
        print("⚠️ No hay plantillas para probar")
        return False
    
    # 3. Probar guardado
    template = templates_data['results'][0]
    template_id = template['id']
    print(f"🔄 Probando guardado en plantilla ID: {template_id}")
    
    # Modificar la plantilla
    test_template = {
        **template,
        "description": f"Test de guardado - {json.dumps({'timestamp': '2024-01-01T00:00:00Z'})}",
        "sections": template.get('sections', [])
    }
    
    # Hacer la petición de guardado
    save_response = requests.post(
        f"{API_BASE_URL}/templates/templates/{template_id}/save-enhanced/",
        headers=headers,
        json=test_template
    )
    
    print(f"📡 Respuesta del servidor: {save_response.status_code}")
    print(f"📄 Headers de respuesta: {dict(save_response.headers)}")
    
    if save_response.status_code == 200:
        print("✅ Guardado exitoso!")
        response_data = save_response.json()
        print(f"📦 Datos de respuesta: {json.dumps(response_data, indent=2)[:500]}...")
        return True
    else:
        print(f"❌ Error en guardado: {save_response.status_code}")
        print(f"📄 Respuesta: {save_response.text}")
        return False

if __name__ == "__main__":
    success = test_save_endpoint()
    sys.exit(0 if success else 1)
