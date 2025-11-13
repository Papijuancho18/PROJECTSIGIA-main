"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, MoreVertical, Edit, Copy, Trash2 } from "lucide-react"
// Corrige la importación de EnhancedTemplateEditor
import EnhancedTemplateEditor from "./enhanced-template-editor"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { EnhancedReportTemplate } from "@/types/enhanced-report-template" // Declare the variable before using it

export function TemplateManagement() {
  const [templates, setTemplates] = useState<EnhancedReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EnhancedReportTemplate | null>(null)
  const { toast } = useToast()

  // Cargar plantillas
  useEffect(() => {
    loadTemplates()
  }, [searchQuery, selectedCategory])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTemplates({
        enhanced: true,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      })
      setTemplates(response.results || [])
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowTemplateEditor(true)
  }

  const handleEditTemplate = (template: EnhancedReportTemplate) => {
    setEditingTemplate(template)
    setShowTemplateEditor(true)
  }

  const handleSaveTemplate = async (template: EnhancedReportTemplate) => {
    try {
      if (editingTemplate) {
        // Actualizar plantilla existente
        await apiService.saveEnhancedTemplate(editingTemplate.id, template)
        toast({
          title: "Éxito",
          description: "Plantilla actualizada correctamente",
        })
      } else {
        // Crear nueva plantilla
        await apiService.createTemplate(template)
        toast({
          title: "Éxito",
          description: "Plantilla creada correctamente",
        })
      }

      setShowTemplateEditor(false)
      setEditingTemplate(null)
      loadTemplates()
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateTemplate = async (template: EnhancedReportTemplate) => {
    try {
      await apiService.duplicateTemplate(template.id)
      toast({
        title: "Éxito",
        description: "Plantilla duplicada correctamente",
      })
      loadTemplates()
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast({
        title: "Error",
        description: "No se pudo duplicar la plantilla",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (template: EnhancedReportTemplate) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.name}"?`)) {
      return
    }

    try {
      console.log(`🗑️ Intentando eliminar plantilla con ID: ${template.id}`)

      // Verificar que el ID sea válido
      if (!template.id) {
        toast({
          title: "Error",
          description: "ID de plantilla no válido",
          variant: "destructive",
        })
        return
      }

      // Intentar eliminar la plantilla
      await apiService.deleteTemplate(template.id)

      console.log(`✅ Plantilla eliminada correctamente: ${template.id}`)

      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente",
      })

      // Recargar la lista de plantillas
      loadTemplates()
    } catch (error) {
      console.error("❌ Error al eliminar plantilla:", error)

      // Mostrar mensaje de error más detallado
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al eliminar la plantilla"

      toast({
        title: "Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const categories = [
    "académico",
    "ejecutivo",
    "investigación",
    "estadístico",
    "evaluación",
    "digital",
    "personalizada",
  ]

  if (showTemplateEditor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
          <EnhancedTemplateEditor
            initialTemplate={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setShowTemplateEditor(false)
              setEditingTemplate(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Plantillas</h2>
          <p className="text-gray-600 mt-1">Crea y administra plantillas para tus reportes</p>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de plantillas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory
                ? "No se encontraron plantillas que coincidan con los filtros"
                : "Comienza creando tu primera plantilla"}
            </p>
            <Button onClick={handleCreateTemplate} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primera plantilla
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{template.description}</CardDescription>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Secciones:</span>
                      <span className="font-medium">{template.sections?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Creado:</span>
                      <span className="font-medium">{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modificado:</span>
                      <span className="font-medium">{new Date(template.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1 gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                      className="gap-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
