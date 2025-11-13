"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Plus, Trash2, Palette, BarChart3, PieChart, TrendingUp, Check, Settings, Eye } from "lucide-react"

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
            backgroundColor: "#3B82F6",
            borderColor: "#3B82F6",
          },
        ],
      }
    }
    return chartData
  })
  const [activeTab, setActiveTab] = useState("data")

  // Usar ref para evitar ciclos infinitos
  const lastNotifiedData = useRef<string>("")
  const isInternalUpdate = useRef(false)

  const updateData = (newData: any) => {
    console.log("📊 VisualChartEditorInline: Updating data:", newData)
    isInternalUpdate.current = true
    setData(newData)

    // Solo notificar si los datos realmente cambiaron
    const dataString = JSON.stringify(newData)
    if (onDataChange && dataString !== lastNotifiedData.current) {
      console.log("📤 VisualChartEditorInline: Calling onDataChange")
      lastNotifiedData.current = dataString
      onDataChange(newData)
    }
    isInternalUpdate.current = false
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
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"]
    const colorIndex = data.datasets.length % colors.length
    const newDataset = {
      label: `Serie ${data.datasets.length + 1}`,
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

  // Renderizar gráfico mejorado con mejor diseño
  const renderChart = () => {
    if (data.type === "bar") {
      const allValues = data.datasets.flatMap((d) => d.data)
      const maxValue = Math.max(...allValues, 0)
      const yAxisMax = Math.ceil((maxValue * 1.2) / 10) * 10 || 100
      const yAxisSteps = 5
      const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => (yAxisMax / yAxisSteps) * i)

      return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-center font-bold mb-8 text-xl text-gray-800">{data.title}</h3>

          <div className="relative h-80 ml-20">
            {/* Eje Y con líneas de cuadrícula mejoradas */}
            <div className="absolute top-0 left-0 bottom-0 w-20 -ml-20">
              {yAxisValues.map((value, index) => (
                <div
                  key={index}
                  className="absolute w-full flex items-center justify-end pr-3"
                  style={{ bottom: `${(value / yAxisMax) * 100}%`, transform: "translateY(50%)" }}
                >
                  <span className="text-sm font-medium text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            {/* Líneas horizontales de cuadrícula con mejor estilo */}
            {yAxisValues.map((value, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{
                  bottom: `${(value / yAxisMax) * 100}%`,
                  borderStyle: index === 0 ? "solid" : "dashed",
                  borderWidth: index === 0 ? "2px" : "1px",
                }}
              />
            ))}

            {/* Barras del gráfico agrupadas correctamente */}
            <div className="flex items-end justify-between h-full relative px-6">
              {data.labels.map((label, labelIndex) => (
                <div key={labelIndex} className="flex flex-col items-center flex-1 max-w-32 group">
                  <div className="flex items-end justify-center h-full w-full gap-2">
                    {/* Agrupar las barras por etiqueta */}
                    {data.datasets.map((dataset, datasetIndex) => {
                      const value = dataset.data[labelIndex] || 0
                      const heightPercent = (value / yAxisMax) * 100

                      return (
                        <div key={datasetIndex} className="flex-1 max-w-16">
                          {/* Valor encima de la barra con mejor estilo */}
                          <div className="text-sm font-bold mb-2 text-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {value}
                          </div>

                          {/* Contenedor de altura fija para la barra */}
                          <div className="relative h-56 w-full px-1">
                            {/* Barra con gradiente y efectos hover */}
                            <div
                              className="absolute bottom-0 left-1 right-1 transition-all duration-300 hover:scale-105 cursor-pointer rounded-t-lg shadow-lg"
                              style={{
                                height: `${Math.max(heightPercent, 2)}%`,
                                background: `linear-gradient(180deg, ${dataset.backgroundColor}E6 0%, ${dataset.backgroundColor} 100%)`,
                                minHeight: "8px",
                                boxShadow: `0 4px 12px ${dataset.backgroundColor}40`,
                              }}
                              title={`${dataset.label}: ${value}`}
                              onClick={() => {
                                console.log("Barra clickeada - abriendo editor")
                                setIsEditing(true)
                                setActiveTab("data")
                              }}
                            />

                            {/* Efecto de brillo en hover */}
                            <div
                              className="absolute bottom-0 left-1 right-1 rounded-t-lg opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                              style={{
                                height: `${Math.max(heightPercent, 2)}%`,
                                background: "linear-gradient(180deg, white 0%, transparent 100%)",
                                minHeight: "8px",
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Etiqueta del eje X con mejor tipografía */}
                  <div className="text-sm font-semibold mt-4 text-center text-gray-700 w-full">
                    <div className="truncate px-1">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda mejorada */}
          {data.datasets.length > 1 && (
            <div className="flex justify-center mt-8 space-x-8">
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-3 group cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: dataset.backgroundColor }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {dataset.label}
                  </span>
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
        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-center font-bold mb-8 text-xl text-gray-800">{data.title}</h3>

          <div className="relative h-80 ml-20">
            {/* Eje Y con líneas de cuadrícula */}
            <div className="absolute top-0 left-0 bottom-0 w-20 -ml-20">
              {yAxisValues.map((value, index) => (
                <div
                  key={index}
                  className="absolute w-full flex items-center justify-end pr-3"
                  style={{ bottom: `${(value / yAxisMax) * 100}%`, transform: "translateY(50%)" }}
                >
                  <span className="text-sm font-medium text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            {/* Líneas horizontales de cuadrícula */}
            {yAxisValues.map((value, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{
                  bottom: `${(value / yAxisMax) * 100}%`,
                  borderStyle: index === 0 ? "solid" : "dashed",
                  borderWidth: index === 0 ? "2px" : "1px",
                }}
              />
            ))}

            {/* Contenedor principal del gráfico */}
            <div className="relative w-full h-full overflow-hidden">
              {data.datasets.map((dataset, datasetIndex) => {
                const points = dataset.data.map((value, index) => {
                  const xPercent = (index / (data.labels.length - 1 || 1)) * 100
                  const yPercent = 100 - ((value - minValue) / (yAxisMax - minValue || 1)) * 100
                  return { x: xPercent, y: yPercent, value, index }
                })

                return (
                  <div key={datasetIndex} className="absolute inset-0">
                    {/* Líneas conectoras con gradiente */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`gradient-${datasetIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={dataset.backgroundColor} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={dataset.backgroundColor} stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      {/* Área bajo la línea */}
                      <polygon
                        points={`0,100 ${points.map((p) => `${p.x},${p.y}`).join(" ")} 100,100`}
                        fill={`url(#gradient-${datasetIndex})`}
                        className="opacity-60"
                      />

                      {/* Línea principal */}
                      <polyline
                        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke={dataset.backgroundColor}
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer hover:stroke-width-4 transition-all duration-200 drop-shadow-sm"
                        onClick={() => {
                          console.log("Línea clickeada - abriendo editor")
                          setIsEditing(true)
                          setActiveTab("data")
                        }}
                      />
                    </svg>

                    {/* Puntos y valores mejorados */}
                    {points.map((point, index) => (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      >
                        {/* Valor encima del punto */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-lg border border-gray-200">
                            {point.value}
                          </span>
                        </div>

                        {/* Punto con efectos */}
                        <div
                          className="w-4 h-4 rounded-full border-3 border-white cursor-pointer hover:w-5 hover:h-5 transition-all duration-200 shadow-lg"
                          style={{
                            backgroundColor: dataset.backgroundColor,
                            boxShadow: `0 4px 12px ${dataset.backgroundColor}60`,
                          }}
                          onClick={() => {
                            console.log("Punto clickeado - abriendo editor")
                            setIsEditing(true)
                            setActiveTab("data")
                          }}
                        />

                        {/* Anillo de hover */}
                        <div
                          className="absolute inset-0 w-4 h-4 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-ping"
                          style={{ borderColor: dataset.backgroundColor }}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Etiquetas del eje X */}
              <div className="absolute left-0 right-0 bottom-0 flex justify-between transform translate-y-10 px-3">
                {data.labels.map((label, index) => (
                  <div key={index} className="text-sm font-semibold text-center text-gray-700 flex-1">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          {data.datasets.length > 1 && (
            <div className="flex justify-center mt-12 space-x-8">
              {data.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-3 group cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: dataset.backgroundColor }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {dataset.label}
                  </span>
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
        <div className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-center font-bold mb-8 text-xl text-gray-800">{data.title}</h3>
          <div className="flex justify-center">
            <svg width="280" height="280" className="overflow-visible drop-shadow-lg">
              <defs>
                {data.datasets[0]?.data.map((_, index) => (
                  <filter key={index} id={`shadow-${index}`}>
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
                  </filter>
                ))}
              </defs>

              {data.datasets[0]?.data.map((value, index) => {
                const percentage = value / total
                const angle = percentage * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle += angle

                const startAngleRad = (startAngle * Math.PI) / 180
                const endAngleRad = (endAngle * Math.PI) / 180

                const largeArcFlag = angle > 180 ? 1 : 0
                const x1 = 140 + 100 * Math.cos(startAngleRad)
                const y1 = 140 + 100 * Math.sin(startAngleRad)
                const x2 = 140 + 100 * Math.cos(endAngleRad)
                const y2 = 140 + 100 * Math.sin(endAngleRad)

                const innerRadius = data.type === "doughnut" ? 50 : 0
                const ix1 = 140 + innerRadius * Math.cos(startAngleRad)
                const iy1 = 140 + innerRadius * Math.sin(startAngleRad)
                const ix2 = 140 + innerRadius * Math.cos(endAngleRad)
                const iy2 = 140 + innerRadius * Math.sin(endAngleRad)

                const pathData =
                  data.type === "doughnut"
                    ? `M ${ix1} ${iy1} L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`
                    : `M 140 140 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                const midAngleRad = (startAngleRad + endAngleRad) / 2
                const labelRadius = data.type === "doughnut" ? (innerRadius + 100) / 2 : 100 * 0.7
                const labelX = 140 + labelRadius * Math.cos(midAngleRad)
                const labelY = 140 + labelRadius * Math.sin(midAngleRad)

                const color = Array.isArray(data.datasets[0]?.backgroundColor)
                  ? data.datasets[0]?.backgroundColor[index]
                  : data.datasets[0]?.backgroundColor || "#3B82F6"

                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={color}
                      stroke="white"
                      strokeWidth="3"
                      filter={`url(#shadow-${index})`}
                      className="cursor-pointer hover:opacity-90 transition-all duration-200"
                      style={{
                        transformOrigin: "140px 140px",
                      }}
                      onClick={() => {
                        console.log("Sector clickeado - abriendo editor")
                        setIsEditing(true)
                        setActiveTab("data")
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      className="drop-shadow-sm pointer-events-none"
                    >
                      {Math.round(percentage * 100)}%
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Leyenda mejorada */}
          <div className="flex justify-center mt-8 flex-wrap gap-6">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center space-x-3 group cursor-pointer">
                <div
                  className="w-5 h-5 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-200"
                  style={{
                    backgroundColor: Array.isArray(data.datasets[0]?.backgroundColor)
                      ? data.datasets[0]?.backgroundColor[index]
                      : data.datasets[0]?.backgroundColor || "#3B82F6",
                  }}
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {label}: {data.datasets[0]?.data[index] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-center font-bold mb-8 text-xl text-gray-800">{data.title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium">Vista previa para {data.type}</p>
          </div>
        </div>
      </div>
    )
  }

  // Actualizar datos cuando cambie chartData desde el exterior, pero evitar ciclos
  useEffect(() => {
    if (!isInternalUpdate.current && chartData) {
      const newDataString = JSON.stringify(chartData)
      const currentDataString = JSON.stringify(data)

      if (newDataString !== currentDataString) {
        console.log("📊 VisualChartEditorInline: External data changed, updating internal state")
        setData(chartData)
        lastNotifiedData.current = newDataString
      }
    }
  }, [chartData, data])

  if (!isEditing) {
    return (
      <div className="relative group">
        <div className="relative">
          {renderChart()}

          {/* Overlay de edición mejorado */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
              <Button
                size="lg"
                onClick={() => {
                  console.log("Botón de overlay clickeado - abriendo editor")
                  setIsEditing(true)
                }}
                className="shadow-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 backdrop-blur-sm"
              >
                <Edit3 className="h-5 w-5 mr-2" />
                Editar Gráfico
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Editor de Gráfico</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => {
              console.log("✅ VisualChartEditorInline: Finalizing edit, saving changes")
              if (onDataChange) {
                const dataString = JSON.stringify(data)
                if (dataString !== lastNotifiedData.current) {
                  lastNotifiedData.current = dataString
                  onDataChange(data)
                }
              }
              setIsEditing(false)
            }}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            <Check className="h-4 w-4 mr-2" />
            Finalizar Edición
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Vista previa del gráfico */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">{renderChart()}</div>

        {/* Controles de edición mejorados */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="data" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Settings className="h-4 w-4 mr-2" />
              Datos
            </TabsTrigger>
            <TabsTrigger value="type" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tipo
            </TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Palette className="h-4 w-4 mr-2" />
              Estilo
            </TabsTrigger>
            <TabsTrigger value="labels" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Eye className="h-4 w-4 mr-2" />
              Etiquetas
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de datos */}
          <TabsContent value="data" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título del gráfico</label>
                <Input
                  value={data.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ingresa el título del gráfico"
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Conjuntos de datos
                  </h3>
                  <Button size="sm" onClick={handleAddDataset} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Añadir Serie
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.datasets?.map((dataset, datasetIndex) => (
                    <div key={datasetIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la serie</label>
                          <Input
                            value={dataset.label || ""}
                            onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
                            placeholder="Nombre de la serie"
                            className="bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Color:</label>
                            <input
                              type="color"
                              value={dataset.backgroundColor || "#3B82F6"}
                              onChange={(e) =>
                                handleDatasetColorChange(datasetIndex, "backgroundColor", e.target.value)
                              }
                              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveDataset(datasetIndex)}
                            disabled={data.datasets.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Valores</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {dataset.data?.map((value, valueIndex) => (
                            <div key={valueIndex} className="space-y-1">
                              <label className="block text-xs font-medium text-gray-500">
                                {data.labels?.[valueIndex] || `Valor ${valueIndex + 1}`}
                              </label>
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => handleDataValueChange(datasetIndex, valueIndex, e.target.value)}
                                className="w-full bg-white"
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
          <TabsContent value="type" className="space-y-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de gráfico</label>
              <Select value={data.type || "bar"} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Barras</div>
                        <div className="text-xs text-gray-500">Ideal para comparar categorías</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Líneas</div>
                        <div className="text-xs text-gray-500">Perfecto para mostrar tendencias</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-3">
                      <PieChart className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Circular</div>
                        <div className="text-xs text-gray-500">Muestra proporciones del total</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="doughnut">
                    <div className="flex items-center gap-3">
                      <PieChart className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Dona</div>
                        <div className="text-xs text-gray-500">Circular con centro vacío</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Pestaña de estilo */}
          <TabsContent value="style" className="space-y-6 mt-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Colores del gráfico
              </h3>
              <div className="space-y-4">
                {data.datasets?.map((dataset, datasetIndex) => (
                  <div key={datasetIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm border border-gray-300"
                        style={{ backgroundColor: dataset.backgroundColor }}
                      />
                      <span className="font-medium text-gray-700">{dataset.label || `Serie ${datasetIndex + 1}`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-600">Color:</label>
                      <input
                        type="color"
                        value={dataset.backgroundColor || "#3B82F6"}
                        onChange={(e) => handleDatasetColorChange(datasetIndex, "backgroundColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de etiquetas */}
          <TabsContent value="labels" className="space-y-6 mt-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-indigo-600" />
                  Etiquetas (eje X)
                </h3>
                <Button size="sm" onClick={handleAddLabel} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Añadir
                </Button>
              </div>

              <div className="space-y-3">
                {data.labels?.map((label, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Input
                      value={label}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      className="flex-1 bg-white"
                      placeholder={`Etiqueta ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveLabel(index)}
                      disabled={data.labels.length <= 1}
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

export default VisualChartEditorInline
