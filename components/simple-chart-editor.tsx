"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Plus, Trash2, BarChart3, PieChart, TrendingUp, Check } from "lucide-react"

interface SimpleChartEditorProps {
  chartData?: any
  onDataChange?: (newData: any) => void
}

export function SimpleChartEditor({ chartData, onDataChange }: SimpleChartEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState({
    title: chartData?.title || "Mi Gráfico",
    type: chartData?.type || "bar",
    labels: chartData?.labels || ["Enero", "Febrero", "Marzo", "Abril"],
    datasets: chartData?.datasets || [
      {
        label: "Datos",
        data: [65, 59, 80, 81],
        backgroundColor: "#3EBD93",
      },
    ],
  })

  const updateData = (newData: any) => {
    setData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
  }

  const handleTitleChange = (value: string) => {
    updateData({ ...data, title: value })
  }

  const handleTypeChange = (value: string) => {
    updateData({ ...data, type: value })
  }

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...data.labels]
    newLabels[index] = value
    updateData({ ...data, labels: newLabels })
  }

  const handleDataValueChange = (datasetIndex: number, valueIndex: number, value: string) => {
    const newDatasets = [...data.datasets]
    const newData = [...newDatasets[datasetIndex].data]
    newData[valueIndex] = Number.parseFloat(value) || 0
    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData }
    updateData({ ...data, datasets: newDatasets })
  }

  const handleDatasetLabelChange = (index: number, value: string) => {
    const newDatasets = [...data.datasets]
    newDatasets[index] = { ...newDatasets[index], label: value }
    updateData({ ...data, datasets: newDatasets })
  }

  const handleColorChange = (index: number, value: string) => {
    const newDatasets = [...data.datasets]
    newDatasets[index] = { ...newDatasets[index], backgroundColor: value }
    updateData({ ...data, datasets: newDatasets })
  }

  const addLabel = () => {
    const newLabels = [...data.labels, `Categoría ${data.labels.length + 1}`]
    const newDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      data: [...dataset.data, 0],
    }))
    updateData({ ...data, labels: newLabels, datasets: newDatasets })
  }

  const removeLabel = (index: number) => {
    if (data.labels.length <= 1) return
    const newLabels = data.labels.filter((_, i) => i !== index)
    const newDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.filter((_, i) => i !== index),
    }))
    updateData({ ...data, labels: newLabels, datasets: newDatasets })
  }

  const addDataset = () => {
    const colors = ["#3EBD93", "#334E68", "#FFCA3A", "#E63946", "#6F42C1", "#FD7E14"]
    const colorIndex = data.datasets.length % colors.length
    const newDataset = {
      label: `Datos ${data.datasets.length + 1}`,
      data: Array(data.labels.length).fill(0),
      backgroundColor: colors[colorIndex],
    }
    updateData({ ...data, datasets: [...data.datasets, newDataset] })
  }

  const removeDataset = (index: number) => {
    if (data.datasets.length <= 1) return
    const newDatasets = data.datasets.filter((_, i) => i !== index)
    updateData({ ...data, datasets: newDatasets })
  }

  // Renderizar gráfico simple
  const renderSimpleChart = () => {
    if (data.type === "bar") {
      const maxValue = Math.max(...data.datasets.flatMap((d) => d.data))

      return (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-center font-semibold mb-6 text-lg">{data.title}</h3>
          <div className="flex items-end justify-center h-48 space-x-4">
            {data.labels.map((label, labelIndex) => (
              <div key={labelIndex} className="flex flex-col items-center space-y-2">
                <div className="flex flex-col items-center space-y-1">
                  {data.datasets.map((dataset, datasetIndex) => {
                    const value = dataset.data[labelIndex] || 0
                    const height = maxValue > 0 ? (value / maxValue) * 120 : 0

                    return (
                      <div key={datasetIndex} className="flex flex-col items-center">
                        <div
                          className="w-12 rounded-t transition-all duration-200 hover:opacity-80"
                          style={{
                            height: `${Math.max(height, 2)}px`,
                            backgroundColor: dataset.backgroundColor || "#3EBD93",
                          }}
                          title={`${dataset.label}: ${value}`}
                        />
                        <span className="text-xs text-gray-600 mt-1">{value}</span>
                      </div>
                    )
                  })}
                </div>
                <span className="text-sm text-gray-700 text-center max-w-16 truncate">{label}</span>
              </div>
            ))}
          </div>
          {data.datasets.length > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: dataset.backgroundColor }} />
                  <span className="text-sm">{dataset.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-center font-semibold mb-6">{data.title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Vista previa para {data.type}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className="relative">
        {renderSimpleChart()}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all duration-200 flex items-center justify-center">
          <Button
            onClick={() => {
              console.log("Botón clickeado - abriendo editor")
              setIsEditing(true)
            }}
            className="opacity-0 hover:opacity-100 transition-opacity duration-200 shadow-lg"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar Gráfico
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editor de Gráfico</CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              console.log("Cerrando editor")
              setIsEditing(false)
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Vista previa */}
        <div className="mb-6">{renderSimpleChart()}</div>

        <Tabs defaultValue="data">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="type">Tipo</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="labels">Etiquetas</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del gráfico"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Series de datos</h3>
                <Button size="sm" onClick={addDataset}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </div>

              {data.datasets.map((dataset, datasetIndex) => (
                <div key={datasetIndex} className="border rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={dataset.label}
                      onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
                      placeholder="Nombre de la serie"
                      className="flex-1 mr-2"
                    />
                    <input
                      type="color"
                      value={dataset.backgroundColor}
                      onChange={(e) => handleColorChange(datasetIndex, e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDataset(datasetIndex)}
                      disabled={data.datasets.length <= 1}
                      className="ml-2 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dataset.data.map((value, valueIndex) => (
                      <div key={valueIndex}>
                        <label className="block text-xs text-gray-500 mb-1">{data.labels[valueIndex]}</label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => handleDataValueChange(datasetIndex, valueIndex, e.target.value)}
                          step="0.1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="type">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de gráfico</label>
              <Select value={data.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Barras
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Líneas
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center">
                      <PieChart className="h-4 w-4 mr-2" />
                      Circular
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="style">
            <div className="space-y-4">
              <h3 className="font-medium">Colores de las series</h3>
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span>{dataset.label}</span>
                  <input
                    type="color"
                    value={dataset.backgroundColor}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="labels">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Etiquetas del eje X</h3>
                <Button size="sm" onClick={addLabel}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </div>

              <div className="space-y-2">
                {data.labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={label}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      placeholder={`Etiqueta ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLabel(index)}
                      disabled={data.labels.length <= 1}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default SimpleChartEditor
