"use client"

import { useState } from "react"
import type { TableTemplate } from "@/components/template-manager"

// Importar plantillas predeterminadas (normalmente vendrían de una API o estado global)
const defaultTableTemplates: TableTemplate[] = [
  {
    id: "table-template-1",
    name: "Resultados de evaluación docente",
    description: "Tabla para presentar resultados de evaluación docente por criterio",
    category: "evaluación",
    tags: ["evaluación", "docentes", "calidad"],
    rowHeaders: [
      "Dominio del tema",
      "Claridad expositiva",
      "Material didáctico",
      "Atención a estudiantes",
      "Evaluación",
    ],
    columnHeaders: ["Criterio", "Puntaje 2022", "Puntaje 2023", "Variación", "Meta"],
    data: [
      ["4.2", "4.5", "+0.3", "4.5"],
      ["3.8", "4.2", "+0.4", "4.5"],
      ["4.0", "4.1", "+0.1", "4.5"],
      ["3.9", "4.3", "+0.4", "4.5"],
      ["4.1", "4.4", "+0.3", "4.5"],
    ],
    createdAt: "10/01/2023",
    lastModified: "10/01/2023",
  },
  {
    id: "table-template-2",
    name: "Indicadores de gestión académica",
    description: "Tabla comparativa de indicadores de gestión por programa",
    category: "académico",
    tags: ["indicadores", "gestión", "programas"],
    rowHeaders: ["Ingeniería de Sistemas", "Medicina", "Administración", "Derecho", "Psicología"],
    columnHeaders: ["Programa", "Retención", "Graduación", "Investigación", "Satisfacción"],
    data: [
      ["92%", "85%", "15", "4.2/5"],
      ["95%", "90%", "20", "4.5/5"],
      ["90%", "82%", "10", "4.0/5"],
      ["88%", "80%", "12", "4.1/5"],
      ["93%", "87%", "8", "4.3/5"],
    ],
    createdAt: "15/01/2023",
    lastModified: "20/03/2023",
  },
]

interface TableTemplateSelectorProps {
  onSelectTemplate: (template: TableTemplate) => void
  onCancel: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TableTemplateSelector({ onSelectTemplate, onCancel, open, onOpenChange }: TableTemplateSelectorProps) {
  // Seleccionar automáticamente la primera plantilla
  useState(() => {
    if (defaultTableTemplates.length > 0) {
      onSelectTemplate(defaultTableTemplates[0])
    } else {
      // Si no hay plantillas predefinidas, crear una plantilla vacía
      const emptyTemplate: TableTemplate = {
        id: `table-${Date.now()}`,
        name: "Nueva tabla",
        description: "Descripción de la tabla",
        category: "académico",
        rowHeaders: ["Fila 1", "Fila 2", "Fila 3"],
        columnHeaders: ["Columna", "Valor 1", "Valor 2", "Valor 3"],
        data: [
          ["Dato 1-1", "Dato 1-2", "Dato 1-3"],
          ["Dato 2-1", "Dato 2-2", "Dato 2-3"],
          ["Dato 3-1", "Dato 3-2", "Dato 3-3"],
        ],
      }
      onSelectTemplate(emptyTemplate)
    }
  })

  // No renderizar nada, ya que la interfaz visual se ha eliminado
  return null
}
