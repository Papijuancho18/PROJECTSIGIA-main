"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Package,
  Archive,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react"

interface ImportedTemplate {
  id: string
  name: string
  description: string
  category: string
  format: string
  size: string
  conflicts?: boolean
  existingTemplate?: any
  valid: boolean
  errors?: string[]
  warnings?: string[]
}

interface ImportResult {
  success: number
  failed: number
  skipped: number
  details: string[]
}

export function TemplateImportManager() {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importedTemplates, setImportedTemplates] = useState<ImportedTemplate[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [conflictResolution, setConflictResolution] = useState<"skip" | "overwrite" | "rename">("rename")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<{
    status: "idle" | "analyzing" | "success" | "error"
    message?: string
    result?: ImportResult
  }>({ status: "idle" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      analyzeImportFile(file)
    }
  }

  const analyzeImportFile = async (file: File) => {
    setImportStatus({ status: "analyzing", message: "Analizando archivo..." })
    setImportedTemplates([])
    setSelectedTemplates([])

    try {
      const content = await file.text()
      let data

      try {
        data = JSON.parse(content)
      } catch {
        throw new Error("El archivo no es un JSON válido")
      }

      // Validar estructura del archivo
      if (!data.templates || !Array.isArray(data.templates)) {
        throw new Error("El archivo no contiene plantillas válidas")
      }

      // Simular plantillas existentes para detectar conflictos
      const existingTemplateIds = ["user-template-1", "shared-template-1"]

      // Procesar plantillas importadas
      const processedTemplates: ImportedTemplate[] = data.templates.map((template: any) => {
        const errors: string[] = []
        const warnings: string[] = []

        // Validaciones básicas
        if (!template.name) errors.push("Falta el nombre de la plantilla")
        if (!template.description) warnings.push("Falta la descripción")
        if (!template.styles) errors.push("Faltan los estilos de la plantilla")

        // Detectar conflictos
        const conflicts = existingTemplateIds.includes(template.id)
        if (conflicts) {
          warnings.push("Ya existe una plantilla con este ID")
        }

        return {
          id: template.id,
          name: template.name || "Sin nombre",
          description: template.description || "Sin descripción",
          category: template.category || "sin categoría",
          format: template.format || "pdf",
          size: "2.1 KB", // Simulado
          conflicts,
          valid: errors.length === 0,
          errors,
          warnings,
        }
      })

      setImportedTemplates(processedTemplates)
      setSelectedTemplates(processedTemplates.filter((t) => t.valid).map((t) => t.id))
      setImportStatus({
        status: "idle",
        message: `Se encontraron ${processedTemplates.length} plantilla(s) en el archivo`,
      })
    } catch (error) {
      setImportStatus({
        status: "error",
        message: `Error al analizar el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    }
  }

  const handleImport = async () => {
    if (selectedTemplates.length === 0) {
      setImportStatus({
        status: "error",
        message: "Debe seleccionar al menos una plantilla para importar",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportStatus({ status: "idle" })

    try {
      const templatesToImport = importedTemplates.filter((t) => selectedTemplates.includes(t.id))
      let success = 0
      let failed = 0
      let skipped = 0
      const details: string[] = []

      for (let i = 0; i < templatesToImport.length; i++) {
        const template = templatesToImport[i]
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular procesamiento

        if (!template.valid) {
          failed++
          details.push(`❌ ${template.name}: ${template.errors?.join(", ")}`)
        } else if (template.conflicts && conflictResolution === "skip") {
          skipped++
          details.push(`⏭️ ${template.name}: Omitida por conflicto`)
        } else {
          success++
          const action = template.conflicts
            ? conflictResolution === "overwrite"
              ? "sobrescrita"
              : "renombrada"
            : "importada"
          details.push(`✅ ${template.name}: ${action} exitosamente`)
        }

        setImportProgress(((i + 1) / templatesToImport.length) * 100)
      }

      setImportStatus({
        status: "success",
        message: "Importación completada",
        result: { success, failed, skipped, details },
      })
    } catch (error) {
      setImportStatus({
        status: "error",
        message: `Error durante la importación: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(importedTemplates.filter((t) => t.valid).map((t) => t.id))
    } else {
      setSelectedTemplates([])
    }
  }

  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates((prev) => [...prev, templateId])
    } else {
      setSelectedTemplates((prev) => prev.filter((id) => id !== templateId))
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "word":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      default:
        return <FileUp className="h-4 w-4" />
    }
  }

  const getConflictResolutionDescription = (resolution: string) => {
    switch (resolution) {
      case "skip":
        return "Las plantillas con conflictos serán omitidas"
      case "overwrite":
        return "Las plantillas existentes serán sobrescritas"
      case "rename":
        return "Las plantillas conflictivas serán renombradas automáticamente"
      default:
        return ""
    }
  }

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Plantillas
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Importe plantillas desde archivos de otros sistemas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
            <TabsTrigger value="preview" disabled={importedTemplates.length === 0}>
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="conflicts" disabled={importedTemplates.length === 0}>
              Conflictos
            </TabsTrigger>
            <TabsTrigger value="import" disabled={importedTemplates.length === 0}>
              Importar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Seleccionar archivo de plantillas</h3>
                  <p className="text-gray-500">Soporta archivos JSON, ZIP y paquetes de plantillas</p>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                    <FileUp className="h-4 w-4" />
                    Seleccionar archivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.zip,.template"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {importFile && (
                    <p className="text-sm text-gray-600">
                      Archivo seleccionado: <span className="font-medium">{importFile.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-gray-600">Formato estándar</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                <Archive className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">ZIP</div>
                  <div className="text-gray-600">Con recursos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded">
                <Package className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium">Paquete</div>
                  <div className="text-gray-600">Formato completo</div>
                </div>
              </div>
            </div>

            {importStatus.status === "analyzing" && (
              <Alert className="bg-blue-50 border-blue-200">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <AlertTitle>Analizando archivo</AlertTitle>
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}

            {importStatus.status === "error" && (
              <Alert className="bg-red-50 border-red-200" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}

            {importedTemplates.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Archivo analizado exitosamente</AlertTitle>
                <AlertDescription>
                  Se encontraron {importedTemplates.length} plantilla(s). Continúe a la vista previa para revisar.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Plantillas encontradas</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-import"
                  checked={selectedTemplates.length === importedTemplates.filter((t) => t.valid).length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all-import" className="text-sm font-medium">
                  Seleccionar válidas ({importedTemplates.filter((t) => t.valid).length})
                </label>
              </div>
            </div>

            <div className="space-y-2">
              {importedTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedTemplates.includes(template.id)
                      ? "border-primary bg-primary/5"
                      : template.valid
                        ? "border-gray-200 hover:border-primary/50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={template.id}
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                      disabled={!template.valid}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getFormatIcon(template.format)}
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                        {template.conflicts && (
                          <Badge variant="destructive" className="text-xs">
                            Conflicto
                          </Badge>
                        )}
                        {!template.valid && (
                          <Badge variant="destructive" className="text-xs">
                            Inválida
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Tamaño: {template.size}</span>
                        <span className="capitalize">Formato: {template.format}</span>
                      </div>

                      {template.errors && template.errors.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                          <div className="flex items-center gap-1 text-red-700 text-xs font-medium mb-1">
                            <AlertCircle className="h-3 w-3" />
                            Errores:
                          </div>
                          <ul className="text-xs text-red-600 space-y-1">
                            {template.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {template.warnings && template.warnings.length > 0 && (
                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                          <div className="flex items-center gap-1 text-amber-700 text-xs font-medium mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Advertencias:
                          </div>
                          <ul className="text-xs text-amber-600 space-y-1">
                            {template.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 bg-green-50 rounded">
                <div className="font-medium text-green-700">
                  {importedTemplates.filter((t) => t.valid && !t.conflicts).length}
                </div>
                <div className="text-green-600">Válidas</div>
              </div>
              <div className="p-3 bg-amber-50 rounded">
                <div className="font-medium text-amber-700">{importedTemplates.filter((t) => t.conflicts).length}</div>
                <div className="text-amber-600">Con conflictos</div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="font-medium text-red-700">{importedTemplates.filter((t) => !t.valid).length}</div>
                <div className="text-red-600">Inválidas</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resolución de conflictos</h3>
              <p className="text-gray-600">
                Se encontraron {importedTemplates.filter((t) => t.conflicts).length} plantilla(s) con conflictos.
                Seleccione cómo manejarlos:
              </p>

              <RadioGroup value={conflictResolution} onValueChange={(value: any) => setConflictResolution(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip" className="flex-1">
                      <div className="font-medium">Omitir plantillas conflictivas</div>
                      <div className="text-sm text-gray-500">No importar plantillas que ya existen</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="flex-1">
                      <div className="font-medium">Sobrescribir plantillas existentes</div>
                      <div className="text-sm text-gray-500">Reemplazar las plantillas existentes</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="rename" id="rename" />
                    <Label htmlFor="rename" className="flex-1">
                      <div className="font-medium">Renombrar automáticamente</div>
                      <div className="text-sm text-gray-500">Añadir sufijo a las plantillas conflictivas</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Estrategia seleccionada</AlertTitle>
                <AlertDescription>{getConflictResolutionDescription(conflictResolution)}</AlertDescription>
              </Alert>
            </div>

            {importedTemplates.filter((t) => t.conflicts).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Plantillas con conflictos:</h4>
                {importedTemplates
                  .filter((t) => t.conflicts)
                  .map((template) => (
                    <div key={template.id} className="p-3 border border-amber-200 bg-amber-50 rounded">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(template.format)}
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          ID: {template.id}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Resumen de Importación</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">Seleccionadas</div>
                    <div className="text-gray-600">{selectedTemplates.length}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">Con conflictos</div>
                    <div className="text-gray-600">
                      {importedTemplates.filter((t) => t.conflicts && selectedTemplates.includes(t.id)).length}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">Resolución</div>
                    <div className="text-gray-600 capitalize">{conflictResolution}</div>
                  </div>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-sm text-gray-600">Importando plantillas... {Math.round(importProgress)}%</p>
                </div>
              )}

              {importStatus.status === "success" && importStatus.result && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Importación completada</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>✅ Exitosas: {importStatus.result.success}</div>
                      <div>⏭️ Omitidas: {importStatus.result.skipped}</div>
                      <div>❌ Fallidas: {importStatus.result.failed}</div>
                    </div>
                    <details className="text-left">
                      <summary className="cursor-pointer font-medium">Ver detalles</summary>
                      <div className="mt-2 space-y-1 text-xs">
                        {importStatus.result.details.map((detail, index) => (
                          <div key={index}>{detail}</div>
                        ))}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {importStatus.status === "error" && (
                <Alert className="bg-red-50 border-red-200" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error en la importación</AlertTitle>
                  <AlertDescription>{importStatus.message}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                disabled={isImporting || selectedTemplates.length === 0}
                className="w-full"
                size="lg"
              >
                {isImporting ? (
                  "Importando..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {selectedTemplates.length} plantilla(s)
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
