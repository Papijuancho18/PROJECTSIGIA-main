"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExportConfigManager } from "./export-config-manager"
import { ExportProgressDialog } from "./export-progress-dialog"
import { exportTemplates, downloadBlob } from "@/utils/template-export"
import type { ExportTemplate, ExportOptions } from "@/utils/template-export"
import type { ExportConfiguration, ExportConfigTemplate } from "@/types/export-config"
import { Settings, CheckCircle, AlertTriangle, Download, Filter, Save } from "lucide-react"

// Plantillas de ejemplo
const exampleTemplates: ExportTemplate[] = [
  {
    id: "template-1",
    name: "Informe Académico Estándar",
    description: "Plantilla oficial para informes académicos",
    category: "académico",
    format: "pdf",
    styles: {},
    dependencies: ["logo.png", "header-bg.jpg"],
    thumbnail: "/academic-template.png",
  },
  {
    id: "template-2",
    name: "Reporte Ejecutivo",
    description: "Formato para presentaciones ejecutivas",
    category: "ejecutivo",
    format: "word",
    styles: {},
    dependencies: ["chart-styles.css"],
    thumbnail: "/executive-template.png",
  },
  {
    id: "template-3",
    name: "Análisis Estadístico",
    description: "Plantilla para informes estadísticos",
    category: "estadístico",
    format: "excel",
    styles: {},
    dependencies: [],
    thumbnail: "/stats-template.png",
  },
]

interface TemplateExportManagerProps {
  templates?: ExportTemplate[]
  onExportComplete?: (result: { success: boolean; filename?: string; error?: string }) => void
}

