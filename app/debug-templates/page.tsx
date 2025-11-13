"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateDebugTool } from "@/components/template-debug-tool"
import { apiService } from "@/lib/api"

export default function DebugTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAvailableTemplatesForReports()
      if (response && response.results) {
        setTemplates(response.results)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando plantillas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Herramienta de Diagnóstico de Plantillas</h1>
        <p className="text-muted-foreground mt-2">
          Utiliza esta herramienta para diagnosticar problemas con las plantillas y probar la funcionalidad de copia.
        </p>
      </div>

      {!selectedTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Plantilla para Diagnosticar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">Secciones: {template.sections?.length || 0}</span>
                      <Button size="sm" onClick={() => setSelectedTemplate(template)}>
                        Diagnosticar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            ← Volver a la lista
          </Button>

          <TemplateDebugTool templateId={selectedTemplate.id} templateName={selectedTemplate.name} />
        </div>
      )}
    </div>
  )
}
