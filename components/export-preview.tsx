"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { exportReport, downloadBlob, type ReportData } from "@/utils/report-export"
import type { ExportTemplate } from "./export-template-selector"
import {
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileIcon as FilePdf,
} from "lucide-react"

interface ExportPreviewProps {
  template: ExportTemplate
  reportData: ReportData
  onExport: (format: string) => void
}

export function ExportPreview({ template, reportData, onExport }: ExportPreviewProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ progress: 0, message: "" })
  const [exportStatus, setExportStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
    filename?: string
  }>({ status: "idle" })

  const handleExport = async (format: "pdf" | "word" | "excel") => {
    setIsExporting(true)
    setExportStatus({ status: "idle" })
    setExportProgress({ progress: 0, message: "Iniciando exportación..." })

    try {
      const result = await exportReport(reportData, format, template, (progress, message) => {
        setExportProgress({ progress, message })
      })

      downloadBlob(result.blob, result.filename)

      setExportStatus({
        status: "success",
        message: `Reporte exportado exitosamente`,
        filename: result.filename,
      })

      // Llamar al callback del componente padre
      onExport(format)
    } catch (error) {
      setExportStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido durante la exportación",
      })
    } finally {
      setIsExporting(false)
      setTimeout(() => {
        setExportProgress({ progress: 0, message: "" })
      }, 2000)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "word":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "pdf":
        return "Documento PDF con formato profesional, ideal para presentaciones y archivo"
      case "word":
        return "Documento Word editable, perfecto para colaboración y modificaciones"
      case "excel":
        return "Libro Excel con datos estructurados, óptimo para análisis y manipulación de datos"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Vista previa de la plantilla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa del Documento
          </CardTitle>
          <CardDescription>
            Configuración aplicada: {template.name} - {template.format.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            {/* Simulación de vista previa */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h1
                  className="text-2xl font-bold mb-2"
                  style={{ color: template.styles.primaryColor, fontFamily: template.styles.fontFamily }}
                >
                  {reportData.title}
                </h1>
                {reportData.subtitle && <h2 className="text-lg text-gray-600 mb-2">{reportData.subtitle}</h2>}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Autor: {reportData.author}</p>
                  <p>Departamento: {reportData.department}</p>
                  <p>Fecha: {new Date(reportData.createdAt).toLocaleDateString("es-ES")}</p>
                </div>
              </div>

              {template.styles.includeTableOfContents && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: template.styles.primaryColor }}>
                    Tabla de Contenidos
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {reportData.sections.map((section, index) => (
                      <li key={section.id} className="flex justify-between">
                        <span>
                          {index + 1}. {section.title}
                        </span>
                        <span className="text-gray-400">...</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                {reportData.sections.slice(0, 2).map((section, index) => (
                  <div key={section.id}>
                    <h3 className="text-base font-semibold mb-2" style={{ color: template.styles.primaryColor }}>
                      {index + 1}. {section.title}
                    </h3>
                    <p className="text-sm text-gray-700 line-clamp-3">{section.content.substring(0, 200)}...</p>
                  </div>
                ))}
                {reportData.sections.length > 2 && (
                  <p className="text-sm text-gray-500 italic">... y {reportData.sections.length - 2} sección(es) más</p>
                )}
              </div>

              {template.styles.includePageNumbers && (
                <div className="text-right text-xs text-gray-400 border-t pt-2">
                  Página 1 de {Math.ceil(reportData.sections.length / 3)}
                </div>
              )}
            </div>
          </div>

          {/* Información de la plantilla */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Fuente:</span> {template.styles.fontFamily}
            </div>
            <div>
              <span className="font-medium">Orientación:</span> {template.styles.orientation}
            </div>
            <div>
              <span className="font-medium">Estilo de encabezado:</span> {template.styles.headerStyle}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opciones de exportación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Opciones de Exportación
          </CardTitle>
          <CardDescription>Seleccione el formato de exportación deseado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getFormatIcon("pdf")}
                  <div>
                    <h4 className="font-medium">PDF</h4>
                    <Badge variant="outline" className="text-xs">
                      Recomendado
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{getFormatDescription("pdf")}</p>
                <Button onClick={() => handleExport("pdf")} disabled={isExporting} className="w-full" variant="outline">
                  {isExporting ? "Exportando..." : "Exportar PDF"}
                </Button>
              </CardContent>
            </Card>

            {/* Word */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getFormatIcon("word")}
                  <div>
                    <h4 className="font-medium">Word</h4>
                    <Badge variant="outline" className="text-xs">
                      Editable
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{getFormatDescription("word")}</p>
                <Button
                  onClick={() => handleExport("word")}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  {isExporting ? "Exportando..." : "Exportar Word"}
                </Button>
              </CardContent>
            </Card>

            {/* Excel */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getFormatIcon("excel")}
                  <div>
                    <h4 className="font-medium">Excel</h4>
                    <Badge variant="outline" className="text-xs">
                      Datos
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{getFormatDescription("excel")}</p>
                <Button
                  onClick={() => handleExport("excel")}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  {isExporting ? "Exportando..." : "Exportar Excel"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Progreso de exportación */}
      {isExporting && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Exportando documento...</span>
              </div>
              <Progress value={exportProgress.progress} className="w-full" />
              <p className="text-xs text-gray-600">{exportProgress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de exportación */}
      {exportStatus.status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Exportación exitosa</AlertTitle>
          <AlertDescription>
            {exportStatus.message}
            {exportStatus.filename && <span className="block mt-1 text-sm font-mono">{exportStatus.filename}</span>}
          </AlertDescription>
        </Alert>
      )}

      {exportStatus.status === "error" && (
        <Alert className="bg-red-50 border-red-200" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error en la exportación</AlertTitle>
          <AlertDescription>{exportStatus.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
