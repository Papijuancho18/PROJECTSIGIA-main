"use client"

import { useState, useEffect } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { exportReport, downloadBlob, type ReportData, type ExportTemplate } from "@/utils/report-export"
import { toast } from "@/components/ui/use-toast"
import { FileText, File, Calendar, User, Building } from "lucide-react"

interface SavedReport {
  id: string
  title: string
  author: string
  department: string
  createdAt: string
  lastEdited: string
  status: string
  sections: any[]
}

// Plantilla institucional con el formato especificado
const institutionalTemplate: ExportTemplate = {
  id: "institutional",
  name: "Formato Institucional",
  format: "institutional",
  styles: {
    fontFamily: "Calibri",
    primaryColor: "#000000",
    secondaryColor: "#666666",
    headerStyle: "bold_uppercase_left",
    includePageNumbers: true,
    includeTableOfContents: true,
    orientation: "portrait",
    fontSize: {
      title: 18,
      heading: 14,
      subheading: 12,
      body: 11,
      table: 10,
    },
    lineSpacing: 1.15,
    paragraphSpacing: {
      before: 0,
      after: 6,
    },
    margins: {
      top: 2.5,
      bottom: 2.5,
      left: 3,
      right: 2.5,
    },
    textAlignment: "justified",
  },
}

