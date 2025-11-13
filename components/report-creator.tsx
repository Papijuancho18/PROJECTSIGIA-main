"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Save, Eye, Plus, Trash2, BarChart3, Table, FileText } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import { ChartCreationModal } from "./chart-creation-modal"
import { TableCreationModal } from "./table-creation-modal"
import { ExportButton } from "./export-button"
import { useGlobalElements } from "@/hooks/use-global-elements"

interface ReportSection {
  id: string
  title: string
  content: string
  type?: "text" | "chart" | "table"
  order: number
}

interface ReportData {
  id: string
  title: string
  subtitle?: string
  author: string
  department: string
  createdAt: string
  updatedAt: string
  sections: ReportSection[]
}

interface ReportCreatorProps {
  initialData?: Partial<ReportData>
  onSave?: (data: ReportData) => void
  onExport?: (data: ReportData, format: string) => void
}

export function ReportCreator({ initialData, onSave, onExport }: ReportCreatorProps) {
  const { toast } = useToast()
  const { charts, tables } = useGlobalElements()
  const editorRef = useRef<any>(null)

  const [reportData, setReportData] = useState<ReportData>({
    id: initialData?.id || `report-${Date.now()}`,
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    author: initialData?.author || "",
    department: initialData?.department || "",
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: initialData?.sections || [],
  })

  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Función para agregar una nueva sección
  const addSection = useCallback(() => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      title: `Nueva Sección ${reportData.sections.length + 1}`,
      content: "",
      type: "text",
      order: reportData.sections.length,
    }

    setReportData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString(),
    }))

    setActiveSection(newSection.id)
  }, [reportData.sections.length])

  // Función para eliminar una sección
  const deleteSection = useCallback(
    (sectionId: string) => {
      setReportData((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
        updatedAt: new Date().toISOString(),
      }))

      if (activeSection === sectionId) {
        setActiveSection(null)
      }
    },
    [activeSection],
  )

  // Función para actualizar una sección
  const updateSection = useCallback((sectionId: string, updates: Partial<ReportSection>) => {
    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  // Función para insertar un gráfico en el editor
  const insertChart = useCallback(
    (chartId: string) => {
      const chart = charts[chartId]
      if (!chart || !editorRef.current) return

      const chartBlock = {
        id: chartId,
        type: chart.type,
        title: chart.title,
        data: {
          labels: chart.data.labels,
          datasets: chart.data.datasets,
        },
        options: chart.options,
      }

      const chartMarkdown = `\n\`\`\`chart\n${JSON.stringify(chartBlock, null, 2)}\n\`\`\`\n`

      // Insertar en el editor activo
      if (editorRef.current.insertContent) {
        editorRef.current.insertContent(chartMarkdown)
      }

      // Actualizar la sección activa
      if (activeSection) {
        updateSection(activeSection, { type: "chart" })
      }

      setIsChartModalOpen(false)
      toast({
        title: "Gráfico insertado",
        description: "El gráfico se ha insertado correctamente en el reporte",
      })
    },
    [charts, activeSection, updateSection, toast],
  )

  // Función para insertar una tabla en el editor
  const insertTable = useCallback(
    (tableId: string) => {
      const table = tables[tableId]
      if (!table || !editorRef.current) return

      const tableBlock = {
        id: tableId,
        title: table.title,
        headers: table.columns,
        rows: table.rows,
      }

      const tableMarkdown = `\n\`\`\`table\n${JSON.stringify(tableBlock, null, 2)}\n\`\`\`\n`

      // Insertar en el editor activo
      if (editorRef.current.insertContent) {
        editorRef.current.insertContent(tableMarkdown)
      }

      // Actualizar la sección activa
      if (activeSection) {
        updateSection(activeSection, { type: "table" })
      }

      setIsTableModalOpen(false)
      toast({
        title: "Tabla insertada",
        description: "La tabla se ha insertada correctamente en el reporte",
      })
    },
    [tables, activeSection, updateSection, toast],
  )

  // Función para guardar el reporte
  const handleSave = useCallback(async () => {
    try {
      if (!reportData.title.trim()) {
        toast({
          title: "Error",
          description: "El título del reporte es obligatorio",
          variant: "destructive",
        })
        return
      }

      const updatedData = {
        ...reportData,
        updatedAt: new Date().toISOString(),
      }

      if (onSave) {
        await onSave(updatedData)
      }

      setReportData(updatedData)

      toast({
        title: "Reporte guardado",
        description: "El reporte se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el reporte",
        variant: "destructive",
      })
    }
  }, [reportData, onSave, toast])

  // Función para exportar el reporte
  const handleExport = useCallback(
    async (format: string) => {
      try {
        if (!reportData.title.trim()) {
          toast({
            title: "Error",
            description: "El título del reporte es obligatorio para exportar",
            variant: "destructive",
          })
          return
        }

        if (onExport) {
          await onExport(reportData, format)
        }

        toast({
          title: "Exportación iniciada",
          description: `Generando archivo ${format.toUpperCase()}...`,
        })
      } catch (error) {
        console.error("Error al exportar:", error)
        toast({
          title: "Error al exportar",
          description: "No se pudo exportar el reporte",
          variant: "destructive",
        })
      }
    },
    [reportData, onExport, toast],
  )

  const activeSectionData = activeSection ? reportData.sections.find((s) => s.id === activeSection) : null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold">Editor de Reportes</h1>
              <p className="text-sm text-gray-500">{reportData.title || "Nuevo reporte"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Editar" : "Vista previa"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>

            <ExportButton onExport={handleExport} reportData={reportData} size="sm" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs defaultValue="sections" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="sections">Secciones</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="flex-1 flex flex-col m-0">
              <div className="p-4 border-b">
                <Button onClick={addSection} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sección
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {reportData.sections.map((section, index) => (
                    <Card
                      key={section.id}
                      className={`cursor-pointer transition-colors ${
                        activeSection === section.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                              {section.type === "chart" && <BarChart3 className="h-3 w-3 text-blue-500" />}
                              {section.type === "table" && <Table className="h-3 w-3 text-green-500" />}
                              {section.type === "text" && <FileText className="h-3 w-3 text-gray-500" />}
                            </div>
                            <h4 className="font-medium text-sm truncate">{section.title}</h4>
                            <p className="text-xs text-gray-500 truncate">
                              {section.content.length > 0 ? `${section.content.substring(0, 50)}...` : "Sin contenido"}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSection(section.id)
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={reportData.title}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          title: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                      placeholder="Título del reporte"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Subtítulo</label>
                    <Input
                      value={reportData.subtitle}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                      placeholder="Subtítulo (opcional)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Autor</label>
                    <Input
                      value={reportData.author}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          author: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                      placeholder="Nombre del autor"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Departamento</label>
                    <Input
                      value={reportData.department}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          department: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                      placeholder="Departamento o área"
                    />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Estadísticas</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Secciones:</span>
                        <Badge variant="secondary">{reportData.sections.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Gráficos:</span>
                        <Badge variant="secondary">
                          {reportData.sections.filter((s) => s.type === "chart").length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Tablas:</span>
                        <Badge variant="secondary">
                          {reportData.sections.filter((s) => s.type === "table").length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeSectionData ? (
            <div className="flex-1 flex flex-col">
              {/* Section Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Input
                      value={activeSectionData.title}
                      onChange={(e) => updateSection(activeSectionData.id, { title: e.target.value })}
                      className="text-lg font-medium border-none p-0 h-auto focus-visible:ring-0"
                      placeholder="Título de la sección"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsChartModalOpen(true)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gráfico
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setIsTableModalOpen(true)}>
                      <Table className="h-4 w-4 mr-2" />
                      Tabla
                    </Button>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 bg-white">
                <RichTextEditor
                  ref={editorRef}
                  content={activeSectionData.content}
                  onChange={(content) => updateSection(activeSectionData.id, { content })}
                  placeholder="Escribe el contenido de esta sección..."
                  className="h-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una sección</h3>
                <p className="text-gray-500 mb-4">Elige una sección del panel izquierdo para comenzar a editar</p>
                <Button onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera sección
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ChartCreationModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onInsert={insertChart}
        existingCharts={charts}
      />

      <TableCreationModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={insertTable}
        existingTables={tables}
      />
    </div>
  )
}

export default ReportCreator
