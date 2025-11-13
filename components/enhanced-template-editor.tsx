"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Save,
  X,
  Type,
  Heading1,
  Heading2,
  List,
  BarChart3,
  Table,
  ImageIcon,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"

// Tipos de datos
export interface ContentElement {
  id: string
  type: "text" | "heading1" | "heading2" | "list" | "chart" | "table" | "image"
  content: any
  order: number
}

export interface EnhancedReportSection {
  id: string
  title: string
  elements: ContentElement[]
  order: number
  isRequired: boolean
  parentId?: string
  subsections?: EnhancedReportSection[]
  isExpanded?: boolean
}

export interface EnhancedReportTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  sections: EnhancedReportSection[]
  createdAt: string
  lastModified: string
  created_by?: number
  created_by_name?: string
  template_type?: string
  is_active?: boolean
  is_public?: boolean
}

interface EnhancedTemplateEditorProps {
  initialTemplate?: EnhancedReportTemplate
  onSave: (template: EnhancedReportTemplate) => void
  onCancel: () => void
}

const getDefaultContent = (type: ContentElement["type"]) => {
  switch (type) {
    case "text":
      return { text: "Escriba aquí el contenido..." }
    case "heading1":
      return { text: "Título Principal" }
    case "heading2":
      return { text: "Subtítulo" }
    case "list":
      return { items: ["Elemento 1", "Elemento 2", "Elemento 3"] }
    case "chart":
      return {
        title: "Gráfico",
        type: "bar",
        data: { labels: [], datasets: [] },
      }
    case "table":
      return {
        title: "Tabla",
        headers: ["Columna 1", "Columna 2"],
        rows: [["Dato 1", "Dato 2"]],
      }
    case "image":
      return { url: "", alt: "Descripción de la imagen" }
    default:
      return {}
  }
}

