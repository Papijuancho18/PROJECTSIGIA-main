"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { ChartTemplate } from "@/components/template-manager"

// Plantillas de ejemplo para gráficos
const exampleTemplates: ChartTemplate[] = [
  {
    id: "bar-chart-1",
    name: "Gráfico de Barras",
    description: "Gráfico de barras básico",
    chartData: {
      type: "bar",
      title: "Ventas por Trimestre",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          label: "2023",
          data: [120, 150, 180, 90],
          backgroundColor: ["#3EBD93", "#334E68", "#FFCA3A", "#E63946"],
        },
      ],
    },
  },
  {
    id: "line-chart-1",
    name: "Gráfico de Líneas",
    description: "Gráfico de líneas básico",
    chartData: {
      type: "line",
      title: "Tendencia de Ventas",
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      datasets: [
        {
          label: "2023",
          data: [65, 59, 80, 81, 56, 55],
          borderColor: "#3EBD93",
          backgroundColor: "rgba(62, 189, 147, 0.2)",
        },
      ],
    },
  },
  {
    id: "pie-chart-1",
    name: "Gráfico Circular",
    description: "Gráfico circular básico",
    chartData: {
      type: "pie",
      title: "Distribución de Ventas",
      labels: ["Producto A", "Producto B", "Producto C", "Producto D"],
      datasets: [
        {
          data: [300, 50, 100, 150],
          backgroundColor: ["#3EBD93", "#334E68", "#FFCA3A", "#E63946"],
        },
      ],
    },
  },
  {
    id: "donut-chart-1",
    name: "Gráfico de Dona",
    description: "Gráfico de dona básico",
    chartData: {
      type: "donut",
      title: "Distribución de Presupuesto",
      labels: ["Marketing", "Desarrollo", "Ventas", "Soporte"],
      datasets: [
        {
          data: [35, 25, 22, 18],
          backgroundColor: ["#3EBD93", "#334E68", "#FFCA3A", "#E63946"],
        },
      ],
    },
  },
  {
    id: "radar-chart-1",
    name: "Gráfico de Radar",
    description: "Gráfico de radar para comparar múltiples variables",
    chartData: {
      type: "radar",
      title: "Competencias por Departamento",
      labels: ["Investigación", "Docencia", "Gestión", "Innovación", "Extensión", "Internacionalización"],
      datasets: [
        {
          label: "Departamento A",
          data: [85, 90, 75, 80, 70, 65],
          backgroundColor: "rgba(62, 189, 147, 0.2)",
          borderColor: "#3EBD93",
        },
        {
          label: "Departamento B",
          data: [75, 85, 90, 65, 85, 80],
          backgroundColor: "rgba(51, 78, 104, 0.2)",
          borderColor: "#334E68",
        },
      ],
    },
  },
  {
    id: "area-chart-1",
    name: "Gráfico de Área",
    description: "Gráfico de área para mostrar tendencias acumulativas",
    chartData: {
      type: "area",
      title: "Evolución de Estudiantes por Nivel",
      labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
      datasets: [
        {
          label: "Pregrado",
          data: [3500, 3800, 4100, 4500, 4800, 5200],
          backgroundColor: "rgba(62, 189, 147, 0.2)",
          borderColor: "#3EBD93",
          fill: true,
        },
        {
          label: "Posgrado",
          data: [1200, 1350, 1500, 1700, 1900, 2100],
          backgroundColor: "rgba(51, 78, 104, 0.2)",
          borderColor: "#334E68",
          fill: true,
        },
      ],
    },
  },
  {
    id: "bubble-chart-1",
    name: "Gráfico de Burbujas",
    description: "Gráfico de burbujas para visualizar tres dimensiones de datos",
    chartData: {
      type: "bubble",
      title: "Relación Inversión-Resultados-Tamaño",
      labels: ["Facultad A", "Facultad B", "Facultad C", "Facultad D", "Facultad E"],
      datasets: [
        {
          label: "Facultades",
          data: [
            { x: 25, y: 85, r: 15 },
            { x: 40, y: 92, r: 20 },
            { x: 30, y: 88, r: 18 },
            { x: 50, y: 95, r: 25 },
            { x: 15, y: 78, r: 10 },
          ],
          backgroundColor: [
            "rgba(62, 189, 147, 0.6)",
            "rgba(51, 78, 104, 0.6)",
            "rgba(255, 202, 58, 0.6)",
            "rgba(230, 57, 70, 0.6)",
            "rgba(106, 5, 114, 0.6)",
          ],
        },
      ],
    },
  },
  {
    id: "stacked-bar-chart-1",
    name: "Gráfico de Barras Apiladas",
    description: "Gráfico de barras apiladas para comparar partes de un todo",
    chartData: {
      type: "bar",
      title: "Distribución de Calificaciones por Curso",
      labels: ["Curso A", "Curso B", "Curso C", "Curso D", "Curso E"],
      datasets: [
        {
          label: "Excelente",
          data: [30, 40, 25, 35, 45],
          backgroundColor: "#3EBD93",
          stack: "Stack 0",
        },
        {
          label: "Bueno",
          data: [40, 35, 45, 40, 30],
          backgroundColor: "#334E68",
          stack: "Stack 0",
        },
        {
          label: "Regular",
          data: [20, 15, 20, 15, 15],
          backgroundColor: "#FFCA3A",
          stack: "Stack 0",
        },
        {
          label: "Insuficiente",
          data: [10, 10, 10, 10, 10],
          backgroundColor: "#E63946",
          stack: "Stack 0",
        },
      ],
    },
  },
]

interface ChartTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: ChartTemplate) => void
}

export function ChartTemplateSelector({ open, onOpenChange, onSelectTemplate }: ChartTemplateSelectorProps) {
  const [templates] = useState<ChartTemplate[]>(exampleTemplates)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla de Gráfico</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="font-medium mb-2">{template.name}</div>
                <div className="text-sm text-gray-500 mb-4">{template.description}</div>
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-medium">{template.chartData.title}</div>
                    <div className="text-sm text-gray-500">Tipo: {template.chartData.type}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Agregar estilos CSS personalizados para el scroll
const scrollStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`

// Agregar los estilos al head del documento
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style")
  styleElement.textContent = scrollStyles
  document.head.appendChild(styleElement)
}
