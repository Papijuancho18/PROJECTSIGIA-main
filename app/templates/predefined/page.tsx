"use client"

import { useState } from "react"
import { PredefinedTemplateSelector } from "@/components/predefined-template-selector"
import { TemplateWithPlaceholders } from "@/components/template-with-placeholders"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface TemplateSection {
  id: string
  title: string
  content: string
  editable: boolean
  placeholders?: {
    id: string
    type: "chart" | "text" | "table"
    label: string
    description: string
    required: boolean
    content?: string
  }[]
}

interface SavedTemplate {
  id: string
  name: string
  sections: TemplateSection[]
}

export default function PredefinedTemplatesPage() {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [activeTemplate, setActiveTemplate] = useState<SavedTemplate | null>(null)

  const handleSaveTemplate = (templateId: string, sections: TemplateSection[]) => {
    // Buscar el nombre de la plantilla
    let templateName = "Plantilla personalizada"

    // Verificar si ya existe esta plantilla
    const existingTemplateIndex = savedTemplates.findIndex((t) => t.id === templateId)

    if (existingTemplateIndex >= 0) {
      // Actualizar plantilla existente
      templateName = savedTemplates[existingTemplateIndex].name
      const updatedTemplates = [...savedTemplates]
      updatedTemplates[existingTemplateIndex] = {
        id: templateId,
        name: templateName,
        sections,
      }
      setSavedTemplates(updatedTemplates)
      setActiveTemplate(updatedTemplates[existingTemplateIndex])
    } else {
      // Crear nueva plantilla
      const newTemplate = {
        id: templateId,
        name: templateName,
        sections,
      }
      setSavedTemplates([...savedTemplates, newTemplate])
      setActiveTemplate(newTemplate)
    }

    // Aquí normalmente guardarías en la base de datos
    console.log("Plantilla guardada:", { templateId, sections })
  }

  return (
    <div className="container mx-auto py-8">
      {!activeTemplate ? (
        <PredefinedTemplateSelector onSaveTemplate={handleSaveTemplate} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Editor de Plantilla</h1>
            <Button variant="outline" onClick={() => setActiveTemplate(null)}>
              Volver a plantillas
            </Button>
          </div>

          <TemplateWithPlaceholders
            templateId={activeTemplate.id}
            templateName={activeTemplate.name}
            sections={activeTemplate.sections}
            onSave={handleSaveTemplate}
          />
        </div>
      )}

      {/* Lista de plantillas guardadas */}
      {savedTemplates.length > 0 && !activeTemplate && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Plantillas Guardadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setActiveTemplate(template)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  {template.sections.length} secciones
                  {template.sections.some((s) =>
                    s.placeholders?.some((p) => p.required && (!p.content || p.content.trim() === "")),
                  )
                    ? " • Incompleta"
                    : " • Completa"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