export function EnhancedTemplateEditor({ initialTemplate, onSave, onCancel }: EnhancedTemplateEditorProps) {
  // Inicializar el template una sola vez
  const [template, setTemplate] = useState<EnhancedReportTemplate>(() => {
    if (initialTemplate) {
      return {
        ...initialTemplate,
        sections: initialTemplate.sections || [],
      }
    }
    return {
      id: `template-${Date.now()}`,
      name: "Nueva Plantilla",
      description: "",
      category: "académico",
      tags: [],
      sections: [
        {
          id: `section-${Date.now()}`,
          title: "Introducción",
          elements: [],
          order: 0,
          isRequired: true,
          isExpanded: true,
        },
      ],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
  })

  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Usar useCallback para evitar re-creación de funciones
  const handleSave = useCallback(async () => {
    try {
      setSaving(true)

      if (!template.name.trim()) {
        toast({
          title: "Error de validación",
          description: "El nombre de la plantilla es requerido",
          variant: "destructive",
        })
        return
      }

      if (!template.sections || template.sections.length === 0) {
        toast({
          title: "Error de validación",
          description: "La plantilla debe tener al menos una sección",
          variant: "destructive",
        })
        return
      }

      const updatedTemplate = {
        ...template,
        lastModified: new Date().toISOString(),
      }

      let savedTemplate: EnhancedReportTemplate

      if (initialTemplate && initialTemplate.id) {
        savedTemplate = await apiService.saveEnhancedTemplate(initialTemplate.id, updatedTemplate)
      } else {
        savedTemplate = await apiService.createTemplate(updatedTemplate)
      }

      setHasUnsavedChanges(false)
      toast({
        title: "Éxito",
        description: initialTemplate ? "Plantilla actualizada correctamente" : "Plantilla creada correctamente",
      })

      onSave(savedTemplate)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al guardar"
      toast({
        title: "Error al guardar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [template, initialTemplate, onSave, toast])

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmExit = confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")
      if (!confirmExit) return
    }
    onCancel()
  }, [hasUnsavedChanges, onCancel])

  const updateTemplate = useCallback((updates: Partial<EnhancedReportTemplate>) => {
    setTemplate((prev) => ({ ...prev, ...updates }))
    setHasUnsavedChanges(true)
  }, [])

  const updateSection = useCallback((sectionId: string, updates: Partial<EnhancedReportSection>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
    setHasUnsavedChanges(true)
  }, [])

  const addSection = useCallback(() => {
    const newSection: EnhancedReportSection = {
      id: `section-${Date.now()}`,
      title: "Nueva Sección",
      elements: [],
      order: template.sections.length,
      isRequired: false,
      isExpanded: true,
    }

    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setHasUnsavedChanges(true)
  }, [template.sections.length])

  const deleteSection = useCallback(
    (sectionId: string) => {
      if (template.sections.length <= 1) {
        toast({
          title: "Error",
          description: "Debe haber al menos una sección",
          variant: "destructive",
        })
        return
      }

      setTemplate((prev) => ({
        ...prev,
        sections: prev.sections.filter((section) => section.id !== sectionId),
      }))
      setHasUnsavedChanges(true)
    },
    [template.sections.length, toast],
  )

  const addElement = useCallback(
    (sectionId: string, elementType: ContentElement["type"]) => {
      const section = template.sections.find((s) => s.id === sectionId)
      if (!section) return

      const newElement: ContentElement = {
        id: `element-${Date.now()}`,
        type: elementType,
        content: getDefaultContent(elementType),
        order: section.elements.length,
      }

      updateSection(sectionId, {
        elements: [...section.elements, newElement],
      })
    },
    [template.sections, updateSection],
  )

  const updateElement = useCallback(
    (sectionId: string, elementId: string, updates: Partial<ContentElement>) => {
      const section = template.sections.find((s) => s.id === sectionId)
      if (!section) return

      const updatedElements = section.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element,
      )

      updateSection(sectionId, { elements: updatedElements })
    },
    [template.sections, updateSection],
  )

  const deleteElement = useCallback(
    (sectionId: string, elementId: string) => {
      const section = template.sections.find((s) => s.id === sectionId)
      if (!section) return

      const updatedElements = section.elements.filter((element) => element.id !== elementId)
      updateSection(sectionId, { elements: updatedElements })
    },
    [template.sections, updateSection],
  )

  const getElementIcon = useCallback((type: ContentElement["type"]) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "heading1":
        return <Heading1 className="h-4 w-4" />
      case "heading2":
        return <Heading2 className="h-4 w-4" />
      case "list":
        return <List className="h-4 w-4" />
      case "chart":
        return <BarChart3 className="h-4 w-4" />
      case "table":
        return <Table className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }, [])

  const elementTypes = useMemo(
    () => [
      { type: "text" as const, label: "Texto" },
      { type: "heading1" as const, label: "Título 1" },
      { type: "heading2" as const, label: "Título 2" },
      { type: "list" as const, label: "Lista" },
      { type: "chart" as const, label: "Gráfico" },
      { type: "table" as const, label: "Tabla" },
      { type: "image" as const, label: "Imagen" },
    ],
    [],
  )

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex-1">
          <Input
            value={template.name}
            onChange={(e) => updateTemplate({ name: e.target.value })}
            className="text-xl font-semibold border-none p-0 focus:ring-0"
            placeholder="Nombre de la plantilla"
          />
          <Textarea
            value={template.description}
            onChange={(e) => updateTemplate({ description: e.target.value })}
            className="mt-2 border-none p-0 focus:ring-0 resize-none"
            placeholder="Descripción de la plantilla"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3 ml-6">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Cambios sin guardar
            </Badge>
          )}

          <select
            value={template.category}
            onChange={(e) => updateTemplate({ category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="académico">Académico</option>
            <option value="ejecutivo">Ejecutivo</option>
            <option value="investigación">Investigación</option>
            <option value="estadístico">Estadístico</option>
            <option value="evaluación">Evaluación</option>
            <option value="digital">Digital</option>
            <option value="personalizada">Personalizada</option>
          </select>

          <Button
            onClick={handleSave}
            disabled={saving}
            variant={hasUnsavedChanges ? "default" : "outline"}
            className={hasUnsavedChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : hasUnsavedChanges ? "Guardar cambios" : "Guardado"}
          </Button>

          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {template.sections.map((section) => (
            <Card key={section.id} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSection(section.id, { isExpanded: !section.isExpanded })}
                    >
                      {section.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="font-medium text-lg border-none p-0 focus:ring-0"
                      placeholder="Título de la sección"
                    />

                    <Badge variant={section.isRequired ? "default" : "secondary"}>
                      {section.isRequired ? "Requerida" : "Opcional"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSection(section.id, { isRequired: !section.isRequired })}
                    >
                      {section.isRequired ? "Hacer opcional" : "Hacer requerida"}
                    </Button>

                    {template.sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {section.isExpanded && (
                <CardContent className="space-y-4">
                  {/* Elementos de la sección */}
                  {section.elements.map((element) => (
                    <div key={element.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getElementIcon(element.type)}
                          <span className="font-medium capitalize">{element.type}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteElement(section.id, element.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Contenido del elemento */}
                      <div className="space-y-2">
                        {element.type === "text" && (
                          <Textarea
                            value={element.content?.text || ""}
                            onChange={(e) =>
                              updateElement(section.id, element.id, {
                                content: { ...element.content, text: e.target.value },
                              })
                            }
                            placeholder="Escriba el contenido del texto..."
                            rows={3}
                          />
                        )}

                        {(element.type === "heading1" || element.type === "heading2") && (
                          <Input
                            value={element.content?.text || ""}
                            onChange={(e) =>
                              updateElement(section.id, element.id, {
                                content: { ...element.content, text: e.target.value },
                              })
                            }
                            placeholder="Escriba el título..."
                          />
                        )}

                        {element.type === "list" && (
                          <div className="space-y-2">
                            {(element.content?.items || []).map((item: string, itemIndex: number) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...(element.content?.items || [])]
                                    newItems[itemIndex] = e.target.value
                                    updateElement(section.id, element.id, {
                                      content: { ...element.content, items: newItems },
                                    })
                                  }}
                                  placeholder={`Elemento ${itemIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newItems =
                                      element.content?.items?.filter((_: any, i: number) => i !== itemIndex) || []
                                    updateElement(section.id, element.id, {
                                      content: { ...element.content, items: newItems },
                                    })
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItems = [...(element.content?.items || []), "Nuevo elemento"]
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, items: newItems },
                                })
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar elemento
                            </Button>
                          </div>
                        )}

                        {element.type === "chart" && (
                          <div className="space-y-2">
                            <Input
                              value={element.content?.title || ""}
                              onChange={(e) =>
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, title: e.target.value },
                                })
                              }
                              placeholder="Título del gráfico"
                            />
                            <select
                              value={element.content?.type || "bar"}
                              onChange={(e) =>
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, type: e.target.value },
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="bar">Barras</option>
                              <option value="line">Líneas</option>
                              <option value="pie">Circular</option>
                              <option value="area">Área</option>
                            </select>
                          </div>
                        )}

                        {element.type === "table" && (
                          <div className="space-y-2">
                            <Input
                              value={element.content?.title || ""}
                              onChange={(e) =>
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, title: e.target.value },
                                })
                              }
                              placeholder="Título de la tabla"
                            />
                            <div className="text-sm text-gray-600">
                              Configuración de tabla (headers y rows se configurarán en el editor de informes)
                            </div>
                          </div>
                        )}

                        {element.type === "image" && (
                          <div className="space-y-2">
                            <Input
                              value={element.content?.url || ""}
                              onChange={(e) =>
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, url: e.target.value },
                                })
                              }
                              placeholder="URL de la imagen"
                            />
                            <Input
                              value={element.content?.alt || ""}
                              onChange={(e) =>
                                updateElement(section.id, element.id, {
                                  content: { ...element.content, alt: e.target.value },
                                })
                              }
                              placeholder="Descripción de la imagen"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Botones para agregar elementos */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center text-gray-600 mb-3">Agregar elemento</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {elementTypes.map(({ type, label }) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          onClick={() => addElement(section.id, type)}
                          className="gap-2"
                        >
                          {getElementIcon(type)}
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Botón para agregar sección */}
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center">
              <Button onClick={addSection} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar nueva sección
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EnhancedTemplateEditor
