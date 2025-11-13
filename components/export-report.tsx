 "use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportReport, downloadBlob, type ReportData, type ExportTemplate } from "@/utils/report-export"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Download } from "lucide-react"

interface ExportReportProps {
  reportData: ReportData
  templates?: ExportTemplate[]
  onExportComplete?: (format: string) => void
}

export function ExportReport({ reportData, templates = [], onExportComplete }: ExportReportProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "word" | "excel">("pdf")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0]?.id || "institutional")
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [exportComplete, setExportComplete] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setProgress(0)
      setStatusMessage("Iniciando exportación...")
      setError(null)
      setExportComplete(false)

      // Encontrar la plantilla seleccionada o usar la institucional por defecto
      const template = templates.find((t) => t.id === selectedTemplate) || undefined

      // Validar datos del reporte
      if (!reportData || !reportData.title) {
        throw new Error("Datos del reporte incompletos")
      }

      // Verificar si hay secciones vacías y añadir mensaje
      if (!reportData.sections || reportData.sections.length === 0) {
        throw new Error("El reporte no contiene secciones para exportar")
      }

      // Verificar si hay títulos muy largos y advertir
      const longTitles = reportData.sections.filter((s) => s.title && s.title.length > 80)
      if (longTitles.length > 0) {
        console.warn(
          "Hay títulos muy largos que podrían no mostrarse correctamente:",
          longTitles.map((s) => s.title).join(", "),
        )
      }

      // Función de progreso
      const updateProgress = (value: number, message: string) => {
        setProgress(value)
        setStatusMessage(message)
      }

      // Realizar la exportación
      console.log(`Exportando en formato ${selectedFormat} con plantilla ${selectedTemplate}`)
      const result = await exportReport(reportData, selectedFormat, template, updateProgress)

      // Descargar el archivo
      downloadBlob(result.blob, result.filename)

      // Marcar como completado
      setExportComplete(true)
      setStatusMessage(`Exportación completada: ${result.filename}`)

      // Notificar al componente padre
      if (onExportComplete) {
        onExportComplete(selectedFormat)
      }
    } catch (err) {
      console.error("Error en la exportación:", err)
      setError(`Error: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exportar Reporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="format-select" className="text-sm font-medium">
                Formato de Exportación
              </label>
              <Select
                value={selectedFormat}
                onValueChange={(value) => setSelectedFormat(value as any)}
                disabled={isExporting}
              >
                <SelectTrigger id="format-select" className="w-full">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Documento Portable)</SelectItem>
                  <SelectItem value="word">Word (Documento Editable)</SelectItem>
                  <SelectItem value="excel">Excel (Hoja de Cálculo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="template-select" className="text-sm font-medium">
                Plantilla de Documento
              </label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={isExporting || templates.length === 0}
              >
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="institutional">Formato Institucional</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{statusMessage}</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {exportComplete && !error && (
            <Alert>
              <AlertDescription className="text-green-600">{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
