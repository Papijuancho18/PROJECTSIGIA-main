"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StaffSidebar } from "@/components/staff-sidebar"
import { ExportButton } from "@/components/export-button"
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para reportes
const mockReports = [
  {
    id: "1",
    title: "Informe de Rendimiento Académico Q1 2024",
    subtitle: "Análisis trimestral del rendimiento estudiantil",
    author: "Dr. María González",
    department: "Facultad de Ciencias",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    status: "published",
    sections: [
      {
        id: "section-1",
        title: "Resumen Ejecutivo",
        content:
          "Este informe presenta un análisis detallado del rendimiento académico durante el primer trimestre de 2024. Los resultados muestran una mejora significativa en las calificaciones promedio y una reducción en las tasas de deserción estudiantil.",
        type: "text" as const,
      },
      {
        id: "section-2",
        title: "Indicadores Clave de Rendimiento",
        content:
          "Los principales indicadores evaluados incluyen: promedio general de calificaciones, tasa de aprobación por materia, índice de satisfacción estudiantil y tiempo promedio de graduación.",
        type: "text" as const,
      },
      {
        id: "section-3",
        title: "Análisis por Facultades",
        content:
          "Se presenta un desglose detallado del rendimiento por cada facultad, identificando fortalezas y áreas de mejora específicas.",
        type: "table" as const,
        data: {
          id: "table-1",
          title: "Rendimiento por Facultad",
          headers: ["Facultad", "Promedio", "Tasa Aprobación", "Estudiantes"],
          rows: [
            ["Ciencias", "8.5", "92%", "450"],
            ["Ingeniería", "8.2", "89%", "380"],
            ["Humanidades", "8.7", "94%", "320"],
            ["Medicina", "8.9", "96%", "280"],
          ],
          summary: "La Facultad de Medicina presenta el mejor rendimiento general, seguida por Humanidades.",
        },
      },
      {
        id: "section-4",
        title: "Conclusiones y Recomendaciones",
        content:
          "Basado en el análisis realizado, se recomienda implementar programas de tutoría adicionales en las áreas con menor rendimiento y continuar con las estrategias exitosas en las facultades de mejor desempeño.",
        type: "text" as const,
      },
    ],
    tables: [
      {
        id: "table-1",
        title: "Estadísticas Generales",
        headers: ["Métrica", "Q1 2023", "Q1 2024", "Variación"],
        rows: [
          ["Promedio General", "7.8", "8.4", "+7.7%"],
          ["Tasa de Aprobación", "85%", "91%", "+6%"],
          ["Satisfacción Estudiantil", "7.2", "8.1", "+12.5%"],
          ["Tiempo Promedio Graduación", "5.2 años", "4.8 años", "-7.7%"],
        ],
        summary: "Mejora consistente en todos los indicadores clave.",
      },
    ],
    charts: [
      {
        id: "chart-1",
        title: "Evolución del Promedio General",
        type: "line" as const,
        data: [
          { mes: "Enero", promedio: 8.2 },
          { mes: "Febrero", promedio: 8.4 },
          { mes: "Marzo", promedio: 8.6 },
        ],
        description: "Tendencia ascendente en el promedio general de calificaciones.",
      },
    ],
  },
  {
    id: "2",
    title: "Evaluación de Programas de Tutoría",
    subtitle: "Impacto de los programas de apoyo académico",
    author: "Prof. Carlos Rodríguez",
    department: "Dirección Académica",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    status: "draft",
    sections: [
      {
        id: "section-1",
        title: "Introducción",
        content:
          "Evaluación del impacto de los programas de tutoría implementados durante el semestre anterior, analizando su efectividad en el mejoramiento del rendimiento estudiantil.",
        type: "text" as const,
      },
      {
        id: "section-2",
        title: "Metodología",
        content:
          "Se utilizó un enfoque mixto combinando análisis cuantitativo de calificaciones y evaluaciones cualitativas mediante encuestas y entrevistas.",
        type: "text" as const,
      },
      {
        id: "section-3",
        title: "Resultados",
        content:
          "Los estudiantes que participaron en programas de tutoría mostraron una mejora promedio del 15% en sus calificaciones comparado con el grupo control.",
        type: "text" as const,
      },
    ],
    tables: [
      {
        id: "table-2",
        title: "Comparación de Resultados",
        headers: ["Grupo", "Promedio Inicial", "Promedio Final", "Mejora"],
        rows: [
          ["Con Tutoría", "7.2", "8.3", "+15.3%"],
          ["Sin Tutoría", "7.1", "7.4", "+4.2%"],
        ],
        summary: "Diferencia significativa entre grupos con y sin tutoría.",
      },
    ],
    charts: [],
  },
  {
    id: "3",
    title: "Análisis de Satisfacción Estudiantil",
    subtitle: "Encuesta semestral de satisfacción",
    author: "Dra. Ana Martínez",
    department: "Bienestar Estudiantil",
    createdAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-15T16:45:00Z",
    status: "published",
    sections: [
      {
        id: "section-1",
        title: "Resumen",
        content:
          "Resultados de la encuesta semestral de satisfacción estudiantil, incluyendo evaluación de servicios académicos, infraestructura y bienestar estudiantil.",
        type: "text" as const,
      },
      {
        id: "section-2",
        title: "Principales Hallazgos",
        content:
          "Alto nivel de satisfacción general (8.1/10), con áreas de mejora identificadas en servicios de biblioteca y conectividad wifi.",
        type: "text" as const,
      },
    ],
    tables: [
      {
        id: "table-3",
        title: "Satisfacción por Área",
        headers: ["Área", "Calificación", "Participantes"],
        rows: [
          ["Calidad Docente", "8.5", "1,250"],
          ["Infraestructura", "7.8", "1,180"],
          ["Servicios Estudiantiles", "8.2", "1,100"],
          ["Biblioteca", "7.2", "980"],
        ],
        summary: "La calidad docente recibe la mejor evaluación.",
      },
    ],
    charts: [
      {
        id: "chart-2",
        title: "Distribución de Satisfacción",
        type: "pie" as const,
        data: [
          { categoria: "Muy Satisfecho", valor: 45 },
          { categoria: "Satisfecho", valor: 35 },
          { categoria: "Neutral", valor: 15 },
          { categoria: "Insatisfecho", valor: 5 },
        ],
        description: "80% de los estudiantes reportan estar satisfechos o muy satisfechos.",
      },
    ],
  },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "draft":
        return "Borrador"
      case "archived":
        return "Archivado"
      default:
        return status
    }
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Gestión de Reportes</h1>
              <p className="text-gray-600">Administre y exporte sus reportes académicos</p>
            </div>
            <Link href="/staff/reports/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Reporte
              </Button>
            </Link>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar reportes por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{mockReports.length}</div>
                <div className="text-sm text-gray-600">Total Reportes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {mockReports.filter((r) => r.status === "published").length}
                </div>
                <div className="text-sm text-gray-600">Publicados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockReports.filter((r) => r.status === "draft").length}
                </div>
                <div className="text-sm text-gray-600">Borradores</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {mockReports.reduce((acc, report) => acc + report.sections.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Secciones</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge className={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                    </div>
                    {report.subtitle && <CardDescription className="text-base mb-2">{report.subtitle}</CardDescription>}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Por: {report.author}</span>
                      <span>•</span>
                      <span>{report.department}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.createdAt).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportButton report={report} buttonVariant="outline" size="sm" showLabel={false} />
                    <Link href={`/staff/reports/${report.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/staff/reports/edit/${report.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Secciones:</span> {report.sections.length}
                  </div>
                  <div>
                    <span className="font-medium">Tablas:</span> {report.tables?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Gráficos:</span> {report.charts?.length || 0}
                  </div>
                </div>
                {report.sections.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{report.sections[0].content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron reportes</h3>
                <p>No hay reportes que coincidan con los criterios de búsqueda.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