export default function StaffExportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [isExporting, setIsExporting] = useState<string | null>(null)

  useEffect(() => {
    const loadReports = () => {
      try {
        const reports = JSON.parse(localStorage.getItem("saved_reports") || "[]")
        if (reports.length > 0) {
          setSavedReports(reports)
        } else {
          // Crear reportes de ejemplo si no hay ninguno guardado
          const exampleReports: SavedReport[] = [
            {
              id: "demo-1",
              title: "Informe de Gestión Académica Q1 2025",
              author: "Dr. María González",
              department: "Departamento de Ingeniería",
              createdAt: "15/01/2025",
              lastEdited: "02/06/2025",
              status: "completado",
              sections: [
                {
                  id: "sec-1",
                  title: "Introducción",
                  content:
                    "Este informe presenta los resultados de gestión académica del primer trimestre de 2025, incluyendo indicadores de calidad, procesos de mejora y proyecciones futuras.",
                  type: "text",
                },
                {
                  id: "sec-2",
                  title: "Indicadores de Rendimiento Académico",
                  content: "Análisis detallado del rendimiento estudiantil por programa académico.",
                  type: "chart",
                  data: {
                    type: "bar",
                    title: "Rendimiento por Programa",
                    data: [
                      { label: "Ingeniería Civil", value: 85 },
                      { label: "Ingeniería de Sistemas", value: 92 },
                      { label: "Ingeniería Industrial", value: 88 },
                      { label: "Arquitectura", value: 90 },
                    ],
                  },
                },
                {
                  id: "sec-3",
                  title: "Distribución de Estudiantes por Semestre",
                  content: "Tabla con la distribución actual de estudiantes.",
                  type: "table",
                  data: {
                    headers: ["Semestre", "Estudiantes Activos", "Nuevos Ingresos", "Graduados"],
                    rows: [
                      ["I Semestre", "245", "89", "0"],
                      ["II Semestre", "198", "12", "3"],
                      ["III Semestre", "167", "8", "5"],
                      ["IV Semestre", "134", "5", "12"],
                      ["V Semestre", "112", "3", "18"],
                    ],
                  },
                },
                {
                  id: "sec-4",
                  title: "Conclusiones y Recomendaciones",
                  content:
                    "Basado en el análisis de los datos presentados, se recomienda implementar estrategias de retención estudiantil y fortalecer los programas de apoyo académico.",
                  type: "text",
                },
              ],
            },
            {
              id: "demo-2",
              title: "Evaluación de Calidad Docente 2025",
              author: "Dra. Ana Rodríguez",
              department: "Vicerrectoría Académica",
              createdAt: "20/01/2025",
              lastEdited: "01/06/2025",
              status: "borrador",
              sections: [
                {
                  id: "sec-1",
                  title: "Metodología de Evaluación",
                  content: "Descripción de los instrumentos y procesos utilizados para evaluar la calidad docente.",
                  type: "text",
                },
                {
                  id: "sec-2",
                  title: "Resultados de Satisfacción Estudiantil",
                  content: "Gráfico de satisfacción estudiantil con el desempeño docente.",
                  type: "chart",
                  data: {
                    type: "pie",
                    title: "Nivel de Satisfacción",
                    data: [
                      { label: "Muy Satisfecho", value: 45 },
                      { label: "Satisfecho", value: 35 },
                      { label: "Neutral", value: 15 },
                      { label: "Insatisfecho", value: 5 },
                    ],
                  },
                },
              ],
            },
            {
              id: "demo-3",
              title: "Informe de Investigación y Desarrollo",
              author: "Dr. Carlos Mendoza",
              department: "Centro de Investigación",
              createdAt: "10/02/2025",
              lastEdited: "02/06/2025",
              status: "en_revision",
              sections: [
                {
                  id: "sec-1",
                  title: "Proyectos de Investigación Activos",
                  content: "Listado y estado de los proyectos de investigación en curso.",
                  type: "text",
                },
                {
                  id: "sec-2",
                  title: "Presupuesto por Área de Investigación",
                  content: "Distribución del presupuesto asignado a cada área.",
                  type: "chart",
                  data: {
                    type: "bar",
                    title: "Presupuesto por Área (Miles de USD)",
                    data: [
                      { label: "Tecnología", value: 150 },
                      { label: "Ciencias Básicas", value: 120 },
                      { label: "Ciencias Sociales", value: 80 },
                      { label: "Innovación", value: 200 },
                    ],
                  },
                },
              ],
            },
          ]
          setSavedReports(exampleReports)
          localStorage.setItem("saved_reports", JSON.stringify(exampleReports))
        }
      } catch (error) {
        console.error("Error loading reports:", error)
        setSavedReports([])
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [])

  // Función para validar que el reporte tenga datos suficientes
  const validateReportData = (report: SavedReport): boolean => {
    if (!report.title || !report.author) {
      toast({
        variant: "destructive",
        title: "Datos insuficientes",
        description: "El reporte debe tener al menos un título y autor para ser exportado",
        duration: 5000,
      })
      return false
    }

    if (!report.sections || report.sections.length === 0) {
      toast({
        variant: "destructive",
        title: "Reporte vacío",
        description: "El reporte debe tener al menos una sección con contenido",
        duration: 5000,
      })
      return false
    }

    return true
  }

  // Función para convertir SavedReport a ReportData
  const convertToReportData = (report: SavedReport): ReportData => {
    // Función recursiva para procesar secciones y subsecciones
    const processSections = (sections: any[]): any[] => {
      return sections.map((section, index) => {
        const processedSection = {
          id: section.id || `section-${index}`,
          title: section.title || `Sección ${index + 1}`,
          content: section.content || section.text || "Contenido de la sección",
          type: section.type || "text",
          data: section.data,
        }

        // Preservar subsecciones si existen
        if (section.subsections && Array.isArray(section.subsections) && section.subsections.length > 0) {
          processedSection.subsections = processSections(section.subsections)
        }

        // También verificar otras propiedades que podrían contener subsecciones
        if (section.children && Array.isArray(section.children) && section.children.length > 0) {
          processedSection.subsections = processSections(section.children)
        }

        if (section.elements && Array.isArray(section.elements) && section.elements.length > 0) {
          processedSection.elements = section.elements
        }

        return processedSection
      })
    }

    return {
      id: report.id,
      title: report.title,
      subtitle: `Informe de ${report.department}`,
      author: report.author,
      department: report.department,
      createdAt: report.createdAt,
      updatedAt: report.lastEdited,
      sections: processSections(report.sections || []),
      tables: report.sections
        .filter((section) => section.type === "table" && section.data)
        .map((section, index) => ({
          id: `table-${index}`,
          title: section.title || `Tabla ${index + 1}`,
          headers: section.data?.headers || ["Columna 1", "Columna 2"],
          rows: section.data?.rows || [["Dato 1", "Dato 2"]],
          summary: section.data?.summary,
        })),
      charts: report.sections
        .filter((section) => section.type === "chart" && section.data)
        .map((section, index) => ({
          id: `chart-${index}`,
          title: section.title || `Gráfico ${index + 1}`,
          type: section.data?.type || "bar",
          data: section.data?.data || [],
          description: section.data?.description,
        })),
      metadata: {
        status: report.status,
        version: "1.0",
      },
    }
  }

  const handleExport = async (report: SavedReport, format: "pdf" | "word") => {
    // Validar datos antes de exportar
    if (!validateReportData(report)) {
      return
    }

    setIsExporting(report.id)

    try {
      toast({
        title: "Iniciando exportación",
        description: `Preparando ${report.title} en formato ${format.toUpperCase()}...`,
        duration: 3000,
      })

      // Convertir el reporte al formato necesario
      const reportData = convertToReportData(report)

      // Función de progreso
      const onProgress = (progress: number, message: string) => {
        console.log(`Progreso: ${progress}% - ${message}`)
        if (progress === 100) {
          toast({
            title: "¡Exportación completada!",
            description: `${report.title} se ha exportado exitosamente`,
            duration: 3000,
          })
        }
      }

      // Exportar el reporte usando la plantilla institucional
      const { blob, filename } = await exportReport(reportData, format, institutionalTemplate, onProgress)

      // Descargar el archivo
      downloadBlob(blob, filename)

      toast({
        title: "¡Descarga iniciada!",
        description: `${filename} se está descargando`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        variant: "destructive",
        title: "Error en la exportación",
        description: error instanceof Error ? error.message : "Hubo un problema al exportar el informe",
        duration: 5000,
      })
    } finally {
      setIsExporting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completado: { label: "Completado", variant: "default" as const },
      borrador: { label: "Borrador", variant: "secondary" as const },
      en_revision: { label: "En Revisión", variant: "outline" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.borrador
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <StaffSidebar activeItem="export" />
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Exportar Informes</h1>
              <p className="text-gray-500">Exporte sus informes en diferentes formatos (PDF, Word, Excel)</p>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando informes...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <StaffSidebar activeItem="export" />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Exportar Informes</h1>
            <p className="text-gray-500">Exporte sus informes en diferentes formatos (PDF, Word, Excel)</p>
          </div>

          {savedReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay informes disponibles</h3>
                <p className="text-gray-500 text-center mb-4">
                  No se encontraron informes guardados para exportar. Cree un informe primero.
                </p>
                <Button onClick={() => (window.location.href = "/staff/reports")}>Crear Nuevo Informe</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {report.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {report.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Editado: {report.lastEdited}
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(report.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {report.sections.length} sección{report.sections.length !== 1 ? "es" : ""} • Creado:{" "}
                        {report.createdAt}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report, "pdf")}
                          disabled={isExporting === report.id}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          {isExporting === report.id ? "Exportando..." : "PDF"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report, "word")}
                          disabled={isExporting === report.id}
                          className="gap-2"
                        >
                          <File className="h-4 w-4" />
                          {isExporting === report.id ? "Exportando..." : "Word"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
