"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  FileText,
  Users,
  Award,
  BarChart2,
  BookOpen,
  ClipboardList,
  Edit,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { apiService } from "@/lib/api"
import type { EnhancedReportTemplate } from "@/lib/api"

interface AvailableTemplatesSelectorProps {
  onSelectTemplate: (template: any) => void
  onCancel: () => void
}

export function AvailableTemplatesSelector({ onSelectTemplate, onCancel }: AvailableTemplatesSelectorProps) {
  const [templates, setTemplates] = useState<EnhancedReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      console.log("🔄 Loading admin templates for reports...")
      setLoading(true)
      setError(null)

      // Verificar si el usuario está autenticado
      if (!apiService.isAuthenticated()) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        setLoading(false)
        return
      }

      // Obtener todas las plantillas con filtro enhanced
      const response = await apiService.getTemplates({ enhanced: true })
      console.log("✅ Templates loaded from basic endpoint:", response)

      if (response && response.results) {
        // Filtrar plantillas públicas creadas por admin (más flexible)
        const adminTemplates = response.results.filter((template) => {
          // Verificar que sea una plantilla pública o activa
          const isAdminTemplate =
            (template.is_public === true || template.is_active !== false) && !template.name.includes("(Copia personal)")

          const hasValidContent = verifyTemplateContent(template)

          if (isAdminTemplate && !hasValidContent) {
            console.warn(`⚠️ Admin template ${template.id} (${template.name}) has invalid content`)
          } else if (isAdminTemplate && hasValidContent) {
            console.log(`✅ Admin template ${template.id} (${template.name}) is available`)
          }

          return isAdminTemplate && hasValidContent
        })

        setTemplates(adminTemplates)
        console.log(`📋 Loaded ${adminTemplates.length} admin templates out of ${response.results.length} total`)
      } else {
        console.warn("⚠️ No templates found in response")
        setTemplates([])
      }
    } catch (error) {
      console.error("❌ Error loading admin templates:", error)

      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        if (error.message.includes("Sesión expirada") || error.message.includes("autenticación")) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente para acceder a las plantillas.")
        } else if (error.message.includes("conectar")) {
          setError("No se puede conectar al servidor. Verifica tu conexión a internet.")
        } else {
          setError("Error al cargar las plantillas. Intenta nuevamente.")
        }
      } else {
        setError("Error desconocido al cargar las plantillas.")
      }

      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const verifyTemplateContent = (template: EnhancedReportTemplate): boolean => {
    try {
      // Verificar que la plantilla tenga al menos un nombre
      if (!template.name || template.name.trim() === "") {
        console.warn(`⚠️ Template ${template.id} has no name`)
        return false
      }

      // Verificar que la plantilla tenga secciones
      if (!template.sections || !Array.isArray(template.sections)) {
        console.warn(`⚠️ Template ${template.id} has no sections array`)
        return false
      }

      // Si no hay secciones, pero es una plantilla válida, permitirla
      if (template.sections.length === 0) {
        console.log(`✅ Template ${template.id} is empty but valid - user can add content`)
        return true
      }

      // Verificar que al menos una sección tenga estructura básica válida
      let hasValidSection = false

      for (const section of template.sections) {
        // Verificar que la sección tenga estructura básica
        if (!section || typeof section !== "object") {
          console.warn(`⚠️ Template ${template.id} has invalid section structure`)
          continue
        }

        // Una sección es válida si tiene al menos un título
        if (section.title && section.title.trim() !== "") {
          hasValidSection = true
          console.log(`✅ Section "${section.title}" is valid`)

          // Contar elementos si existen (pero no requerirlos)
          let elementCount = 0
          if (section.elements && Array.isArray(section.elements)) {
            elementCount = section.elements.filter(
              (element) => element && typeof element === "object" && element.type,
            ).length
          }

          // Contar subsecciones si existen
          let subsectionCount = 0
          if (section.subsections && Array.isArray(section.subsections)) {
            subsectionCount = section.subsections.filter(
              (subsection) => subsection && subsection.title && subsection.title.trim() !== "",
            ).length
          }

          console.log(`📊 Section "${section.title}": ${elementCount} elements, ${subsectionCount} subsections`)
        }
      }

      if (!hasValidSection) {
        console.warn(`⚠️ Template ${template.id} has no valid sections with titles`)
        return false
      }

      console.log(`✅ Template ${template.id} "${template.name}" is valid and usable`)
      return true
    } catch (error) {
      console.error(`❌ Error verifying template ${template.id}:`, error)
      return false
    }
  }

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "académico":
        return <BookOpen className="h-5 w-5" />
      case "ejecutivo":
        return <Award className="h-5 w-5" />
      case "estadístico":
        return <BarChart2 className="h-5 w-5" />
      case "evaluación":
        return <ClipboardList className="h-5 w-5" />
      case "investigación":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: EnhancedReportTemplate) => {
    console.log("🎯 Template selected:", {
      id: template.id,
      name: template.name,
      sectionsCount: template.sections?.length || 0,
      sections: template.sections,
    })

    // Convertir al formato esperado por el componente padre
    const convertedTemplate = {
      id: template.id,
      title: template.name,
      name: template.name,
      description: template.description || "",
      category: template.category,
      sections: template.sections || [],
      content: template.sections || [], // También pasar en content para compatibilidad
      icon: getIconForCategory(template.category),
    }

    onSelectTemplate(convertedTemplate)
  }

  const handleRetry = () => {
    loadTemplates()
  }

  const handleLogin = () => {
    // Redirigir a la página de login
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Cargando plantillas disponibles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>

        <div className="text-center">
          <div className="flex gap-3 justify-center">
            {error.includes("sesión") || error.includes("autenticación") ? (
              <Button onClick={handleLogin} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            ) : (
              <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Seleccionar Plantilla de Administrador</h2>
        <p className="text-gray-600 mb-4">
          Selecciona una plantilla creada por el administrador. Podrás editarla completamente para crear tu informe
          personalizado.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las categorías</option>
          <option value="académico">Académico</option>
          <option value="ejecutivo">Ejecutivo</option>
          <option value="investigación">Investigación</option>
          <option value="estadístico">Estadístico</option>
          <option value="evaluación">Evaluación</option>
          <option value="digital">Digital</option>
          <option value="personalizada">Personalizada</option>
        </select>
      </div>

      {/* Plantillas de Administrador */}
      {filteredTemplates.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Plantillas Disponibles ({filteredTemplates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getIconForCategory(template.category)}
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description || "Sin descripción"}</p>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Secciones: {template.sections?.length || 0}</p>
                    <p>Creado por: Administrador</p>
                    <p className="text-green-600 font-medium">✓ Totalmente editable</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSelectTemplate(template)} className="flex-1" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Usar y Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {filteredTemplates.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron plantillas</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay plantillas disponibles en este momento"}
          </p>
          <Button variant="outline" onClick={loadTemplates} className="mt-4">
            Recargar plantillas
          </Button>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
