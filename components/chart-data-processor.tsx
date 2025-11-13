"use client"

import { useEffect, useState } from "react"
import EnhancedChartPreview from "./enhanced-chart-preview"

interface ChartDataProcessorProps {
  content: string
  onError?: (error: string) => void
}

export function ChartDataProcessor({ content, onError }: ChartDataProcessorProps) {
  const [chartData, setChartData] = useState(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed = JSON.parse(content)

      // Procesar y normalizar los datos
      const processedData = {
        type: parsed.type || "bar",
        title: parsed.title || "Gráfico",
        labels: parsed.labels || ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"],
        datasets: parsed.datasets
          ? parsed.datasets.map((dataset, index) => {
              // Procesar colores de fondo
              let backgroundColor = ["#4CAF50", "#1565C0", "#FFC107", "#F44336"]
              if (dataset.backgroundColor) {
                if (Array.isArray(dataset.backgroundColor)) {
                  backgroundColor = dataset.backgroundColor.map((color) =>
                    color.includes("rgba") ? convertRgbaToHex(color) : color,
                  )
                } else {
                  // Si es un solo color, crear variaciones
                  backgroundColor = parsed.labels.map((_, i) => {
                    if (dataset.backgroundColor.includes("rgba")) {
                      return convertRgbaToHex(dataset.backgroundColor)
                    }
                    return generateColorVariation(dataset.backgroundColor, i)
                  })
                }
              }

              // Procesar colores de borde
              let borderColor = backgroundColor
              if (dataset.borderColor) {
                if (Array.isArray(dataset.borderColor)) {
                  borderColor = dataset.borderColor.map((color) =>
                    color.includes("rgba") ? convertRgbaToHex(color) : color,
                  )
                } else {
                  borderColor = [dataset.borderColor]
                }
              }

              return {
                label: dataset.label || `Serie ${index + 1}`,
                data: dataset.data || [65, 45, 80, 30],
                backgroundColor,
                borderColor,
                borderWidth: dataset.borderWidth || 2,
              }
            })
          : [
              {
                label: "Datos",
                data: [65, 45, 80, 30],
                backgroundColor: ["#4CAF50", "#1565C0", "#FFC107", "#F44336"],
                borderColor: ["#4CAF50", "#1565C0", "#FFC107", "#F44336"],
                borderWidth: 2,
              },
            ],
      }

      setChartData(processedData)
      setError(null)
    } catch (err) {
      const errorMessage = `Error al procesar datos del gráfico: ${err.message}`
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [content, onError])

  // Función para convertir rgba a hex
  const convertRgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?$$([^)]+)$$/)
    if (!match) return rgba

    const [r, g, b] = match[1].split(",").map((v) => Number.parseInt(v.trim()))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // Función para generar variaciones de color
  const generateColorVariation = (baseColor: string, index: number): string => {
    if (baseColor.startsWith("#")) {
      // Convertir hex a HSL y variar el matiz
      const hsl = hexToHsl(baseColor)
      const newHue = (hsl.h + index * 60) % 360
      return `hsl(${newHue}, ${hsl.s}%, ${hsl.l}%)`
    }
    return baseColor
  }

  // Función para convertir hex a HSL
  const hexToHsl = (hex: string) => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h,
      s,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  if (error) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-red-50 text-red-700">
        <p className="font-medium">Error al procesar el gráfico</p>
        <p className="text-sm mt-1">{error}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium">Ver datos originales</summary>
          <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">{content}</pre>
        </details>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-600">Procesando datos del gráfico...</p>
      </div>
    )
  }

  return (
    <div className="my-4 p-4 border rounded-lg bg-gray-50">
      <EnhancedChartPreview chartData={chartData} width={500} height={350} interactive={true} />
    </div>
  )
}
