"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ExportPreview } from "./export-preview"
import type { ExportTemplate } from "./export-template-selector"
import {
  Save,
  FileDown,
  Paintbrush,
  Type,
  Layout,
  Copy,
  Share2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ImageIcon,
  Upload,
} from "lucide-react"

// Plantilla inicial por defecto
const defaultTemplate: ExportTemplate = {
  id: "",
  name: "Nueva Plantilla",
  description: "Descripción de la plantilla",
  category: "personalizada",
  thumbnail: "/custom-template.png",
  format: "pdf",
  styles: {
    fontFamily: "Arial",
    primaryColor: "#3E63DD",
    secondaryColor: "#6E56CF",
    headerStyle: "left-aligned",
    includePageNumbers: true,
    includeTableOfContents: false,
    orientation: "portrait",
  },
}

// Datos de ejemplo para la previsualización
const sampleReportData = {
  title: "Título del Informe de Ejemplo",
  subtitle: "Subtítulo del informe - Período académico",
  sections: [
    {
      title: "Introducción",
      content: "Este es un ejemplo de contenido para la previsualización de la plantilla...",
    },
  ],
}

interface TemplateCreatorProps {
  initialTemplate?: ExportTemplate
  isEditing?: boolean
  onSave: (template: ExportTemplate) => Promise<void>
  onCancel: () => void
}