export function TemplateExportManager({ templates = exampleTemplates, onExportComplete }: TemplateExportManagerProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("select")
  const [showConfigManager, setShowConfigManager] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [exportProgress, setExportProgress] = useState({ progress: 0, message: "" })

  // Configuración de exportación actual
  const [exportConfig, setExportConfig] = useState<Partial<ExportConfiguration>>({
    format: "json",
    includeAssets: true,
    includeMetadata: true,
    compression: false,
    filters: {},
    formatOptions: {
      json: {
        prettyPrint: true,
        includeValidation: false,
      },
      zip: {
        compressionLevel: 6,
        includeReadme: true,
        folderStructure: "categorized",
      },
      package: {
        includeInstallScript: true,
        includeDocumentation: true,
        generateChecksums: true,
        compatibilityCheck: true,
      },
    },
    naming: {
      pattern: "plantillas-{format}-{date}",
      includeTimestamp: true,
      includeUserName: false,
    },
  })

  const [exportStatus, setExportStatus] = useState<{
    status: "idle" | "loading" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  // Filtrar plantillas según los filtros actuales
  const filteredTemplates = templates.filter((template) => {
    const filters = exportConfig.filters || {}

    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(template.category)) return false
    }

    if (filters.formats && filters.formats.length > 0) {
      if (!filters.formats.includes(template.format)) return false
    }

    return true
  })

  const handleSelectTemplate = (templateId: string, selected: boolean) => {
    setSelectedTemplates((prev) => (selected ? [...prev, templateId] : prev.filter((id) => id !== templateId)))
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedTemplates(selected ? filteredTemplates.map((t) => t.id) : [])
  }

  const handleApplyConfig = (configTemplate: ExportConfigTemplate) => {
    setExportConfig((prev) => ({
      ...prev,
      ...configTemplate.configuration,
    }))
    setShowConfigManager(false)
    setActiveTab("configure")
  }

  const handleConfigChange = (key: string, value: any) => {
    setExportConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFormatOptionChange = (format: string, key: string, value: any) => {
    setExportConfig((prev) => ({
      ...prev,
      formatOptions: {
        ...prev.formatOptions,
        [format]: {
          ...prev.formatOptions?.[format as keyof typeof prev.formatOptions],
          [key]: value,
        },
      },
    }))
  }

  const handleExport = async () => {
    if (selectedTemplates.length === 0) {
      setExportStatus({
        status: "error",
        message: "Debe seleccionar al menos una plantilla para exportar",
      })
      return
    }

    setShowProgressDialog(true)
    setExportStatus({ status: "loading" })

    try {
      const templatesToExport = templates.filter((t) => selectedTemplates.includes(t.id))

      const exportOptions: ExportOptions = {
        format: exportConfig.format as "json" | "zip" | "package",
        includeAssets: exportConfig.includeAssets || false,
        includeMetadata: exportConfig.includeMetadata || false,
        compression: exportConfig.compression || false,
      }

      const result = await exportTemplates(templatesToExport, exportOptions, (progress, message) => {
        setExportProgress({ progress, message })
      })

      downloadBlob(result.blob, result.filename)

      setExportStatus({
        status: "success",
        message: `Exportación completada: ${result.filename}`,
      })

      onExportComplete?.({ success: true, filename: result.filename })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setExportStatus({
        status: "error",
        message: errorMessage,
      })

      onExportComplete?.({ success: false, error: errorMessage })
    } finally {
      setShowProgressDialog(false)
      setTimeout(() => {
        setExportStatus({ status: "idle" })
      }, 5000)
    }
  }

  const categories = Array.from(new Set(templates.map((t) => t.category)))
  const formats = Array.from(new Set(templates.map((t) => t.format)))

  return (
    <>
      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Exportar Plantillas</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Seleccione plantillas y configure las opciones de exportación
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="gap-1" onClick={() => setShowConfigManager(true)}>
                <Settings className="h-4 w-4" />
                Configuraciones
              </Button>
              <Button variant="secondary" className="gap-1">
                <Save className="h-4 w-4" />
                Guardar Config
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="select" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Seleccionar</span>
              </TabsTrigger>
              <TabsTrigger value="configure" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurar</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-0">
              <div className="space-y-4">
                {/* Filtros */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categorías</Label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <Badge
                              key={category}
                              variant={exportConfig.filters?.categories?.includes(category) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const currentCategories = exportConfig.filters?.categories || []
                                const newCategories = currentCategories.includes(category)
                                  ? currentCategories.filter((c) => c !== category)
                                  : [...currentCategories, category]

                                handleConfigChange("filters", {
                                  ...exportConfig.filters,
                                  categories: newCategories,
                                })
                              }}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Formatos</Label>
                        <div className="flex flex-wrap gap-2">
                          {formats.map((format) => (
                            <Badge
                              key={format}
                              variant={exportConfig.filters?.formats?.includes(format) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const currentFormats = exportConfig.filters?.formats || []
                                const newFormats = currentFormats.includes(format)
                                  ? currentFormats.filter((f) => f !== format)
                                  : [...currentFormats, format]

                                handleConfigChange("filters", {
                                  ...exportConfig.filters,
                                  formats: newFormats,
                                })
                              }}
                            >
                              {format.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de plantillas */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Plantillas ({filteredTemplates.length} disponibles)</CardTitle>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <Label className="text-sm">Seleccionar todas</Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center space-x-3 p-2 rounded border hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedTemplates.includes(template.id)}
                            onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-gray-500">{template.description}</div>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.format.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="configure" className="mt-0">
              <div className="space-y-4">
                {/* Configuración básica */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Configuración Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="format">Formato de exportación</Label>
                        <Select
                          value={exportConfig.format}
                          onValueChange={(value) => handleConfigChange("format", value)}
                        >
                          <SelectTrigger id="format">
                            <SelectValue placeholder="Seleccionar formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON - Formato ligero</SelectItem>
                            <SelectItem value="zip">ZIP - Con recursos</SelectItem>
                            <SelectItem value="package">Package - Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="naming">Patrón de nomenclatura</Label>
                        <Input
                          id="naming"
                          value={exportConfig.naming?.pattern || ""}
                          onChange={(e) =>
                            handleConfigChange("naming", {
                              ...exportConfig.naming,
                              pattern: e.target.value,
                            })
                          }
                          placeholder="plantillas-{format}-{date}"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeAssets">Incluir recursos</Label>
                        <Switch
                          id="includeAssets"
                          checked={exportConfig.includeAssets}
                          onCheckedChange={(checked) => handleConfigChange("includeAssets", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeMetadata">Incluir metadatos</Label>
                        <Switch
                          id="includeMetadata"
                          checked={exportConfig.includeMetadata}
                          onCheckedChange={(checked) => handleConfigChange("includeMetadata", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compression">Compresión</Label>
                        <Switch
                          id="compression"
                          checked={exportConfig.compression}
                          onCheckedChange={(checked) => handleConfigChange("compression", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opciones específicas por formato */}
                {exportConfig.format && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Opciones de {exportConfig.format?.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {exportConfig.format === "json" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label>Formato legible</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.json?.prettyPrint}
                              onCheckedChange={(checked) => handleFormatOptionChange("json", "prettyPrint", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Incluir validación</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.json?.includeValidation}
                              onCheckedChange={(checked) =>
                                handleFormatOptionChange("json", "includeValidation", checked)
                              }
                            />
                          </div>
                        </div>
                      )}

                      {exportConfig.format === "zip" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nivel de compresión</Label>
                              <Select
                                value={exportConfig.formatOptions?.zip?.compressionLevel?.toString()}
                                onValueChange={(value) =>
                                  handleFormatOptionChange("zip", "compressionLevel", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Sin compresión</SelectItem>
                                  <SelectItem value="3">Baja</SelectItem>
                                  <SelectItem value="6">Media</SelectItem>
                                  <SelectItem value="9">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Estructura de carpetas</Label>
                              <Select
                                value={exportConfig.formatOptions?.zip?.folderStructure}
                                onValueChange={(value) => handleFormatOptionChange("zip", "folderStructure", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="flat">Plana</SelectItem>
                                  <SelectItem value="categorized">Por categorías</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Incluir README</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.zip?.includeReadme}
                              onCheckedChange={(checked) => handleFormatOptionChange("zip", "includeReadme", checked)}
                            />
                          </div>
                        </div>
                      )}

                      {exportConfig.format === "package" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label>Script de instalación</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.package?.includeInstallScript}
                              onCheckedChange={(checked) =>
                                handleFormatOptionChange("package", "includeInstallScript", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Documentación</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.package?.includeDocumentation}
                              onCheckedChange={(checked) =>
                                handleFormatOptionChange("package", "includeDocumentation", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Generar checksums</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.package?.generateChecksums}
                              onCheckedChange={(checked) =>
                                handleFormatOptionChange("package", "generateChecksums", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Verificar compatibilidad</Label>
                            <Switch
                              checked={exportConfig.formatOptions?.package?.compatibilityCheck}
                              onCheckedChange={(checked) =>
                                handleFormatOptionChange("package", "compatibilityCheck", checked)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <div className="space-y-4">
                {/* Resumen de exportación */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumen de Exportación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Plantillas seleccionadas</Label>
                        <p className="text-2xl font-bold text-primary">{selectedTemplates.length}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Formato</Label>
                        <p className="text-lg font-medium">{exportConfig.format?.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Incluye recursos</Label>
                        <p className="text-lg">{exportConfig.includeAssets ? "Sí" : "No"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Compresión</Label>
                        <p className="text-lg">{exportConfig.compression ? "Habilitada" : "Deshabilitada"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botón de exportación */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={handleExport}
                    disabled={selectedTemplates.length === 0 || exportStatus.status === "loading"}
                  >
                    <Download className="h-5 w-5" />
                    {exportStatus.status === "loading" ? "Exportando..." : "Exportar Plantillas"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Alertas de estado */}
          {exportStatus.status === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Exportación exitosa</AlertTitle>
              <AlertDescription>{exportStatus.message}</AlertDescription>
            </Alert>
          )}

          {exportStatus.status === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error en la exportación</AlertTitle>
              <AlertDescription>{exportStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Diálogo del gestor de configuraciones */}
      {showConfigManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Configuraciones de Exportación</h2>
              <Button variant="ghost" onClick={() => setShowConfigManager(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <ExportConfigManager
                onSelectConfig={handleApplyConfig}
                currentConfig={exportConfig}
                onSaveConfig={(config) => {
                  // Aquí se guardaría la configuración
                  console.log("Saving config:", config)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de progreso */}
      <ExportProgressDialog
        open={showProgressDialog}
        progress={exportProgress.progress}
        message={exportProgress.message}
        onCancel={() => setShowProgressDialog(false)}
      />
    </>
  )
}
