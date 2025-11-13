from rest_framework import serializers
from .models import Template, TemplateSection, TemplateVariable, ContentElement
import json

class TemplateSerializer(serializers.ModelSerializer):
    """Serializer básico para plantillas"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'content', 'category', 
            'template_type', 'tags', 'is_public', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class TemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear plantillas"""
    
    class Meta:
        model = Template
        fields = [
            'name', 'description', 'content', 'category', 
            'template_type', 'tags', 'is_public'
        ]

class ContentElementSerializer(serializers.ModelSerializer):
    """Serializer para elementos de contenido"""
    
    class Meta:
        model = ContentElement
        fields = ['id', 'element_type', 'content', 'order', 'section']

class TemplateSectionSerializer(serializers.ModelSerializer):
    """Serializer para secciones de plantillas"""
    elements = ContentElementSerializer(many=True, read_only=True)
    subsections = serializers.SerializerMethodField()
    
    class Meta:
        model = TemplateSection
        fields = [
            'id', 'name', 'title', 'section_type', 'content', 
            'order', 'is_required', 'is_expanded', 'parent_section',
            'elements', 'subsections'
        ]
    
    def get_subsections(self, obj):
        """Obtener subsecciones recursivamente"""
        subsections = obj.subsections.all().order_by('order')
        return TemplateSectionSerializer(subsections, many=True).data

