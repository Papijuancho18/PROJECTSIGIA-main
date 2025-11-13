"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedChartPreview } from "@/components/enhanced-chart-preview"
import type { ChartTemplate, TableTemplate } from "@/components/template-manager"

// Importar plantillas predeterminadas (normalmente vendrían de una API o estado global)
const defaultChartTemplates: ChartTemplate[] = [
  {
    id: "chart-template-1",
    name: "Indicadores académicos por periodo",
    description: "Comparativa de indicadores clave a lo largo de diferentes periodos académicos",
    category: "académico",
    tags: ["periodos", "comparativa", "indicadores"],
    chartData: {
      id: "chart-1",
      title: "Indicadores Académicos por Periodo",
      type: "bar",
      labels: ["2021-1", "2021-2", "2022-1", "2022-2", "2023-1"],
      datasets: [
        {
          label: "Aprobación",
          data: [75, 78, 80, 82, 85],
          backgroundColor: "#3EBD93",
          borderColor: "#35A883",
        },
        {
          label: "Satisfacción",
          data: [82, 85, 83, 87, 90],
          backgroundColor: "#334E68",
          borderColor: "#2A3F55",
        },
      ],
    },
    createdAt: "12/01/2023",
    lastModified: "12/01/2023",
  },
  {
    id: "chart-template-2",
    name: "Distribución de calificaciones",
    description: "Distribución porcentual de calificaciones por rango",
    category: "evaluación",
    tags: ["calificaciones", "distribución", "rendimiento"],
    chartData: {
      id: "chart-2",
      title: "Distribución de Calificaciones",
      type: "pie",
      labels: ["Excelente (9-10)", "Bueno (8-8.9)", "Regular (7-7.9)", "Insuficiente (<7)"],
      datasets: [
        {
          label: "Porcentaje",
          data: [25, 40, 25, 10],
          backgroundColor: ["#3EBD93", "#334E68", "#FFCA3A", "#E63946"],
          borderColor: ["#35A883", "#2A3F55", "#F5C033", "#D33240"],
        },
      ],
    },
    createdAt: "15/01/2023",
    lastModified: "18/03/2023",
  },
  {
    id: "chart-template-3",
    name: "Tendencia de publicaciones académicas",
    description: "Evolución del número de publicaciones científicas por año",
    category: "investigación",
    tags: ["publicaciones", "tendencia", "investigación"],
    chartData: {
      id: "chart-3",
      title: "Publicaciones Académicas por Año",
      type: "line",
      labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
      datasets: [
        {
          label: "Artículos Publicados",
          data: [12, 15, 18, 25, 32, 40],
          backgroundColor: "#3EBD93",
          borderColor: "#35A883",
          tension: 0.4,
        },
      ],
    },
    createdAt: "20/02/2023",
    lastModified: "20/02/2023",
  },
]

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

interface ChartTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: ChartTemplate) => void
}

export function ChartTemplateSelector({ open, onOpenChange, onSelectTemplate }: ChartTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [chartTemplates] = useState<ChartTemplate[]>(defaultChartTemplates)

  // Filtrar plantillas por término de búsqueda y categoría
  const filteredTemplates = chartTemplates.filter((template) => {
    const matchesSearch =
      searchTerm === "" ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "todos" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla de Gráfico</DialogTitle>
          <DialogDescription>Elija una plantilla prediseñada para su gráfico</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorías</SelectItem>
              <SelectItem value="académico">Académico</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="evaluación">Evaluación</SelectItem>
              <SelectItem value="investigación">Investigación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden border-primary/20 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-[150px] mb-3 bg-gray-50 border rounded overflow-hidden">
                  <EnhancedChartPreview chartData={template.chartData} showControls={false} height="150px" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {template.category}
                  </Badge>
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-secondary/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500 col-span-2">
              No se encontraron plantillas que coincidan con los criterios de búsqueda.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TableTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: TableTemplate) => void
}

export function TableTemplateSelector({ open, onOpenChange, onSelectTemplate }: TableTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [tableTemplates] = useState<TableTemplate[]>(defaultTableTemplates)

  // Filtrar plantillas por término de búsqueda y categoría
  const filteredTemplates = tableTemplates.filter((template) => {
    const matchesSearch =
      searchTerm === "" ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "todos" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla de Tabla</DialogTitle>
          <DialogDescription>Elija una plantilla prediseñada para su tabla</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorías</SelectItem>
              <SelectItem value="académico">Académico</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="evaluación">Evaluación</SelectItem>
              <SelectItem value="investigación">Investigación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden border-primary/20 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-[150px] mb-3 bg-gray-50 border rounded overflow-hidden relative">
                  <div className="absolute inset-0 p-2 text-xs">
                    <div className="overflow-auto h-full">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-gray-100">
                            {template.columnHeaders.slice(0, 3).map((header, i) => (
                              <th key={i} className="p-1 border text-xs font-medium">
                                {header}
                              </th>
                            ))}
                            {template.columnHeaders.length > 3 && (
                              <th className="p-1 border text-xs font-medium">...</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {template.rowHeaders.slice(0, 3).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="p-1 border text-xs font-medium bg-gray-50">{row}</td>
                              {template.data[rowIndex].slice(0, 2).map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-1 border text-xs">
                                  {cell}
                                </td>
                              ))}
                              {template.data[rowIndex].length > 2 && <td className="p-1 border text-xs">...</td>}
                            </tr>
                          ))}
                          {template.rowHeaders.length > 3 && (
                            <tr>
                              <td className="p-1 border text-xs font-medium bg-gray-50">...</td>
                              <td className="p-1 border text-xs">...</td>
                              <td className="p-1 border text-xs">...</td>
                              {template.columnHeaders.length > 3 && <td className="p-1 border text-xs">...</td>}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {template.category}
                  </Badge>
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-secondary/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500 col-span-2">
              No se encontraron plantillas que coincidan con los criterios de búsqueda.
            </div>
          )}
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
