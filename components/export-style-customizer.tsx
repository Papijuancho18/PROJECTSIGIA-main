"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Paintbrush, Type, Layout, FileDown, Undo } from "lucide-react"
import type { ExportTemplate } from "./export-template-selector"

interface ExportStyleCustomizerProps {
  template: ExportTemplate
  onStyleChange: (updatedTemplate: ExportTemplate) => void
  onReset: () => void
}

export function ExportStyleCustomizer({ template, onStyleChange, onReset }: ExportStyleCustomizerProps) {
  const [currentTemplate, setCurrentTemplate] = useState<ExportTemplate>({
    ...template,
    styles: {
      ...template.styles,
      fontFamily: "Calibri",
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
      headerStyle: "bold-uppercase",
      textAlignment: "justified",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait",
    },
  })

  const handleStyleChange = (key: string, value: any) => {
    const updatedTemplate = {
      ...currentTemplate,
      styles: {
        ...currentTemplate.styles,
        [key]: value,
      },
    }
    setCurrentTemplate(updatedTemplate)
    onStyleChange(updatedTemplate)
  }

  const fontFamilies = [
    { value: "Calibri", label: "Calibri" },
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
  ]

  const headerStyles = [
    { value: "bold-uppercase", label: "Negrita y mayúsculas" },
    { value: "bold", label: "Solo negrita" },
    { value: "centered", label: "Centrado" },
    { value: "left-aligned", label: "Alineado a la izquierda" },
    { value: "numbered", label: "Numerado" },
  ]

  return (
    <Card className="w-full shadow-md border-primary/20">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle>Personalizar Estilo</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Ajuste los estilos de la plantilla seleccionada
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="typography" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
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

          <TabsContent value="typography" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Fuente principal</Label>
                <Select
                  value={currentTemplate.styles.fontFamily}
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
                <Select
                  value={currentTemplate.styles.headerStyle}
                  onValueChange={(value) => handleStyleChange("headerStyle", value)}
                >
                  <SelectTrigger id="headerStyle">
                    <SelectValue placeholder="Seleccionar estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {headerStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeTableOfContents">Incluir tabla de contenidos</Label>
                  <Switch
                    id="includeTableOfContents"
                    checked={currentTemplate.styles.includeTableOfContents}
                    onCheckedChange={(checked) => handleStyleChange("includeTableOfContents", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="fontSize">Tamaños de fuente</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="titleSize" className="text-xs">
                    Título principal
                  </Label>
                  <Input
                    id="titleSize"
                    type="number"
                    min="10"
                    max="24"
                    value={currentTemplate.styles.fontSize?.title || 18}
                    onChange={(e) =>
                      handleStyleChange("fontSize", {
                        ...currentTemplate.styles.fontSize,
                        title: Number.parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="headingSize" className="text-xs">
                    Encabezados
                  </Label>
                  <Input
                    id="headingSize"
                    type="number"
                    min="10"
                    max="20"
                    value={currentTemplate.styles.fontSize?.heading || 14}
                    onChange={(e) =>
                      handleStyleChange("fontSize", {
                        ...currentTemplate.styles.fontSize,
                        heading: Number.parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bodySize" className="text-xs">
                    Cuerpo de texto
                  </Label>
                  <Input
                    id="bodySize"
                    type="number"
                    min="8"
                    max="16"
                    value={currentTemplate.styles.fontSize?.body || 11}
                    onChange={(e) =>
                      handleStyleChange("fontSize", {
                        ...currentTemplate.styles.fontSize,
                        body: Number.parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tableSize" className="text-xs">
                    Tablas
                  </Label>
                  <Input
                    id="tableSize"
                    type="number"
                    min="8"
                    max="14"
                    value={currentTemplate.styles.fontSize?.table || 10}
                    onChange={(e) =>
                      handleStyleChange("fontSize", {
                        ...currentTemplate.styles.fontSize,
                        table: Number.parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
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
                    value={currentTemplate.styles.primaryColor}
                    onChange={(e) => handleStyleChange("primaryColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={currentTemplate.styles.primaryColor}
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
                    value={currentTemplate.styles.secondaryColor}
                    onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={currentTemplate.styles.secondaryColor}
                    onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Se utiliza para acentos, bordes y elementos secundarios</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="orientation">Orientación</Label>
                <Select
                  value={currentTemplate.styles.orientation}
                  onValueChange={(value: "portrait" | "landscape") => handleStyleChange("orientation", value)}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue placeholder="Seleccionar orientación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Vertical (Retrato)</SelectItem>
                    <SelectItem value="landscape">Horizontal (Paisaje)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includePageNumbers">Incluir números de página</Label>
                  <Switch
                    id="includePageNumbers"
                    checked={currentTemplate.styles.includePageNumbers}
                    onCheckedChange={(checked) => handleStyleChange("includePageNumbers", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Márgenes (cm)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="marginTop" className="text-xs">
                    Superior
                  </Label>
                  <Input
                    id="marginTop"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentTemplate.styles.margins?.top || 2.5}
                    onChange={(e) =>
                      handleStyleChange("margins", {
                        ...currentTemplate.styles.margins,
                        top: Number.parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marginBottom" className="text-xs">
                    Inferior
                  </Label>
                  <Input
                    id="marginBottom"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentTemplate.styles.margins?.bottom || 2.5}
                    onChange={(e) =>
                      handleStyleChange("margins", {
                        ...currentTemplate.styles.margins,
                        bottom: Number.parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marginLeft" className="text-xs">
                    Izquierdo
                  </Label>
                  <Input
                    id="marginLeft"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentTemplate.styles.margins?.left || 3}
                    onChange={(e) =>
                      handleStyleChange("margins", {
                        ...currentTemplate.styles.margins,
                        left: Number.parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marginRight" className="text-xs">
                    Derecho
                  </Label>
                  <Input
                    id="marginRight"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentTemplate.styles.margins?.right || 2.5}
                    onChange={(e) =>
                      handleStyleChange("margins", {
                        ...currentTemplate.styles.margins,
                        right: Number.parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="lineSpacing">Interlineado</Label>
              <Select
                value={String(currentTemplate.styles.lineSpacing || 1.15)}
                onValueChange={(value) => handleStyleChange("lineSpacing", Number.parseFloat(value))}
              >
                <SelectTrigger id="lineSpacing">
                  <SelectValue placeholder="Seleccionar interlineado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Simple (1.0)</SelectItem>
                  <SelectItem value="1.15">Predeterminado (1.15)</SelectItem>
                  <SelectItem value="1.5">1.5 líneas</SelectItem>
                  <SelectItem value="2">Doble (2.0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <Undo className="h-4 w-4" />
            Restablecer
          </Button>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" />
            Aplicar estilos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