class EnhancedTemplateSerializer(serializers.ModelSerializer):
    """Serializer avanzado para plantillas con secciones"""
    sections = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    lastModified = serializers.DateTimeField(source='updated_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'category', 'tags',
            'template_type', 'is_public', 'is_active',
            'sections', 'created_by', 'created_by_name',
            'createdAt', 'lastModified'
        ]
    
    def get_sections(self, obj):
        """Obtener secciones desde el campo content o desde las relaciones"""
        try:
            print(f"🔍 get_sections called for template: {obj.name} (ID: {obj.id})")
            
            # Estructura por defecto para secciones vacías
            default_sections = [
                {
                    "id": f"section-{obj.id}-default",
                    "title": "Introducción",
                    "elements": [],
                    "order": 0,
                    "isRequired": True,
                    "isExpanded": True
                }
            ]
            
            # Primero intentar obtener desde el campo content (datos guardados como JSON)
            if obj.content:
                try:
                    # Asegurar que content sea un string JSON
                    content_str = obj.content if isinstance(obj.content, str) else json.dumps(obj.content)
                    
                    # Parsear el contenido
                    content_data = json.loads(content_str)
                    
                    # Verificar que sea una lista de secciones
                    if isinstance(content_data, list) and len(content_data) > 0:
                        print(f"📦 Loading sections from content field: {len(content_data)} sections")
                        
                        # Normalizar cada sección para asegurar estructura consistente
                        normalized_sections = []
                        for section in content_data:
                            if not isinstance(section, dict):
                                print(f"⚠️ Skipping invalid section: {section}")
                                continue
                                
                            normalized_section = {
                                "id": section.get("id", f"section-{obj.id}-{len(normalized_sections)}"),
                                "title": section.get("title", "Sin título"),
                                "elements": [],
                                "order": section.get("order", 0),
                                "isRequired": section.get("isRequired", False),
                                "isExpanded": section.get("isExpanded", True),
                                "subsections": []
                            }
                            
                            # Normalizar elementos
                            if "elements" in section and isinstance(section["elements"], list):
                                for element in section["elements"]:
                                    if not isinstance(element, dict):
                                        continue
                                        
                                    element_type = element.get("type")
                                    if not element_type:
                                        continue
                                        
                                    normalized_element = {
                                        "id": element.get("id", f"element-{obj.id}-{len(normalized_section['elements'])}"),
                                        "type": element_type,
                                        "content": element.get("content", self._get_default_content(element_type)),
                                        "order": element.get("order", 0)
                                    }
                                    normalized_section["elements"].append(normalized_element)
                            
                            # Normalizar subsecciones recursivamente
                            if "subsections" in section and isinstance(section["subsections"], list):
                                for subsection in section["subsections"]:
                                    if not isinstance(subsection, dict):
                                        continue
                                        
                                    normalized_subsection = {
                                        "id": subsection.get("id", f"subsection-{obj.id}-{len(normalized_section['subsections'])}"),
                                        "title": subsection.get("title", "Sin título"),
                                        "elements": [],
                                        "order": subsection.get("order", 0),
                                        "isRequired": subsection.get("isRequired", False),
                                        "isExpanded": subsection.get("isExpanded", True)
                                    }
                                    
                                    # Normalizar elementos de subsección
                                    if "elements" in subsection and isinstance(subsection["elements"], list):
                                        for element in subsection["elements"]:
                                            if not isinstance(element, dict):
                                                continue
                                                
                                            element_type = element.get("type")
                                            if not element_type:
                                                continue
                                                
                                            normalized_element = {
                                                "id": element.get("id", f"element-sub-{obj.id}-{len(normalized_subsection['elements'])}"),
                                                "type": element_type,
                                                "content": element.get("content", self._get_default_content(element_type)),
                                                "order": element.get("order", 0)
                                            }
                                            normalized_subsection["elements"].append(normalized_element)
                                    
                                    normalized_section["subsections"].append(normalized_subsection)
                            
                            normalized_sections.append(normalized_section)
                        
                        # Verificar que haya al menos una sección normalizada
                        if normalized_sections:
                            print(f"✅ Normalized {len(normalized_sections)} sections with content")
                            return normalized_sections
                        else:
                            print(f"⚠️ No valid sections found after normalization")
                    else:
                        print(f"⚠️ Content field exists but is not a valid list: {type(content_data)}")
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"⚠️ Error parsing content JSON: {e}")
            else:
                print(f"⚠️ No content field data found")
            
            # Si no hay datos en content, obtener desde las relaciones de la base de datos
            sections = obj.sections.filter(parent_section=None).order_by('order')
            if sections.exists():
                print(f"📦 Loading sections from database relations: {sections.count()} sections")
                sections_data = TemplateSectionSerializer(sections, many=True).data
                
                # Convertir al formato esperado por el frontend
                formatted_sections = []
                for section_data in sections_data:
                    formatted_section = {
                        'id': section_data['id'],
                        'title': section_data['title'],
                        'elements': self._convert_elements(section_data.get('elements', [])),
                        'order': section_data['order'],
                        'isRequired': section_data['is_required'],
                        'isExpanded': section_data.get('is_expanded', True),
                        'subsections': self._convert_subsections(section_data.get('subsections', []))
                    }
                    formatted_sections.append(formatted_section)
                
                if formatted_sections:
                    return formatted_sections
            
            # Si no hay secciones, devolver estructura por defecto
            print("📦 No sections found, returning default structure")
            return default_sections
            
        except Exception as e:
            print(f"❌ Error in get_sections: {e}")
            import traceback
            traceback.print_exc()
            return default_sections
    
    def _convert_elements(self, elements_data):
        """Convertir elementos al formato esperado por el frontend"""
        formatted_elements = []
        for element in elements_data:
            formatted_element = {
                'id': element['id'],
                'type': element['element_type'],
                'content': element['content'],
                'order': element['order']
            }
            formatted_elements.append(formatted_element)
        return formatted_elements
    
    def _convert_subsections(self, subsections_data):
        """Convertir subsecciones recursivamente"""
        formatted_subsections = []
        for subsection in subsections_data:
            formatted_subsection = {
                'id': subsection['id'],
                'title': subsection['title'],
                'elements': self._convert_elements(subsection.get('elements', [])),
                'order': subsection['order'],
                'isRequired': subsection['is_required'],
                'isExpanded': subsection.get('is_expanded', True),
                'subsections': self._convert_subsections(subsection.get('subsections', []))
            }
            formatted_subsections.append(formatted_subsection)
        return formatted_subsections
    
    def _get_default_content(self, element_type):
        """Obtener contenido por defecto según el tipo de elemento"""
        if element_type == 'text':
            return {'text': 'Escriba aquí el contenido...'}
        elif element_type in ['heading1', 'heading2']:
            return {'text': 'Título'}
        elif element_type == 'list':
            return {'items': ['Elemento 1', 'Elemento 2', 'Elemento 3']}
        elif element_type == 'chart':
            return {'title': 'Gráfico', 'type': 'bar', 'data': {'labels': [], 'datasets': []}}
        elif element_type == 'table':
            return {'title': 'Tabla', 'headers': ['Columna 1', 'Columna 2'], 'rows': [['Dato 1', 'Dato 2']]}
        elif element_type == 'image':
            return {'url': '', 'alt': 'Descripción de la imagen'}
        else:
            return {}

class TemplateVariableSerializer(serializers.ModelSerializer):
    """Serializer para variables de plantillas"""
    
    class Meta:
        model = TemplateVariable
        fields = ['id', 'name', 'variable_type', 'default_value', 'is_required', 'template']
