"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BarChart, Table, ArrowRight } from "lucide-react"
import { TemplateWithPlaceholders } from "./template-with-placeholders"
import { createValidationRules, type ValidationRule } from "@/utils/content-validation"

// Definir los tipos para las plantillas predefinidas
interface TemplatePlaceholder {
  id: string
  type: "chart" | "text" | "table"
  label: string
  description: string
  required: boolean
  content?: string
  validationRules?: ValidationRule[]
}

interface TemplateSection {
  id: string
  title: string
  content: string
  editable: boolean
  placeholders?: TemplatePlaceholder[]
  validationRules?: ValidationRule[]
}

interface PredefinedTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: string
  sections: TemplateSection[]
}

// Plantillas predefinidas con texto y placeholders para gráficos
const PREDEFINED_TEMPLATES: PredefinedTemplate[] = [
  {
    id: "informe-rendimiento",
    name: "Informe de Rendimiento Académico",
    description: "Plantilla para informes de rendimiento con análisis de datos y gráficos",
    icon: BarChart,
    category: "académico",
    sections: [
      {
        id: "seccion-introduccion",
        title: "Introducción",
        content: `<h2>Introducción al Informe de Rendimiento</h2>
        <p>Este informe presenta un análisis detallado del rendimiento académico durante el período evaluado. El objetivo es proporcionar una visión clara de los indicadores clave de desempeño y facilitar la toma de decisiones basada en datos.</p>
        <p>La metodología utilizada para la recopilación y análisis de datos sigue los estándares institucionales establecidos, garantizando la precisión y relevancia de la información presentada.</p>`,
        editable: false,
      },
      {
        id: "seccion-datos",
        title: "Análisis de Datos",
        content: `<h2>Análisis de Datos de Rendimiento</h2>
        <p>A continuación se presenta un análisis de los principales indicadores de rendimiento académico. Los datos han sido recopilados a través del sistema institucional de gestión académica y representan el período completo evaluado.</p>`,
        editable: false,
        placeholders: [
          {
            id: "grafico-rendimiento",
            type: "chart",
            label: "Gráfico de Rendimiento Académico",
            description:
              "Inserte un gráfico que muestre la evolución del rendimiento académico durante el período evaluado. Se recomienda un gráfico de barras o líneas que muestre la tendencia temporal.",
            required: true,
            validationRules: createValidationRules("chart", { requiredExplanation: true }),
          },
          {
            id: "explicacion-grafico",
            type: "text",
            label: "Explicación del Gráfico",
            description:
              "Proporcione una explicación detallada del gráfico, incluyendo análisis de tendencias, comparaciones con períodos anteriores y conclusiones relevantes.",
            required: true,
            validationRules: createValidationRules("text", {
              minLength: 150,
              maxLength: 1000,
              keywords: ["tendencia", "análisis", "comparación", "conclusión"],
            }),
          },
        ],
      },
      {
        id: "seccion-conclusiones",
        title: "Conclusiones y Recomendaciones",
        content: `<h2>Conclusiones</h2>
        <p>Con base en el análisis de los datos presentados, se pueden extraer las siguientes conclusiones generales:</p>
        <ul>
          <li>Los indicadores muestran una tendencia [completar según el análisis]</li>
          <li>Las áreas de mayor fortaleza identificadas son [completar según el análisis]</li>
          <li>Los aspectos que requieren atención son [completar según el análisis]</li>
        </ul>`,
        editable: true,
        validationRules: createValidationRules("text", {
          minLength: 200,
          keywords: ["conclusión", "recomendación", "mejora"],
        }),
      },
    ],
  },
  {
    id: "informe-evaluacion",
    name: "Informe de Evaluación de Programa",
    description: "Plantilla para evaluación de programas académicos con análisis comparativo",
    icon: Table,
    category: "evaluación",
    sections: [
      {
        id: "seccion-resumen",
        title: "Resumen Ejecutivo",
        content: `<h2>Resumen Ejecutivo</h2>
        <p>Este informe presenta la evaluación del programa académico [Nombre del Programa] realizada durante el período [Período]. La evaluación se ha llevado a cabo siguiendo los criterios establecidos en el marco de calidad institucional.</p>`,
        editable: true,
        validationRules: createValidationRules("text", { minLength: 100 }),
      },
      {
        id: "seccion-indicadores",
        title: "Indicadores de Desempeño",
        content: `<h2>Indicadores Clave de Desempeño</h2>
        <p>Los siguientes indicadores proporcionan una visión general del desempeño del programa en las áreas críticas evaluadas:</p>`,
        editable: false,
        placeholders: [
          {
            id: "tabla-indicadores",
            type: "table",
            label: "Tabla de Indicadores",
            description:
              "Inserte una tabla con los indicadores clave de desempeño del programa, incluyendo valores actuales, metas y porcentaje de cumplimiento.",
            required: true,
            validationRules: createValidationRules("table", {
              minRows: 4,
              minCols: 4,
              requiresHeader: true,
            }),
          },
          {
            id: "grafico-comparativo",
            type: "chart",
            label: "Gráfico Comparativo",
            description:
              "Inserte un gráfico que compare el desempeño actual con períodos anteriores o con otros programas similares.",
            required: true,
            validationRules: createValidationRules("chart", { requiredExplanation: true }),
          },
          {
            id: "analisis-comparativo",
            type: "text",
            label: "Análisis Comparativo",
            description:
              "Proporcione un análisis detallado de la comparación, destacando fortalezas, debilidades y oportunidades de mejora identificadas.",
            required: true,
            validationRules: createValidationRules("text", {
              minLength: 200,
              maxLength: 1500,
              keywords: ["fortaleza", "debilidad", "oportunidad", "mejora", "comparación"],
            }),
          },
        ],
      },
      {
        id: "seccion-recomendaciones",
        title: "Recomendaciones",
        content: `<h2>Recomendaciones</h2>
        <p>Con base en los resultados de la evaluación, se proponen las siguientes recomendaciones para la mejora continua del programa:</p>
        <ol>
          <li>[Completar con recomendación específica]</li>
          <li>[Completar con recomendación específica]</li>
          <li>[Completar con recomendación específica]</li>
        </ol>`,
        editable: true,
        validationRules: createValidationRules("text", {
          minLength: 150,
          keywords: ["recomendación", "implementación", "acción", "mejora", "plazo"],
        }),
      },
    ],
  },
]

interface PredefinedTemplateSelectorProps {
  onSaveTemplate: (templateId: string, sections: TemplateSection[]) => void
}

export function PredefinedTemplateSelector({ onSaveTemplate }: PredefinedTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PredefinedTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSelectTemplate = (template: PredefinedTemplate) => {
    setSelectedTemplate(template)
    setIsDialogOpen(true)
  }

  const handleSaveTemplate = (templateId: string, sections: TemplateSection[]) => {
    onSaveTemplate(templateId, sections)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary">Plantillas Predefinidas</h2>
          <p className="text-gray-500 mt-2">Seleccione una plantilla con texto predefinido para comenzar su informe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREDEFINED_TEMPLATES.map((template) => {
            const IconComponent = template.icon
            return (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-md transition-shadow card-hover border-primary/20"
              >
                <CardHeader className="pb-3 bg-highlight">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/20 p-2 rounded-full">
                      <IconComponent className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <CardDescription className="min-h-[60px]">{template.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{template.sections.length} secciones</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-highlight/50">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Usar plantilla <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Diálogo para editar la plantilla seleccionada */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <TemplateWithPlaceholders
              templateId={selectedTemplate.id}
              templateName={selectedTemplate.name}
              sections={selectedTemplate.sections}
              onSave={handleSaveTemplate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
