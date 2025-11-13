"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EnhancedTemplateEditor } from "./enhanced-template-editor"

export function ReportTemplateEditor() {
  const [showEditor, setShowEditor] = useState(false)
  const [templates, setTemplates] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Plantillas de Informes</h2>
          <p className="text-gray-600">Crea y gestiona plantillas para informes académicos</p>
        </div>
        <Button onClick={() => setShowEditor(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
            <EnhancedTemplateEditor
              onSave={(template) => {
                console.log("Plantilla guardada:", template)
                setTemplates((prev) => [...prev, template])
                setShowEditor(false)
              }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Lista de plantillas existentes */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
