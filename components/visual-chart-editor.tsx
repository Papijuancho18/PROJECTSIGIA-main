"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalElements } from "@/contexts/global-elements-context"
import { useAutoSave } from "@/hooks/use-auto-save"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"
import { X, Plus, Trash2 } from "lucide-react"

interface VisualChartEditorProps {
  chartId: string
  initialContent?: string
  reportId?: string
  sectionId?: string
  onUpdate?: (chartId: string, newContent: string) => void
  onClose: () => void
}

interface ChartData {
  type: string
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export function VisualChartEditor({
  chartId,
  initialContent = "",
  reportId,
  sectionId,
  onUpdate,
  onClose,
}: VisualChartEditorProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [activeTab, setActiveTab] = useState("data")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Acceder al contexto global de elementos
  const { getElements, updateElement } = useGlobalElements()

  // Función de guardado para el auto-save
  const performSave = useCallback(async () => {
    if (!chartData || !hasUnsavedChanges) return

    // Actualizar el elemento en el registro global
    if (reportId && sectionId) {
      updateElement({
        id: chartId,
        type: "chart",
        content: chartData,
        reportId,
        sectionId,
      })
    }

    // Generar markdown para el gráfico
    const chartJson = JSON.stringify(chartData, null, 2)
    const chartMarkdown = `\n\`\`\`chart\n${chartJson}\n\`\`\`\n`

    // Llamar a la función de actualización
    if (onUpdate) {
      onUpdate(chartId, chartMarkdown)
    }

    setHasUnsavedChanges(false)
  }, [chartData, hasUnsavedChanges, reportId, sectionId, chartId, updateElement, onUpdate])

  // Hook de auto-save
  const autoSave = useAutoSave({
    delay: 2000, // 2 segundos de delay
    onSave: performSave,
    enabled: autoSaveEnabled,
  })

  // Cargar datos del gráfico
  useEffect(() => {
    const elements = getElements ? getElements() : []
    const chartElement = elements.find((el) => el.id === chartId && el.type === "chart")

    if (chartElement?.content) {
      setChartData(chartElement.content)
    } else {
      try {
        const chartRegex = /```chart\s+([\s\S]+?)\s+```/g
        const match = chartRegex.exec(initialContent)

        if (match && match[1]) {
          const chartJson = JSON.parse(match[1])
          setChartData(chartJson)
        } else {
          setChartData({
            type: "bar",
            title: "Nuevo Gráfico",
            labels: ["Ene", "Feb", "Mar", "Abr", "May"],
            datasets: [
              {
                label: "Datos 2023",
                data: [65, 59, 80, 81, 56],
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
              },
            ],
          })
        }
      } catch (error) {
        console.error("Error al parsear datos del gráfico:", error)
        setChartData({
          type: "bar",
          title: "Nuevo Gráfico",
          labels: ["Ene", "Feb", "Mar", "Abr", "May"],
          datasets: [
            {
              label: "Datos 2023",
              data: [65, 59, 80, 81, 56],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
            },
          ],
        })
      }
    }
  }, [chartId, initialContent, getElements])

  // Función helper para marcar cambios y activar auto-save
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
    autoSave.debouncedSave()
  }, [autoSave])

  // Manejar cambios en el título
  const handleTitleChange = (value: string) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      return { ...prev, title: value }
    })
    markAsChanged()
  }

  // Manejar cambios en el tipo de gráfico
  const handleTypeChange = (value: string) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      return { ...prev, type: value }
    })
    markAsChanged()
  }

  // Manejar cambios en las etiquetas
  const handleLabelChange = (index: number, value: string) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newLabels = [...prev.labels]
      newLabels[index] = value
      return { ...prev, labels: newLabels }
    })
    markAsChanged()
  }

  // Añadir etiqueta
  const handleAddLabel = () => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newLabels = [...prev.labels, `Etiqueta ${prev.labels.length + 1}`]
      const newDatasets = prev.datasets.map((dataset) => ({
        ...dataset,
        data: [...dataset.data, 0],
      }))
      return { ...prev, labels: newLabels, datasets: newDatasets }
    })
    markAsChanged()
  }

  // Eliminar etiqueta
  const handleRemoveLabel = (index: number) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newLabels = prev.labels.filter((_, i) => i !== index)
      const newDatasets = prev.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.filter((_, i) => i !== index),
      }))
      return { ...prev, labels: newLabels, datasets: newDatasets }
    })
    markAsChanged()
  }

  // Manejar cambios en el nombre del conjunto de datos
  const handleDatasetLabelChange = (index: number, value: string) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newDatasets = [...prev.datasets]
      newDatasets[index] = { ...newDatasets[index], label: value }
      return { ...prev, datasets: newDatasets }
    })
    markAsChanged()
  }

  // Manejar cambios en los valores de datos
  const handleDataValueChange = (datasetIndex: number, valueIndex: number, value: string) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newDatasets = [...prev.datasets]
      const newData = [...newDatasets[datasetIndex].data]
      newData[valueIndex] = Number.parseFloat(value) || 0
      newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData }
      return { ...prev, datasets: newDatasets }
    })
    markAsChanged()
  }

  // Añadir conjunto de datos
  const handleAddDataset = () => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)
      const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`
      const borderColor = `rgba(${r}, ${g}, ${b}, 1)`

      const newDataset = {
        label: `Datos ${prev.datasets.length + 1}`,
        data: Array(prev.labels.length).fill(0),
        backgroundColor,
        borderColor,
      }

      return { ...prev, datasets: [...prev.datasets, newDataset] }
    })
    markAsChanged()
  }

  // Eliminar conjunto de datos
  const handleRemoveDataset = (index: number) => {
    if (!chartData) return

    setChartData((prev) => {
      if (!prev) return prev
      const newDatasets = prev.datasets.filter((_, i) => i !== index)
      return { ...prev, datasets: newDatasets }
    })
    markAsChanged()
  }

  // Guardar cambios manualmente
  const handleSave = async () => {
    autoSave.cancel() // Cancelar auto-save pendiente
    await autoSave.saveNow() // Guardar inmediatamente
  }

  // Cancelar edición
  const handleCancel = () => {
    autoSave.cancel() // Cancelar auto-save pendiente
    onClose()
  }

  // Si no hay datos, mostrar mensaje de carga
  if (!chartData) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargando editor de gráfico...</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando datos del gráfico</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Editor de Gráfico</span>
            <div className="flex items-center space-x-2">
              <AutoSaveIndicator state={autoSave.state} />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="type">Tipo</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="settings">Config</TabsTrigger>
          </TabsList>

          {/* Pestaña de datos */}
          <TabsContent value="data" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del gráfico
                </label>
                <Input
                  id="chart-title"
                  value={chartData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Etiquetas (eje X)</h3>
                  <Button size="sm" onClick={handleAddLabel} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Añadir Etiqueta
                  </Button>
                </div>

                <div className="space-y-2">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={label}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleRemoveLabel(index)}
                        disabled={chartData.labels.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Conjuntos de datos</h3>
                  <Button size="sm" onClick={handleAddDataset} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Añadir Conjunto
                  </Button>
                </div>

                <div className="space-y-6">
                  {chartData.datasets.map((dataset, datasetIndex) => (
                    <div key={datasetIndex} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del conjunto</label>
                          <Input
                            value={dataset.label}
                            onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 ml-2 mt-6"
                          onClick={() => handleRemoveDataset(datasetIndex)}
                          disabled={chartData.datasets.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valores</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dataset.data.map((value, valueIndex) => (
                            <div key={valueIndex} className="space-y-1">
                              <label className="block text-xs text-gray-500">{chartData.labels[valueIndex]}</label>
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => handleDataValueChange(datasetIndex, valueIndex, e.target.value)}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de tipo */}
          <TabsContent value="type" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de gráfico
                </label>
                <Select value={chartData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="line">Líneas</SelectItem>
                    <SelectItem value="pie">Circular</SelectItem>
                    <SelectItem value="doughnut">Dona</SelectItem>
                    <SelectItem value="radar">Radar</SelectItem>
                    <SelectItem value="polarArea">Área Polar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Descripción del tipo</h3>
                {chartData.type === "bar" && (
                  <p className="text-sm text-gray-600">
                    Los gráficos de barras son útiles para comparar valores entre diferentes categorías.
                  </p>
                )}
                {chartData.type === "line" && (
                  <p className="text-sm text-gray-600">
                    Los gráficos de líneas son ideales para mostrar tendencias a lo largo del tiempo.
                  </p>
                )}
                {chartData.type === "pie" && (
                  <p className="text-sm text-gray-600">
                    Los gráficos circulares muestran proporciones de un todo y son buenos para porcentajes.
                  </p>
                )}
                {chartData.type === "doughnut" && (
                  <p className="text-sm text-gray-600">
                    Similar al gráfico circular, pero con un espacio en el centro que permite añadir información
                    adicional.
                  </p>
                )}
                {chartData.type === "radar" && (
                  <p className="text-sm text-gray-600">
                    Los gráficos de radar son útiles para comparar múltiples variables en un formato radial.
                  </p>
                )}
                {chartData.type === "polarArea" && (
                  <p className="text-sm text-gray-600">
                    Combina aspectos de gráficos circulares y de radar, mostrando valores como áreas en un círculo.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de estilo */}
          <TabsContent value="style" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Estilos de gráfico</h3>
                <p className="text-sm text-gray-500">
                  Los estilos se aplicarán automáticamente según el tipo de gráfico y los datos.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de vista previa */}
          <TabsContent value="preview" className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-lg font-medium text-center mb-4">{chartData.title}</h3>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 italic">
                  Vista previa no disponible. El gráfico se renderizará cuando se guarden los cambios.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de configuración */}
          <TabsContent value="settings" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Configuración de guardado</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Guardado automático</label>
                    <p className="text-xs text-gray-500">
                      Los cambios se guardan automáticamente después de 2 segundos de inactividad
                    </p>
                  </div>
                  <Button
                    variant={autoSaveEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  >
                    {autoSaveEnabled ? "Activado" : "Desactivado"}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Estado actual</h3>
                <AutoSaveIndicator state={autoSave.state} className="mb-2" />
                {hasUnsavedChanges && <p className="text-sm text-yellow-600">Hay cambios sin guardar</p>}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={autoSave.state.status === "saving"}>
            {autoSave.state.status === "saving" ? "Guardando..." : "Guardar Ahora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
