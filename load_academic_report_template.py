#!/usr/bin/env python3
"""
Script para cargar la plantilla de Informe de Gestión Académica como plantilla predefinida del admin
EDITABLE POR PERSONAL ADMINISTRATIVO
"""

import os
import sys
import django
from datetime import datetime

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

from templates.models import Template
from accounts.models import User

def create_academic_report_template():
    """
    Crea la plantilla del Informe de Gestión en los Programas Académicos
    CONFIGURADA PARA SER EDITABLE POR PERSONAL ADMINISTRATIVO
    """
    
    # Buscar usuario admin
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            print("❌ No se encontró usuario administrador")
            return False
    except Exception as e:
        print(f"❌ Error al buscar usuario admin: {e}")
        return False

    # Estructura completa del informe con elementos editables
    template_sections = [
        {
            "id": "presentation",
            "title": "PRESENTACIÓN",
            "order": 0,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "presentation-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "El Informe de Gestión 202X del programa [Aquí va el nombre del programa] es un documento fundamental que garantiza la transparencia, la rendición de cuentas y el impulso hacia el mejoramiento continuo en nuestra institución. Este informe responde a la necesidad de documentar de manera rigurosa la gestión realizada por cada programa académico, facilitando así la rendición de cuentas a los grupos de interés y permitiendo un seguimiento detallado de las actividades desarrolladas durante el año."
                    }
                },
                {
                    "id": "presentation-alignment",
                    "type": "text",
                    "order": 1,
                    "content": {
                        "text": "Este informe está alineado con la estructura y los objetivos estratégicos del Plan Estratégico de Desarrollo Institucional (PED 2023-2027), así como con los lineamientos establecidos por la Vicerrectoría Académica para la evaluación de la oferta académica."
                    }
                }
            ]
        },
        {
            "id": "education-quality",
            "title": "1. EDUCACIÓN DE ALTA CALIDAD, INCLUSIVA, INNOVADORA Y TRANSFORMADORA",
            "order": 1,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "education-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "La Universidad asume como principio fundacional la educación integral, incluyente y crítica, comprometida con el desarrollo sostenible y el aporte a la generación de movilidad y transformación social a través de una oferta académica de alta calidad, flexible y pertinente a las necesidades y realidades del entorno."
                    }
                }
            ],
            "subsections": [
                {
                    "id": "academic-processes",
                    "title": "1.1. PROCESOS ACADÉMICOS",
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "curricular-management",
                            "type": "text",
                            "order": 0,
                            "content": {
                                "text": "**1.1.1. GESTIÓN CURRICULAR**\n\nRedacte, de manera precisa y concisa, la información relacionada con la gestión del programa durante el año evaluado, enfocándose en los aspectos curriculares y alineándose con los compromisos del plan de acción. Se recomienda utilizar la información y las evidencias registradas en STRATEGIC U como parte del seguimiento al plan de acción.\n\n¿Qué mecanismos se han implementado para evaluar el currículo? ¿Se ha llevado a cabo un seguimiento efectivo de su implementación?"
                            }
                        },
                        {
                            "id": "student-trajectory",
                            "type": "text",
                            "order": 1,
                            "content": {
                                "text": "**1.1.2. TRAYECTORIA DE LOS ESTUDIANTES EN LOS PROCESOS FORMATIVOS**\n\nPresente un análisis preciso y conciso de la trayectoria académica seguida por los estudiantes a lo largo de su proceso formativo. Lo anterior, enfocándose en indicadores como el promedio académico y el porcentaje de cumplimiento de los resultados de aprendizaje."
                            }
                        },
                        {
                            "id": "flexibility-strategies",
                            "type": "text",
                            "order": 2,
                            "content": {
                                "text": "**1.1.3. ESTRATEGIAS DE FLEXIBILIZACIÓN**\n\nPresente un análisis preciso y conciso de la implementación y los resultados de las estrategias de flexibilización aplicadas en el programa."
                            }
                        },
                        {
                            "id": "electivity-table",
                            "type": "table",
                            "order": 3,
                            "content": {
                                "title": "Tabla 1. Electividad en el programa",
                                "headers": [
                                    "Alternativas de electividad",
                                    "Curso electivo (Nombre y código)",
                                    "Oferta de cursos electivos",
                                    "Número de estudiantes matriculados período 1",
                                    "Número de estudiantes matriculados período 2"
                                ],
                                "rows": [
                                    ["Región de Formación General", "Ejemplo: Desarrollo personal III (5753)", "Baloncesto", "10", "15"],
                                    ["", "", "Arte y carnaval", "11", "9"],
                                    ["", "", "Taller de pintura", "23", "21"],
                                    ["", "", "Fútbol sala", "12", "14"],
                                    ["Región de Formación profesional básica", "", "", "", ""],
                                    ["Región de Formación profesional específica", "", "", "", ""],
                                    ["Región de Formación Complementaria", "", "", "", ""]
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "academic-quality",
                    "title": "1.2. CALIDAD ACADÉMICA",
                    "order": 1,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "quality-intro",
                            "type": "text",
                            "order": 0,
                            "content": {
                                "text": "Los programas académicos de la Universidad Simón Bolívar, como parte de una institución acreditada en alta calidad, integran la calidad como un valor esencial y un objetivo central en su gestión."
                            }
                        },
                        {
                            "id": "excellence-recognition-table",
                            "type": "table",
                            "order": 1,
                            "content": {
                                "title": "Tabla 3. Número de estudiantes reconocidos por su excelencia académica (Si el programa es de pregrado)",
                                "headers": ["Rango de niveles de avance", "Número de estudiantes reconocidos"],
                                "rows": [
                                    ["Entre 1º y el 3º nivel académico", ""],
                                    ["Entre el 4º y el penúltimo nivel académico", ""],
                                    ["En el último nivel académico", ""],
                                    ["Total", ""]
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "student-population",
                    "title": "1.3. POBLACIÓN ESTUDIANTIL",
                    "order": 2,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "population-intro",
                            "type": "text",
                            "order": 0,
                            "content": {
                                "text": "La población estudiantil es el pilar fundamental de los programas académicos de la Universidad Simón Bolívar, que se enfocan en consolidar y fortalecer su base mediante una oferta educativa que integra investigación científica, formación y promoción cultural e ideológica."
                            }
                        },
                        {
                            "id": "enrollment-charts-placeholder",
                            "type": "text",
                            "order": 1,
                            "content": {
                                "text": "**1.3.1. COMPORTAMIENTO DE LA MATRÍCULA**\n\n[ESPACIO PARA GRÁFICOS]\n\n• Gráfico 1. Comportamiento de la matrícula de estudiantes de primer ingreso\n• Gráfico 2. Comportamiento de la matrícula de estudiantes antiguos\n• Gráfico 3. Comportamiento de la matrícula total de estudiantes\n\nPresente un análisis del comportamiento de los tres gráficos anteriores."
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "research-extension",
            "title": "2. INVESTIGACIÓN, EXTENSIÓN E INNOVACIÓN CON IMPACTO Y RELEVANCIA SOCIAL",
            "order": 2,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "research-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "En la Universidad Simón Bolívar, la investigación es una actividad crítica, creativa e innovadora que articula saberes y permite a los actores académicos desarrollar capacidades para abordar problemas, construir conocimientos de manera continua y explorar fenómenos naturales y sociales desde diversas perspectivas disciplinares, interdisciplinares y transdisciplinares."
                    }
                }
            ],
            "subsections": [
                {
                    "id": "research-development",
                    "title": "2.1. DESARROLLO DE LA INVESTIGACIÓN EN EL PROGRAMA",
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "research-training-table",
                            "type": "table",
                            "order": 0,
                            "content": {
                                "title": "Tabla 9. Participación de estudiantes en las estrategias de formación en investigación",
                                "headers": ["Estrategia", "Número de estudiantes"],
                                "rows": [
                                    ["Semilleros de investigación", ""],
                                    ["Proyectos de investigación", ""],
                                    ["Jóvenes investigadores", ""],
                                    ["Grupos de investigación", ""],
                                    ["Total", ""]
                                ]
                            }
                        },
                        {
                            "id": "research-seedbeds-charts",
                            "type": "text",
                            "order": 1,
                            "content": {
                                "text": "**2.1.1.2. Semilleros de investigación e innovación**\n\n[ESPACIO PARA GRÁFICOS]\n\n• Gráfico 15. Comportamiento de la vinculación de estudiantes a semilleros de investigación 5 años período 1\n• Gráfico 16. Comportamiento de la vinculación de estudiantes a semilleros de investigación 5 años período 2\n\nPresente un análisis de la información contenida en los gráficos."
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "administrative-financial",
            "title": "3. GESTIÓN ADMINISTRATIVA Y FINANCIERA",
            "order": 3,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "admin-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "La gestión administrativa y financiera es esencial y transversal al funcionamiento institucional, apoyando el desarrollo de los fines misionales de la educación superior."
                    }
                }
            ],
            "subsections": [
                {
                    "id": "financial-management",
                    "title": "3.1. GESTIÓN FINANCIERA EFECTIVA Y TRANSPARENTE",
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "budget-execution-chart",
                            "type": "text",
                            "order": 0,
                            "content": {
                                "text": "**3.1.1. EJECUCIÓN PRESUPUESTAL**\n\n[ESPACIO PARA GRÁFICO]\n\n• Gráfico 17. Comportamiento de ingresos, gastos y excedentes del programa\n\nPresente un análisis preciso y conciso del comportamiento de los ingresos, gastos y excedentes financieros del programa."
                            }
                        },
                        {
                            "id": "budget-execution-table",
                            "type": "table",
                            "order": 1,
                            "content": {
                                "title": "Tabla 15. Ejecución presupuestal del programa",
                                "headers": ["Concepto", "Presupuesto Inicial", "Modificaciones", "Presupuesto Definitivo", "Compromisos", "Obligaciones", "Pagos", "% Ejecución"],
                                "rows": [
                                    ["Ingresos", "", "", "", "", "", "", ""],
                                    ["Gastos de Funcionamiento", "", "", "", "", "", "", ""],
                                    ["Gastos de Inversión", "", "", "", "", "", "", ""],
                                    ["Total Gastos", "", "", "", "", "", "", ""],
                                    ["Excedente/Déficit", "", "", "", "", "", "", ""]
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "internationalization",
            "title": "4. INTERNACIONALIZACIÓN DE LA EDUCACIÓN SUPERIOR PARA LA GLOBALIZACIÓN",
            "order": 4,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "international-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "Para la Universidad Simón Bolívar, la internacionalización es un eje transversal que articula sus funciones misionales en contextos locales, regionales, nacionales y globales, promoviendo la universalización del conocimiento y la inserción de la comunidad académica en ámbitos internacionales para el desarrollo sostenible de los territorios."
                    }
                }
            ],
            "subsections": [
                {
                    "id": "academic-mobility",
                    "title": "4.3. MOVILIDAD ACADÉMICA",
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "student-mobility-table",
                            "type": "table",
                            "order": 0,
                            "content": {
                                "title": "Tabla 18. Movilidad de estudiantes",
                                "headers": ["Alcance de la movilidad", "Número de estudiantes Saliente", "Número de estudiantes Entrante"],
                                "rows": [
                                    ["Local", "", ""],
                                    ["Nacional", "", ""],
                                    ["Internacional", "", ""],
                                    ["Total", "", ""]
                                ]
                            }
                        },
                        {
                            "id": "international-mobility-chart",
                            "type": "text",
                            "order": 1,
                            "content": {
                                "text": "[ESPACIO PARA GRÁFICO]\n\n• Gráfico 18. Comportamiento de la movilidad internacional de los estudiantes en los últimos 5 años\n\nRealice un análisis del comportamiento de la movilidad internacional de los estudiantes."
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "good-governance",
            "title": "5. BUEN GOBIERNO, EFICIENCIA Y TRANSPARENCIA EN LA GESTIÓN",
            "order": 5,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "governance-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "El Gobierno Institucional se basa en políticas, estrategias, estructuras y procesos que, fundamentados en ética, calidad, transparencia, integridad, eficiencia, eficacia y participación, orientan el cumplimiento de la misión institucional."
                    }
                }
            ],
            "subsections": [
                {
                    "id": "program-governance",
                    "title": "5.1. EL GOBIERNO EN EL PROGRAMA",
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True,
                    "elements": [
                        {
                            "id": "program-committee-table",
                            "type": "table",
                            "order": 0,
                            "content": {
                                "title": "Tabla 22. Conformación del Comité de Programa",
                                "headers": ["Integrante", "Nombre"],
                                "rows": [
                                    ["Director de programa", ""],
                                    ["Coordinador de formación", ""],
                                    ["Coordinador de bienestar y permanencia", ""],
                                    ["Coordinador de prácticas", ""],
                                    ["Representante estudiantil", ""],
                                    ["Representante egresados", ""]
                                ]
                            }
                        },
                        {
                            "id": "committee-meetings",
                            "type": "text",
                            "order": 1,
                            "content": {
                                "text": "En el año 202X, el Comité de Programa se reunió en [XX] ocasiones, durante los meses de [especificar meses]. A continuación, se detallan los principales temas tratados y las decisiones adoptadas en el marco de estas sesiones del Comité:\n\n• [Tema 1]\n• [Tema 2]\n• [Tema 3]\n• [Tema 4]"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "sustainability",
            "title": "6. LA SOSTENIBILIDAD COMO APUESTA TRANSFORMADORA PARA EDUCAR EL FUTURO",
            "order": 6,
            "isRequired": True,
            "isExpanded": True,
            "elements": [
                {
                    "id": "sustainability-intro",
                    "type": "text",
                    "order": 0,
                    "content": {
                        "text": "Las instituciones educativas enfrentan crecientes desafíos en sostenibilidad, y como agentes de cambio, deben adaptar sus servicios a las necesidades del entorno, reduciendo barreras de acceso a una educación superior de calidad e inclusiva. La Universidad Simón Bolívar se compromete a fortalecer sus actividades y programas para ofrecer una educación superior orientada hacia la sostenibilidad."
                    }
                },
                {
                    "id": "ods-contribution",
                    "type": "text",
                    "order": 1,
                    "content": {
                        "text": "Presente aquí una síntesis de las principales acciones implementadas por el programa, asociadas al compromiso institucional con el desarrollo sostenible, en el desarrollo de las funciones de docencia, investigación y extensión. Para este punto tome como referencia la información consignada en el informe de aporte a los ODS de la facultad."
                    }
                }
            ]
        }
    ]

    # Crear la plantilla
    try:
        template = Template.objects.create(
            name="Informe de Gestión en los Programas Académicos",
            description="Plantilla oficial para informes de gestión académica de la Universidad Simón Bolívar. Formato F-GD-68-PA. EDITABLE POR PERSONAL ADMINISTRATIVO para personalización según necesidades del programa.",
            category="académico",
            template_type="report",
            content=template_sections,  # Usar la estructura de secciones directamente
            is_active=True,
            is_public=True,  # PÚBLICO para que staff pueda acceder
            created_by=admin_user,
            tags=[
                "informe", 
                "gestión", 
                "académico", 
                "universidad", 
                "simon bolivar", 
                "oficial", 
                "institucional",
                "editable",
                "staff",
                "administrativo"
            ]
        )
        
        print("✅ Plantilla de Informe de Gestión Académica creada exitosamente")
        print(f"   ID: {template.id}")
        print(f"   Nombre: {template.name}")
        print(f"   Categoría: {template.category}")
        print(f"   Tipo: {template.template_type}")
        print(f"   Secciones: {len(template_sections)}")
        print(f"   Es pública: {template.is_public}")
        print(f"   Creado por: {admin_user.username} (ADMIN)")
        print(f"   Editable por: Personal administrativo (STAFF)")
        
        # Contar elementos totales
        total_elements = 0
        for section in template_sections:
            total_elements += len(section.get('elements', []))
            for subsection in section.get('subsections', []):
                total_elements += len(subsection.get('elements', []))
        
        print(f"   Elementos totales: {total_elements}")
        print(f"   Tags: {', '.join(template.tags)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al crear la plantilla: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """
    Función principal
    """
    print("🚀 Iniciando carga de plantilla de Informe de Gestión Académica...")
    print("📋 CONFIGURACIÓN: Plantilla editable por personal administrativo")
    print("=" * 70)
    
    # Verificar si ya existe la plantilla
    existing_template = Template.objects.filter(
        name="Informe de Gestión en los Programas Académicos"
    ).first()
    
    if existing_template:
        print("⚠️  La plantilla ya existe en el sistema")
        print(f"   Creada por: {existing_template.created_by.username}")
        print(f"   Es pública: {existing_template.is_public}")
        print(f"   Fecha creación: {existing_template.created_at}")
        
        response = input("\n¿Desea reemplazarla? (s/n): ").lower().strip()
        
        if response == 's':
            existing_template.delete()
            print("🗑️  Plantilla anterior eliminada")
        else:
            print("❌ Operación cancelada")
            return
    
    # Crear la plantilla
    success = create_academic_report_template()
    
    if success:
        print("\n" + "=" * 70)
        print("✅ PLANTILLA CARGADA EXITOSAMENTE")
        print("=" * 70)
        print("\n📋 CONFIGURACIÓN DE ACCESO:")
        print("• Creada por: ADMINISTRADOR")
        print("• Editable por: PERSONAL ADMINISTRATIVO (STAFF)")
        print("• Visible para: TODOS LOS USUARIOS")
        print("• Tipo: Plantilla institucional")
        
        print("\n🎯 USUARIOS QUE PUEDEN EDITARLA:")
        print("• Administradores del sistema")
        print("• Personal administrativo (staff)")
        print("• Directores de programa")
        print("• Coordinadores académicos")
        
        print("\n📍 UBICACIÓN EN EL SISTEMA:")
        print("• Panel de administración > Plantillas")
        print("• Selector de plantillas > Categoría: Académico")
        print("• Tipo: Reporte institucional")
        print("• Estado: Pública y editable")
        
        print("\n📝 CARACTERÍSTICAS:")
        print("• 6 secciones principales")
        print("• Múltiples subsecciones")
        print("• Tablas predefinidas")
        print("• Espacios para gráficos")
        print("• 23 anexos incluidos")
        print("• Formato oficial F-GD-68-PA")
        
    else:
        print("\n" + "=" * 70)
        print("❌ ERROR AL CARGAR LA PLANTILLA")
        print("=" * 70)

if __name__ == "__main__":
    main()