export function TemplateCreator({
  initialTemplate = defaultTemplate,
  isEditing = false,
  onSave,
  onCancel,
}: TemplateCreatorProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<ExportTemplate>({
    ...initialTemplate,
    id: initialTemplate.id || `template-${Date.now()}`,
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  const handleBasicInfoChange = (field: string, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStyleChange = (field: string, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus({ status: "idle" })

    try {
      await onSave(template)
      setSaveStatus({
        status: "success",
        message: `Plantilla ${isEditing ? "actualizada" : "creada"} exitosamente`,
      })
      // Resetear después de 2 segundos
      setTimeout(() => {
        setSaveStatus({ status: "idle" })
      }, 2000)
    } catch (error) {
      setSaveStatus({
        status: "error",
        message: `Error al ${isEditing ? "actualizar" : "crear"} la plantilla: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      })
    } finally {
      setSaving(false)
    }
  }

  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Calibri", label: "Calibri" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
  ]

  const headerStyles = [
    { value: "centered", label: "Centrado" },
    { value: "left-aligned", label: "Alineado a la izquierda" },
    { value: "numbered", label: "Numerado" },
    { value: "underlined", label: "Subrayado" },
    { value: "boxed", label: "Con recuadro" },
  ]

  const categories = [
    { value: "académico", label: "Académico" },
    { value: "ejecutivo", label: "Ejecutivo" },
    { value: "investigación", label: "Investigación" },
    { value: "estadístico", label: "Estadístico" },
    { value: "evaluación", label: "Evaluación" },
    { value: "digital", label: "Digital" },
    { value: "personalizada", label: "Personalizada" },
  ]

  const formats = [
    { value: "pdf", label: "PDF" },
    { value: "word", label: "Word" },
    { value: "excel", label: "Excel" },
    { value: "html", label: "HTML" },
  ]

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle>{isEditing ? "Editar Plantilla" : "Crear Nueva Plantilla"}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {isEditing
              ? "Modifique los detalles de su plantilla existente"
              : "Diseñe una plantilla personalizada para sus reportes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                <span>Información Básica</span>
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span>Tipografía</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <span>Colores</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Diseño</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la plantilla</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                    placeholder="Ingrese un nombre descriptivo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                    placeholder="Describa el propósito y características de esta plantilla"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={template.category}
                      onValueChange={(value) => handleBasicInfoChange("category", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Formato</Label>
                    <Select
                      value={template.format}
                      onValueChange={(value: any) => handleBasicInfoChange("format", value)}
                    >
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Seleccionar formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Miniatura</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={template.thumbnail || "/placeholder.svg"}
                        alt="Miniatura de la plantilla"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="thumbnail"
                        value={template.thumbnail}
                        onChange={(e) => handleBasicInfoChange("thumbnail", e.target.value)}
                        placeholder="URL de la imagen de miniatura"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" className="gap-1">
                          <Upload className="h-4 w-4" />
                          Subir imagen
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="gap-1">
                          <ImageIcon className="h-4 w-4" />
                          Generar miniatura
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Fuente principal</Label>
                  <Select
                    value={template.styles.fontFamily}
                    onValueChange={(value) => handleStyleChange("fontFamily", value)}
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headerStyle">Estilo de encabezados</Label>
                  <RadioGroup
                    value={template.styles.headerStyle}
                    onValueChange={(value) => handleStyleChange("headerStyle", value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    {headerStyles.map((style) => (
                      <div key={style.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={style.value} id={`header-style-${style.value}`} />
                        <Label htmlFor={`header-style-${style.value}`}>{style.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeTableOfContents">Incluir tabla de contenidos</Label>
                    <Switch
                      id="includeTableOfContents"
                      checked={template.styles.includeTableOfContents}
                      onCheckedChange={(checked) => handleStyleChange("includeTableOfContents", checked)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Añade automáticamente una tabla de contenidos al inicio del documento
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={template.styles.primaryColor}
                      onChange={(e) => handleStyleChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={template.styles.primaryColor}
                      onChange={(e) => handleStyleChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Se utiliza para encabezados, títulos y elementos destacados</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={template.styles.secondaryColor}
                      onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={template.styles.secondaryColor}
                      onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Se utiliza para acentos, bordes y elementos secundarios</p>
                </div>

                <div className="p-4 rounded-md" style={{ backgroundColor: `${template.styles.primaryColor}10` }}>
                  <h3 className="text-base font-medium mb-2" style={{ color: template.styles.primaryColor }}>
                    Vista previa de colores
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: template.styles.primaryColor }}
                    >
                      Primario
                    </div>
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: template.styles.secondaryColor }}
                    >
                      Secundario
                    </div>
                    <div
                      className="w-16 h-16 rounded-md border flex items-center justify-center"
                      style={{ borderColor: template.styles.primaryColor, color: template.styles.primaryColor }}
                    >
                      Borde
                    </div>
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${template.styles.secondaryColor}20` }}
                    >
                      Fondo
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Orientación</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border-2 rounded-md p-4 flex items-center justify-center cursor-pointer transition-all ${
                        template.styles.orientation === "portrait"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                      onClick={() => handleStyleChange("orientation", "portrait")}
                    >
                      <div className="w-16 h-24 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                        Vertical
                      </div>
                    </div>
                    <div
                      className={`border-2 rounded-md p-4 flex items-center justify-center cursor-pointer transition-all ${
                        template.styles.orientation === "landscape"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                      onClick={() => handleStyleChange("orientation", "landscape")}
                    >
                      <div className="w-24 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                        Horizontal
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includePageNumbers">Incluir números de página</Label>
                    <Switch
                      id="includePageNumbers"
                      checked={template.styles.includePageNumbers}
                      onCheckedChange={(checked) => handleStyleChange("includePageNumbers", checked)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Añade numeración automática en el pie de página</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Vista previa */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Vista previa de la plantilla</h3>
            <ExportPreview template={template} reportData={sampleReportData} onExport={() => {}} />
          </div>

          {/* Alertas de estado */}
          {saveStatus.status === "success" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Operación exitosa</h4>
                <p className="text-green-700">{saveStatus.message}</p>
              </div>
            </div>
          )}

          {saveStatus.status === "error" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-700">{saveStatus.message}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between p-4 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {isEditing && (
              <Button variant="outline" className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button variant="outline" className="gap-1">
              <Copy className="h-4 w-4" />
              Duplicar
            </Button>
            <Button variant="outline" className="gap-1">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
            <Button className="gap-1" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar plantilla"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
