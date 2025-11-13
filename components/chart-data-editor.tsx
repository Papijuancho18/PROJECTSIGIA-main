"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut" | "scatter" | "combo"
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
    borderWidth: number
  }[]
  scatterData?: { x: number; y: number; label: string }[]
  comboSeries?: { name: string; type: "bar" | "line"; data: number[]; color: string }[]
}

interface ChartDataEditorProps {
  initialData: ChartData
  onUpdate: (data: ChartData) => void
}

const ChartDataEditor: React.FC<ChartDataEditorProps> = ({ initialData, onUpdate }) => {
  const [chartData, setChartData] = useState<ChartData>(initialData)

  const updateChartType = (type: ChartData["type"]) => {
    setChartData((prev) => ({ ...prev, type }))
  }

  const updateLabel = (index: number, value: string) => {
    setChartData((prev) => ({
      ...prev,
      labels: prev.labels.map((label, i) => (i === index ? value : label)),
    }))
  }

  const addLabel = () => {
    setChartData((prev) => ({
      ...prev,
      labels: [...prev.labels, `Label ${prev.labels.length + 1}`],
    }))
  }

  const removeLabel = (index: number) => {
    setChartData((prev) => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index),
    }))
  }

  const updateDataset = (datasetIndex: number, field: string, value: string | number | string[]) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) => (i === datasetIndex ? { ...dataset, [field]: value } : dataset)),
    }))
  }

  const addDataset = () => {
    const newDataset = {
      label: `Dataset ${chartData.datasets.length + 1}`,
      data: chartData.labels.map(() => 0),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
      borderWidth: 1,
    }
    setChartData((prev) => ({
      ...prev,
      datasets: [...prev.datasets, newDataset],
    }))
  }

  const removeDataset = (index: number) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.filter((_, i) => i !== index),
    }))
  }

  const updateDataPoint = (datasetIndex: number, dataIndex: number, value: number) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) =>
        i === datasetIndex
          ? {
              ...dataset,
              data: dataset.data.map((dataPoint, j) => (j === dataIndex ? value : dataPoint)),
            }
          : dataset,
      ),
    }))
  }

  const addDataPoint = () => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset) => ({
        ...dataset,
        data: [...dataset.data, 0],
      })),
    }))
  }

  const addScatterPoint = () => {
    const newPoint = { x: 0, y: 0, label: `Punto ${chartData.scatterData?.length || 0 + 1}` }
    setChartData((prev) => ({
      ...prev,
      scatterData: [...(prev.scatterData || []), newPoint],
    }))
  }

  const updateScatterPoint = (index: number, field: "x" | "y" | "label", value: string | number) => {
    setChartData((prev) => ({
      ...prev,
      scatterData: prev.scatterData?.map((point, i) => (i === index ? { ...point, [field]: value } : point)) || [],
    }))
  }

  const removeScatterPoint = (index: number) => {
    setChartData((prev) => ({
      ...prev,
      scatterData: prev.scatterData?.filter((_, i) => i !== index) || [],
    }))
  }

  const addComboSeries = () => {
    const newSeries = {
      name: `Serie ${chartData.comboSeries?.length || 0 + 1}`,
      type: "bar" as "bar" | "line",
      data: [0],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }
    setChartData((prev) => ({
      ...prev,
      comboSeries: [...(prev.comboSeries || []), newSeries],
    }))
  }

  const updateComboSeries = (seriesIndex: number, field: string, value: any) => {
    setChartData((prev) => ({
      ...prev,
      comboSeries:
        prev.comboSeries?.map((series, i) => (i === seriesIndex ? { ...series, [field]: value } : series)) || [],
    }))
  }

  const removeComboSeries = (seriesIndex: number) => {
    setChartData((prev) => ({
      ...prev,
      comboSeries: prev.comboSeries?.filter((_, i) => i !== seriesIndex) || [],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tipo de Gráfico</h3>
        <select
          value={chartData.type}
          onChange={(e) => updateChartType(e.target.value as ChartData["type"])}
          className="mt-2 px-4 py-2 border rounded"
        >
          <option value="bar">Barras</option>
          <option value="line">Línea</option>
          <option value="pie">Pastel</option>
          <option value="doughnut">Dona</option>
          <option value="scatter">Gráfico de Dispersión</option>
          <option value="combo">Gráfico Combinado</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Etiquetas</h3>
          <Button onClick={addLabel} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Añadir Etiqueta
          </Button>
        </div>
        {chartData.labels.map((label, index) => (
          <div key={index} className="flex gap-2 items-center p-3 border rounded">
            <Input
              placeholder={`Etiqueta ${index + 1}`}
              value={label}
              onChange={(e) => updateLabel(index, e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => removeLabel(index)} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Conjuntos de Datos</h3>
          <Button onClick={addDataset} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Añadir Conjunto
          </Button>
        </div>
        {chartData.datasets.map((dataset, datasetIndex) => (
          <div key={datasetIndex} className="p-4 border rounded space-y-3">
            <Input
              placeholder="Nombre del conjunto de datos"
              value={dataset.label}
              onChange={(e) => updateDataset(datasetIndex, "label", e.target.value)}
            />
            <div className="flex gap-2">
              <label className="text-sm">Color de fondo:</label>
              <input
                type="color"
                value={dataset.backgroundColor}
                onChange={(e) => updateDataset(datasetIndex, "backgroundColor", e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <label className="text-sm">Color del borde:</label>
              <input
                type="color"
                value={dataset.borderColor}
                onChange={(e) => updateDataset(datasetIndex, "borderColor", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">Ancho del borde:</label>
              <Input
                type="number"
                value={dataset.borderWidth}
                onChange={(e) => updateDataset(datasetIndex, "borderWidth", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {dataset.data.map((dataPoint, dataIndex) => (
                <Input
                  key={dataIndex}
                  type="number"
                  value={dataPoint}
                  onChange={(e) => updateDataPoint(datasetIndex, dataIndex, Number.parseFloat(e.target.value))}
                  className="w-20"
                />
              ))}
              <Button onClick={addDataPoint} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => removeDataset(datasetIndex)} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {chartData.type === "doughnut" && (
        <div>
          <p>Configuración específica para gráficos de dona.</p>
        </div>
      )}

      {chartData.type === "scatter" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Puntos de Dispersión</h4>
            <Button onClick={addScatterPoint} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Añadir Punto
            </Button>
          </div>
          {chartData.scatterData?.map((point, index) => (
            <div key={index} className="flex gap-2 items-center p-3 border rounded">
              <Input
                placeholder="Etiqueta"
                value={point.label}
                onChange={(e) => updateScatterPoint(index, "label", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="X"
                value={point.x}
                onChange={(e) => updateScatterPoint(index, "x", Number.parseFloat(e.target.value) || 0)}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Y"
                value={point.y}
                onChange={(e) => updateScatterPoint(index, "y", Number.parseFloat(e.target.value) || 0)}
                className="w-20"
              />
              <Button onClick={() => removeScatterPoint(index)} variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {chartData.type === "combo" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Series de Datos</h4>
            <Button onClick={addComboSeries} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Añadir Serie
            </Button>
          </div>
          {chartData.comboSeries?.map((series, seriesIndex) => (
            <div key={seriesIndex} className="p-4 border rounded space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Nombre de la serie"
                  value={series.name}
                  onChange={(e) => updateComboSeries(seriesIndex, "name", e.target.value)}
                  className="flex-1"
                />
                <select
                  value={series.type}
                  onChange={(e) => updateComboSeries(seriesIndex, "type", e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="bar">Barras</option>
                  <option value="line">Línea</option>
                </select>
                <input
                  type="color"
                  value={series.color}
                  onChange={(e) => updateComboSeries(seriesIndex, "color", e.target.value)}
                  className="w-10 h-10 border rounded"
                />
                <Button onClick={() => removeComboSeries(seriesIndex)} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {series.data.map((value, dataIndex) => (
                  <Input
                    key={dataIndex}
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const newData = [...series.data]
                      newData[dataIndex] = Number.parseFloat(e.target.value) || 0
                      updateComboSeries(seriesIndex, "data", newData)
                    }}
                    className="w-20"
                  />
                ))}
                <Button
                  onClick={() => {
                    const newData = [...series.data, 0]
                    updateComboSeries(seriesIndex, "data", newData)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => onUpdate(chartData)}>Actualizar Gráfico</Button>
    </div>
  )
}

export { ChartDataEditor }
