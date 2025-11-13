"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Plus, Trash2, Palette, BarChart3, PieChart, TrendingUp, Check } from "lucide-react"

interface VisualChartEditorInlineProps {
  chartData: any
  onDataChange?: (newData: any) => void
  onEdit?: () => void
}

export function VisualChartEditorInline({ chartData, onDataChange, onEdit }: VisualChartEditorInlineProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState(() => {
    // Asegurar que tenemos datos válidos
    if (!chartData || !chartData.labels || !chartData.datasets) {
      return {
        title: "Mi Gráfico",
        type: "bar",
        labels: ["Enero", "Febrero", "Marzo", "Abril"],
        datasets: [
          {
            label: "Datos",
            data: [65, 59, 80, 81],
            backgroundColor: "#3EBD93",
            borderColor: "#3EBD93",
          },
        ],
      }
    }
    return chartData
  })
  const [activeTab, setActiveTab] = useState("data")

  const updateData = (newData: any) => {
    console.log("📊 VisualChartEditorInline: Updating data:", newData)
    setData(newData)

    // SIEMPRE notificar cambios al componente padre
    if (onDataChange) {
      console.log("📤 VisualChartEditorInline: Calling onDataChange")
      onDataChange(newData)
    }
  }

  // Manejar cambios en el título
  const handleTitleChange = (value: string) => {
    updateData({ ...data, title: value })
  }

  // Manejar cambios en el tipo de gráfico
  const handleTypeChange = (value: string) => {
    updateData({ ...data, type: value })
  }

  // Manejar cambios en las etiquetas
  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...data.labels]
    newLabels[index] = value
    updateData({ ...data, labels: newLabels })
  }

  // Añadir etiqueta
  const handleAddLabel = () => {
    const newLabels = [...data.labels, `Categoría ${data.labels.length + 1}`]
    const newDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      data: [...dataset.data, 0],
    }))
    updateData({ ...data, labels: newLabels, datasets: newDatasets })
  }

  // Eliminar etiqueta
  const handleRemoveLabel = (index: number) => {
    if (data.labels.length <= 1) return
    const newLabels = data.labels.filter((_, i) => i !== index)
    const newDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.filter((_, i) => i !== index),
    }))
    updateData({ ...data, labels: newLabels, datasets: newDatasets })
  }

  // Manejar cambios en los valores de datos
  const handleDataValueChange = (datasetIndex: number, valueIndex: number, value: string) => {
    const newDatasets = [...data.datasets]
    const newData = [...newDatasets[datasetIndex].data]
    newData[valueIndex] = Number.parseFloat(value) || 0
    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData }
    updateData({ ...data, datasets: newDatasets })
  }

  // Manejar cambios en el nombre del conjunto de datos
  const handleDatasetLabelChange = (index: number, value: string) => {
    const newDatasets = [...data.datasets]
    newDatasets[index] = { ...newDatasets[index], label: value }
    updateData({ ...data, datasets: newDatasets })
  }

  // Manejar cambios en el color del conjunto de datos
  const handleDatasetColorChange = (index: number, field: "backgroundColor" | "borderColor", value: string) => {
    const newDatasets = [...data.datasets]
    newDatasets[index] = { ...newDatasets[index], [field]: value }
    updateData({ ...data, datasets: newDatasets })
  }

  // Añadir conjunto de datos
  const handleAddDataset = () => {
    const colors = ["#3EBD93", "#334E68", "#FFCA3A", "#E63946", "#6F42C1", "#FD7E14"]
    const colorIndex = data.datasets.length % colors.length
    const newDataset = {
      label: `Datos ${data.datasets.length + 1}`,
      data: Array(data.labels.length).fill(0),
      backgroundColor: colors[colorIndex],
      borderColor: colors[colorIndex],
    }
    updateData({ ...data, datasets: [...data.datasets, newDataset] })
  }

  // Eliminar conjunto de datos
  const handleRemoveDataset = (index: number) => {
    if (data.datasets.length <= 1) return
    const newDatasets = data.datasets.filter((_, i) => i !== index)
    updateData({ ...data, datasets: newDatasets })
  }

  // Renderizar gráfico mejorado (usado tanto en vista previa como en edición)
  const renderChart = () => {
    if (data.type === "bar") {
      const allValues = data.datasets.flatMap((d) => d.data)
      const maxValue = Math.max(...allValues, 0)
      const yAxisMax = Math.ceil((maxValue * 1.2) / 10) * 10 || 100
      const yAxisSteps = 5
      const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => (yAxisMax / yAxisSteps) * i)

      return (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-center font-semibold mb-6 text-lg">{data.title}</h3>

          <div className="relative h-64 ml-16">
            {/* Eje Y con líneas de cuadrícula */}
            <div className="absolute top-0 left-0 bottom-0 w-16 -ml-16">
              {yAxisValues.map((value, index) => (
                <div
                  key={index}
                  className="absolute w-full flex items-center justify-end pr-2"
                  style={{ bottom: `${(value / yAxisMax) * 100}%`, transform: "translateY(50%)" }}
                >
                  <span className="text-xs text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            {/* Líneas horizontales de cuadrícula */}
            {yAxisValues.map((value, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ bottom: `${(value / yAxisMax) * 100}%` }}
              />
            ))}

            {/* Barras del gráfico */}
            <div className="flex items-end justify-between h-full relative px-4">
              {data.labels.map((label, labelIndex) => {
                // Calcular la altura para cada barra
                const barHeights = data.datasets.map((dataset) => {
                  const value = dataset.data[labelIndex] || 0
                  return {
                    value,
                    heightPercent: (value / yAxisMax) * 100,
                  }
                })

                return (
                  <div key={labelIndex} className="flex flex-col items-center flex-1 max-w-24">
                    <div className="flex flex-col items-center justify-end h-full w-full">
                      {data.datasets.map((dataset, datasetIndex) => {
                        const { value, heightPercent } = barHeights[datasetIndex]

                        return (
                          <div key={datasetIndex} className="w-full mb-2">
                            {/* Valor encima de la barra */}
                            <div className="text-xs font-medium mb-1 text-center text-gray-700">{value}</div>

                            {/* Contenedor de altura fija para la barra */}
                            <div className="relative h-48 w-full">
                              {/* Barra con altura dinámica desde abajo */}
                              <div
                                className="absolute bottom-0 left-0 right-0 transition-all duration-200 hover:opacity-80 cursor-pointer rounded-t"
                                style={{
                                  height: `${Math.max(heightPercent, 1)}%`,
                                  backgroundColor: dataset.backgroundColor || "#3EBD93",
                                  minHeight: "4px",
                                }}
                                title={`${dataset.label}: ${value}`}
                                onClick={() => {
                                  console.log("Barra clickeada - abriendo editor")
                                  setIsEditing(true)
                                  setActiveTab("data")
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Etiqueta del eje X */}
                    <div className="text-xs font-medium mt-3 text-center text-gray-700 w-full truncate">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leyenda */}
          {data.datasets.length > 1 && (
            <div className="flex justify-center mt-6 space-x-6">
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4" style={{ backgroundColor: dataset.backgroundColor }} />
                  <span className="text-sm font-medium">{dataset.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (data.type === "line") {
      const allValues = data.datasets.flatMap((d) => d.data)
      const maxValue = Math.max(...allValues, 0)
      const minValue = Math.min(0, ...allValues)
      const yAxisMax = Math.ceil((maxValue * 1.2) / 10) * 10 || 100
      const yAxisSteps = 5
      const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => (yAxisMax / yAxisSteps) * i)

      return (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-center font-semibold mb-6 text-lg">{data.title}</h3>

          <div className="relative h-64 ml-16">
            {/* Eje Y con líneas de cuadrícula */}
            <div className="absolute top-0 left-0 bottom-0 w-16 -ml-16">
              {yAxisValues.map((value, index) => (
                <div
                  key={index}
                  className="absolute w-full flex items-center justify-end pr-2"
                  style={{ bottom: `${(value / yAxisMax) * 100}%`, transform: "translateY(50%)" }}
                >
                  <span className="text-xs text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            {/* Líneas horizontales de cuadrícula */}
            {yAxisValues.map((value, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ bottom: `${(value / yAxisMax) * 100}%` }}
              />
            ))}

            {/* Contenedor principal del gráfico */}
            <div className="relative w-full h-full overflow-hidden">
              {data.datasets.map((dataset, datasetIndex) => {
                // Calcular todas las posiciones primero
                const points = dataset.data.map((value, index) => {
                  const xPercent = (index / (data.labels.length - 1 || 1)) * 100
                  const yPercent = 100 - ((value - minValue) / (yAxisMax - minValue || 1)) * 100
                  return { x: xPercent, y: yPercent, value, index }
                })

                return (
                  <div key={datasetIndex} className="absolute inset-0">
                    {/* Líneas conectoras usando SVG */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke={dataset.backgroundColor || "#3EBD93"}
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer"
                        onClick={() => {
                          console.log("Línea clickeada - abriendo editor")
                          setIsEditing(true)
                          setActiveTab("data")
                        }}
                      />
                    </svg>

                    {/* Puntos y valores */}
                    {points.map((point, index) => (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      >
                        {/* Valor encima del punto */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-semibold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow-sm border">
                            {point.value}
                          </span>
                        </div>

                        {/* Punto */}
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white cursor-pointer hover:w-4 hover:h-4 transition-all duration-200 shadow-sm"
                          style={{ backgroundColor: dataset.backgroundColor || "#3EBD93" }}
                          onClick={() => {
                            console.log("Punto clickeado - abriendo editor")
                            setIsEditing(true)
                            setActiveTab("data")
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Etiquetas del eje X */}
              <div className="absolute left-0 right-0 bottom-0 flex justify-between transform translate-y-8 px-2">
                {data.labels.map((label, index) => (
                  <div key={index} className="text-xs font-medium text-center text-gray-700 flex-1">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          {data.datasets.length > 1 && (
            <div className="flex justify-center mt-12 space-x-6">
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dataset.backgroundColor }} />
                  <span className="text-sm font-medium">{dataset.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (data.type === "pie" || data.type === "doughnut") {
      const total = data.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 1
      let currentAngle = 0

      return (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-center font-semibold mb-6 text-lg">{data.title}</h3>
          <div className="flex justify-center">
            <svg width="200" height="200" className="overflow-visible">
              {data.datasets[0]?.data.map((value, index) => {
                const percentage = value / total
                const angle = percentage * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle += angle

                const startAngleRad = (startAngle * Math.PI) / 180
                const endAngleRad = (endAngle * Math.PI) / 180

                const largeArcFlag = angle > 180 ? 1 : 0
                const x1 = 100 + 80 * Math.cos(startAngleRad)
                const y1 = 100 + 80 * Math.sin(startAngleRad)
                const x2 = 100 + 80 * Math.cos(endAngleRad)
                const y2 = 100 + 80 * Math.sin(endAngleRad)

                const innerRadius = data.type === "doughnut" ? 40 : 0
                const ix1 = 100 + innerRadius * Math.cos(startAngleRad)
                const iy1 = 100 + innerRadius * Math.sin(startAngleRad)
                const ix2 = 100 + innerRadius * Math.cos(endAngleRad)
                const iy2 = 100 + innerRadius * Math.sin(endAngleRad)

                const pathData =
                  data.type === "doughnut"
                    ? `M ${ix1} ${iy1} L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`
                    : `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                // Calcular posición para la etiqueta
                const midAngleRad = (startAngleRad + endAngleRad) / 2
                const labelRadius = data.type === "doughnut" ? (innerRadius + 80) / 2 : 80 * 0.7
                const labelX = 100 + labelRadius * Math.cos(midAngleRad)
                const labelY = 100 + labelRadius * Math.sin(midAngleRad)

                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={
                        Array.isArray(data.datasets[0]?.backgroundColor)
                          ? data.datasets[0]?.backgroundColor[index]
                          : data.datasets[0]?.backgroundColor || "#3EBD93"
                      }
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => {
                        console.log("Sector clickeado - abriendo editor")
                        setIsEditing(true)
                        setActiveTab("data")
                      }}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Leyenda */}
          <div className="flex justify-center mt-6 flex-wrap gap-4">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4"
                  style={{
                    backgroundColor: Array.isArray(data.datasets[0]?.backgroundColor)
                      ? data.datasets[0]?.backgroundColor[index]
                      : data.datasets[0]?.backgroundColor || "#3EBD93",
                  }}
                />
                <span className="text-sm">
                  {label}: {data.datasets[0]?.data[index] || 0}
                </span>
              </div>
            ))}
          </div>
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

  useEffect(() => {
    console.log("📊 VisualChartEditorInline: Data changed, notifying parent")
    if (onDataChange) {
      onDataChange(data)
    }
  }, [data, onDataChange])

  if (!isEditing) {
    return (
      <div className="relative group">
        <div className="relative">
          {renderChart()}

          {/* Overlay de edición */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                onClick={() => {
                  console.log("Botón de overlay clickeado - abriendo editor")
                  setIsEditing(true)
                }}
                className="shadow-lg"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar Gráfico
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Editor de Gráfico</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log("✅ VisualChartEditorInline: Finalizing edit, saving changes")
              if (onDataChange) {
                onDataChange(data)
              }
              setIsEditing(false)
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Finalizar Edición
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vista previa del gráfico - usando la misma función renderChart */}
        <div className="border rounded-lg overflow-hidden">{renderChart()}</div>

        {/* Controles de edición */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="type">Tipo</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="labels">Etiquetas</TabsTrigger>
          </TabsList>

          {/* Pestaña de datos */}
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del gráfico</label>
                <Input
                  value={data.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ingresa el título del gráfico"
                />
              </div>

              <div className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Conjuntos de datos</h3>
                  <Button size="sm" onClick={handleAddDataset} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Añadir Serie
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.datasets?.map((dataset, datasetIndex) => (
                    <div key={datasetIndex} className="space-y-3 border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la serie</label>
                          <Input
                            value={dataset.label || ""}
                            onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
                            placeholder="Nombre de la serie"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-500">Color:</label>
                            <input
                              type="color"
                              value={dataset.backgroundColor || "#3EBD93"}
                              onChange={(e) =>
                                handleDatasetColorChange(datasetIndex, "backgroundColor", e.target.value)
                              }
                              className="w-8 h-8 rounded cursor-pointer border"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleRemoveDataset(datasetIndex)}
                            disabled={data.datasets.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valores</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dataset.data?.map((value, valueIndex) => (
                            <div key={valueIndex} className="space-y-1">
                              <label className="block text-xs text-gray-500">
                                {data.labels?.[valueIndex] || `Valor ${valueIndex + 1}`}
                              </label>
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => handleDataValueChange(datasetIndex, valueIndex, e.target.value)}
                                className="w-full"
                                step="0.1"
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
          <TabsContent value="type" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de gráfico</label>
                <Select value={data.type || "bar"} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Barras
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Líneas
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Circular
                      </div>
                    </SelectItem>
                    <SelectItem value="doughnut">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Dona
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de estilo */}
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colores del gráfico
                </h3>
                <div className="space-y-4">
                  {data.datasets?.map((dataset, datasetIndex) => (
                    <div key={datasetIndex} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dataset.backgroundColor }} />
                      <span className="text-sm">{dataset.label || `Serie ${datasetIndex + 1}`}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <label className="text-xs text-gray-500">Color:</label>
                        <input
                          type="color"
                          value={dataset.backgroundColor || "#3EBD93"}
                          onChange={(e) => handleDatasetColorChange(datasetIndex, "backgroundColor", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de etiquetas */}
          <TabsContent value="labels" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Etiquetas (eje X)</h3>
                  <Button size="sm" onClick={handleAddLabel} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Añadir
                  </Button>
                </div>

                <div className="space-y-2">
                  {data.labels?.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={label}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        className="flex-1"
                        placeholder={`Etiqueta ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleRemoveLabel(index)}
                        disabled={data.labels.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default VisualChartEditorInline
