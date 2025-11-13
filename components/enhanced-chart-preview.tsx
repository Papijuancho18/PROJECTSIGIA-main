"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

interface EnhancedChartPreviewProps {
  chartData: any
  width?: number
  height?: number
  interactive?: boolean
  onChartClick?: () => void
}

const EnhancedChartPreview: React.FC<EnhancedChartPreviewProps> = ({
  chartData,
  width = 500,
  height = 300,
  interactive = false,
  onChartClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredElement, setHoveredElement] = useState<{ type: string; index: number } | null>(null)
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; text: string } | null>(null)

  // Función para dibujar el gráfico
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !chartData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurar el canvas
    canvas.width = width
    canvas.height = height

    // Establecer fuente
    ctx.font = "12px Inter, system-ui, sans-serif"

    // Obtener datos del gráfico
    const { type = "bar", labels = [], datasets = [], title = "" } = chartData

    // Calcular dimensiones útiles
    const padding = 40
    const legendHeight = 30
    const titleHeight = title ? 30 : 0
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2 - legendHeight - titleHeight

    // Dibujar título si existe
    if (title) {
      ctx.fillStyle = "#333"
      ctx.font = "bold 16px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(title, width / 2, padding / 2 + 10)
      ctx.font = "12px Inter, system-ui, sans-serif"
    }

    // Dibujar diferentes tipos de gráficos
    if (type === "bar") {
      drawBarChart(ctx, labels, datasets, padding, chartWidth, chartHeight, titleHeight)
    } else if (type === "line") {
      drawLineChart(ctx, labels, datasets, padding, chartWidth, chartHeight, titleHeight)
    } else if (type === "pie" || type === "doughnut") {
      drawPieChart(ctx, labels, datasets, padding, chartWidth, chartHeight, titleHeight, type === "doughnut")
    }

    // Dibujar leyenda
    drawLegend(ctx, datasets, padding, width - padding * 2, height - legendHeight)
  }, [chartData, width, height, hoveredElement])

  // Función para dibujar un gráfico de barras
  const drawBarChart = (
    ctx: CanvasRenderingContext2D,
    labels: string[],
    datasets: any[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
    titleHeight: number,
  ) => {
    if (!labels.length || !datasets.length) return

    // Encontrar el valor máximo para escalar el gráfico
    const maxValue = Math.max(
      ...datasets.flatMap((dataset) => dataset.data.filter((value: any) => typeof value === "number")),
      0,
    )
    const roundedMax = Math.ceil(maxValue / 10) * 10 || 100

    // Calcular el ancho de cada grupo de barras
    const groupWidth = chartWidth / labels.length
    const barWidth = groupWidth / (datasets.length + 1)

    // Dibujar ejes y grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Eje Y y líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + titleHeight + chartHeight - (i * chartHeight) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()

      // Etiquetas del eje Y
      ctx.fillStyle = "#6b7280"
      ctx.textAlign = "right"
      ctx.fillText(Math.round((i * roundedMax) / 5).toString(), padding - 5, y + 4)
    }

    // Dibujar barras
    datasets.forEach((dataset, datasetIndex) => {
      const barColor = dataset.backgroundColor || `hsl(${(datasetIndex * 50) % 360}, 70%, 50%)`

      dataset.data.forEach((value: number, index: number) => {
        if (typeof value !== "number") return

        const barHeight = (value / roundedMax) * chartHeight
        const x = padding + index * groupWidth + datasetIndex * barWidth + barWidth / 2
        const y = padding + titleHeight + chartHeight - barHeight

        // Determinar si esta barra está resaltada
        const isHovered = hoveredElement?.type === "bar" && hoveredElement?.index === index * 100 + datasetIndex

        // Dibujar la barra
        ctx.fillStyle = isHovered ? lightenColor(barColor, 20) : barColor
        roundedRect(ctx, x, y, barWidth * 0.8, barHeight, 4)
        ctx.fill()

        // Dibujar el valor encima de la barra
        ctx.fillStyle = "#374151"
        ctx.textAlign = "center"
        ctx.fillText(value.toString(), x + barWidth * 0.4, y - 5)

        // Dibujar etiqueta del eje X
        if (datasetIndex === 0) {
          ctx.fillStyle = "#6b7280"
          ctx.textAlign = "center"
          ctx.fillText(
            labels[index].length > 10 ? labels[index].substring(0, 10) + "..." : labels[index],
            padding + index * groupWidth + groupWidth / 2,
            padding + titleHeight + chartHeight + 20,
          )
        }
      })
    })
  }

  // Función para dibujar un gráfico de líneas
  const drawLineChart = (
    ctx: CanvasRenderingContext2D,
    labels: string[],
    datasets: any[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
    titleHeight: number,
  ) => {
    if (!labels.length || !datasets.length) return

    // Encontrar el valor máximo para escalar el gráfico
    const maxValue = Math.max(
      ...datasets.flatMap((dataset) => dataset.data.filter((value: any) => typeof value === "number")),
      0,
    )
    const roundedMax = Math.ceil(maxValue / 10) * 10 || 100

    // Dibujar ejes y grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Eje Y y líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + titleHeight + chartHeight - (i * chartHeight) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()

      // Etiquetas del eje Y
      ctx.fillStyle = "#6b7280"
      ctx.textAlign = "right"
      ctx.fillText(Math.round((i * roundedMax) / 5).toString(), padding - 5, y + 4)
    }

    // Calcular el ancho entre puntos
    const pointWidth = chartWidth / (labels.length - 1 || 1)

    // Dibujar líneas y puntos
    datasets.forEach((dataset, datasetIndex) => {
      const lineColor = dataset.borderColor || `hsl(${(datasetIndex * 50) % 360}, 70%, 50%)`
      const pointColor = dataset.backgroundColor || lineColor

      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2
      ctx.beginPath()

      dataset.data.forEach((value: number, index: number) => {
        if (typeof value !== "number") return

        const x = padding + index * pointWidth
        const y = padding + titleHeight + chartHeight - (value / roundedMax) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Dibujar etiqueta del eje X
        if (datasetIndex === 0) {
          ctx.fillStyle = "#6b7280"
          ctx.textAlign = "center"
          ctx.fillText(
            labels[index].length > 10 ? labels[index].substring(0, 10) + "..." : labels[index],
            x,
            padding + titleHeight + chartHeight + 20,
          )
        }
      })

      ctx.stroke()

      // Dibujar puntos
      dataset.data.forEach((value: number, index: number) => {
        if (typeof value !== "number") return

        const x = padding + index * pointWidth
        const y = padding + titleHeight + chartHeight - (value / roundedMax) * chartHeight

        // Determinar si este punto está resaltado
        const isHovered = hoveredElement?.type === "point" && hoveredElement?.index === index * 100 + datasetIndex

        ctx.fillStyle = isHovered ? lightenColor(pointColor, 20) : pointColor
        ctx.beginPath()
        ctx.arc(x, y, isHovered ? 7 : 5, 0, Math.PI * 2)
        ctx.fill()

        // Dibujar el valor encima del punto
        ctx.fillStyle = "#374151"
        ctx.textAlign = "center"
        ctx.fillText(value.toString(), x, y - 10)
      })
    })
  }

  // Función para dibujar un gráfico circular
  const drawPieChart = (
    ctx: CanvasRenderingContext2D,
    labels: string[],
    datasets: any[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
    titleHeight: number,
    isDoughnut = false,
  ) => {
    if (!labels.length || !datasets.length) return

    // Usar solo el primer dataset para gráficos circulares
    const dataset = datasets[0]
    const data = dataset.data.filter((value: any) => typeof value === "number")

    // Calcular el total
    const total = data.reduce((sum: number, value: number) => sum + value, 0)

    // Calcular el centro y radio
    const centerX = padding + chartWidth / 2
    const centerY = padding + titleHeight + chartHeight / 2
    const radius = Math.min(chartWidth, chartHeight) / 2 - 10

    // Dibujar sectores
    let startAngle = -Math.PI / 2 // Comenzar desde arriba
    data.forEach((value: number, index: number) => {
      const sliceAngle = (value / total) * (Math.PI * 2)
      const endAngle = startAngle + sliceAngle

      // Determinar si este sector está resaltado
      const isHovered = hoveredElement?.type === "slice" && hoveredElement?.index === index

      // Dibujar sector
      const baseColor = dataset.backgroundColor?.[index] || `hsl(${(index * 50) % 360}, 70%, 50%)`
      ctx.fillStyle = isHovered ? lightenColor(baseColor, 20) : baseColor

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const currentRadius = isHovered ? radius + 5 : radius
      ctx.arc(centerX, centerY, currentRadius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      // Si es un gráfico de dona, crear el hueco central
      if (isDoughnut) {
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }

      // Calcular posición para la etiqueta
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = currentRadius * 0.7
      const labelX = centerX + Math.cos(midAngle) * labelRadius
      const labelY = centerY + Math.sin(midAngle) * labelRadius

      // Dibujar porcentaje en el sector
      const percentage = Math.round((value / total) * 100)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${percentage}%`, labelX, labelY)

      startAngle = endAngle
    })
  }

  // Función para dibujar la leyenda
  const drawLegend = (
    ctx: CanvasRenderingContext2D,
    datasets: any[],
    padding: number,
    chartWidth: number,
    legendY: number,
  ) => {
    if (datasets.length <= 1) return

    const legendItemWidth = chartWidth / Math.min(datasets.length, 4)

    datasets.forEach((dataset, index) => {
      const legendX = padding + (index % 4) * legendItemWidth
      const legendYOffset = Math.floor(index / 4) * 20

      // Determinar si esta leyenda está resaltada
      const isHovered = hoveredElement?.type === "legend" && hoveredElement?.index === index

      // Dibujar cuadrado de color
      ctx.fillStyle = isHovered
        ? lightenColor(dataset.backgroundColor || `hsl(${(index * 50) % 360}, 70%, 50%)`, 20)
        : dataset.backgroundColor || `hsl(${(index * 50) % 360}, 70%, 50%)`
      ctx.fillRect(legendX, legendY + legendYOffset, 10, 10)

      // Dibujar etiqueta
      ctx.fillStyle = "#374151"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(
        dataset.label?.length > 15 ? dataset.label.substring(0, 15) + "..." : dataset.label || `Serie ${index + 1}`,
        legendX + 15,
        legendY + legendYOffset,
      )
    })
  }

  // Función para dibujar un rectángulo con esquinas redondeadas
  const roundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  // Función para aclarar un color
  const lightenColor = (color: string, percent: number) => {
    if (color.startsWith("hsl")) {
      const match = color.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/)
      if (match) {
        const h = Number.parseInt(match[1])
        const s = Number.parseInt(match[2])
        const l = Number.parseInt(match[3])
        return `hsl(${h}, ${s}%, ${Math.min(l + percent, 100)}%)`
      }
    }

    let hex = color.replace("#", "")
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("")
    }

    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    const lightenValue = (value: number) => Math.min(255, value + (255 - value) * (percent / 100))

    const rNew = Math.round(lightenValue(r)).toString(16).padStart(2, "0")
    const gNew = Math.round(lightenValue(g)).toString(16).padStart(2, "0")
    const bNew = Math.round(lightenValue(b)).toString(16).padStart(2, "0")

    return `#${rNew}${gNew}${bNew}`
  }

  // Manejar eventos de mouse simplificado
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Simplificar la detección - solo mostrar tooltip básico
      setTooltipData({
        x: mouseX,
        y: mouseY,
        text: "Haz clic para editar",
      })
    },
    [interactive],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
    setHoveredElement(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return

      console.log("Canvas clickeado!")

      if (onChartClick) {
        onChartClick()
      }
    },
    [interactive, onChartClick],
  )

  // Efecto para dibujar el gráfico
  useEffect(() => {
    drawChart()
  }, [drawChart])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          cursor: interactive ? "pointer" : "default",
          border: interactive ? "2px solid transparent" : "none",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={interactive ? "hover:border-blue-300 transition-colors" : ""}
      />
      {tooltipData && interactive && (
        <div
          className="absolute bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 30}px`,
            transform: "translate(-50%, 0)",
          }}
        >
          {tooltipData.text}
        </div>
      )}
    </div>
  )
}

export default EnhancedChartPreview
export { EnhancedChartPreview }
