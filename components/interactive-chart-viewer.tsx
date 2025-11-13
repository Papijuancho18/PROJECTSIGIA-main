"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Download, Eye, EyeOff, Palette, BarChart3, Zap } from "lucide-react"

interface InteractiveChartViewerProps {
  chartData: any
  width?: number
  height?: number
  onDataChange?: (newData: any) => void
}

const specificColors = ["#3EBD93", "#334E68", "#FFCA3A", "#E63946", "#6F42C1", "#FD7E14"]

export function InteractiveChartViewer({
  chartData,
  width = 400,
  height = 300,
  onDataChange,
}: InteractiveChartViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Estados para interactividad
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredElement, setHoveredElement] = useState<any>(null)
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [showTooltip, setShowTooltip] = useState(true)
  const [tooltipData, setTooltipData] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Estados para personalización
  const [colorScheme, setColorScheme] = useState("default")
  const [chartStyle, setChartStyle] = useState("modern")
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showValues, setShowValues] = useState(true)

  // Estados para zoom y pan
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Esquemas de colores predefinidos
  const colorSchemes = {
    default: specificColors,
    ocean: ["#0077BE", "#00A8CC", "#7FB069", "#FFD23F", "#FF6B35", "#EE5A52"],
    sunset: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
    forest: ["#2D5016", "#61892F", "#86C232", "#C5E99B", "#F4E04D", "#F4A261"],
    corporate: ["#1f2937", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"],
  }

  // Función para obtener colores del esquema seleccionado
  const getColors = useCallback(() => {
    return colorSchemes[colorScheme] || colorSchemes.default
  }, [colorScheme])

  // Función de animación
  const animate = useCallback(() => {
    if (!isAnimating) return

    setAnimationProgress((prev) => {
      const newProgress = prev + 0.02
      if (newProgress >= 1) {
        setIsAnimating(false)
        return 1
      }
      return newProgress
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating])

  // Iniciar animación
  const startAnimation = () => {
    setAnimationProgress(0)
    setIsAnimating(true)
  }

  // Detener animación
  const stopAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Resetear animación
  const resetAnimation = () => {
    stopAnimation()
    setAnimationProgress(0)
  }

  // Efecto para la animación
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animate])

  // Función para detectar elementos bajo el cursor
  const getElementAtPosition = useCallback(
    (x: number, y: number) => {
      if (!chartData || !chartData.datasets) return null

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return null

      const canvasX = x - rect.left
      const canvasY = y - rect.top

      // Configuración específica para detección
      const margin = { top: 60, right: 40, bottom: 100, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      const labels =
        chartData.labels.length > 0 ? chartData.labels : ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"]
      const data = chartData.datasets[0]?.data || [65, 45, 80, 30]
      const maxValue = Math.max(...data) * 1.2
      const barWidth = (chartWidth / labels.length) * 0.6

      // Verificar si el click está dentro de alguna barra
      for (let i = 0; i < labels.length; i++) {
        const value = data[i] || 0
        const barHeight = (value / maxValue) * chartHeight
        const barX = margin.left + (i + 0.5) * (chartWidth / labels.length) - barWidth / 2
        const barY = height - margin.bottom - barHeight

        if (canvasX >= barX && canvasX <= barX + barWidth && canvasY >= barY && canvasY <= barY + barHeight) {
          return {
            type: "bar",
            datasetIndex: 0,
            dataIndex: i,
            value: value,
            label: labels[i],
            x: canvasX,
            y: canvasY,
          }
        }
      }

      return null
    },
    [chartData, width, height],
  )

  // Manejadores de eventos del mouse
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setMousePosition({ x: event.clientX, y: event.clientY })

      if (isDragging) {
        const deltaX = x - dragStart.x
        const deltaY = y - dragStart.y
        setPanOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))
        setDragStart({ x, y })
        return
      }

      const element = getElementAtPosition(x, y)
      setHoveredElement(element)

      if (element && showTooltip) {
        setTooltipData({
          ...element,
          x: event.clientX,
          y: event.clientY,
        })
      } else {
        setTooltipData(null)
      }
    },
    [isDragging, dragStart, getElementAtPosition, showTooltip],
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setIsDragging(true)
      setDragStart({ x, y })

      const element = getElementAtPosition(x, y)
      setSelectedElement(element)
    },
    [getElementAtPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev * delta)))
  }, [])

  // Función de renderizado mejorada
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !chartData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas con DPR
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // Aplicar zoom y pan
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoomLevel, zoomLevel)

    // Obtener colores del esquema seleccionado
    const colors = getColors()

    // Renderizar según el tipo de gráfico
    switch (chartData.type) {
      case "bar":
        renderInteractiveBarChart(ctx, colors)
        break
      case "line":
        renderInteractiveLineChart(ctx, colors)
        break
      case "pie":
        renderInteractivePieChart(ctx, colors)
        break
      default:
        renderInteractiveBarChart(ctx, colors)
    }

    ctx.restore()

    // Renderizar elementos de UI (leyenda, etc.)
    if (showLegend) {
      renderLegend(ctx, colors)
    }
  }, [
    chartData,
    width,
    height,
    animationProgress,
    hoveredElement,
    selectedElement,
    colorScheme,
    showGrid,
    showLegend,
    showValues,
    zoomLevel,
    panOffset,
    getColors,
  ])

  // Función para renderizar gráfico de barras interactivo
  const renderInteractiveBarChart = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    // Configuración específica para el gráfico de barras
    const margin = { top: 60, right: 40, bottom: 100, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Validar dimensiones
    if (chartWidth <= 0 || chartHeight <= 0) {
      console.warn("Invalid chart dimensions")
      return
    }

    // Obtener datos reales del chartData con validaciones
    const labels =
      chartData.labels && chartData.labels.length > 0
        ? chartData.labels
        : ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"]

    const dataset =
      chartData.datasets && chartData.datasets[0] ? chartData.datasets[0] : { data: [65, 45, 80, 30], label: "Datos" }

    const data = dataset.data || [65, 45, 80, 30]

    // Validar y limpiar datos
    const validData = data.map((value) => {
      const num = Number(value)
      return isFinite(num) && num >= 0 ? num : 0
    })

    const maxValue = Math.max(...validData) * 1.2 || 100 // Fallback si todos los valores son 0

    // Validar maxValue
    if (!isFinite(maxValue) || maxValue <= 0) {
      console.warn("Invalid maxValue, using fallback")
      return
    }

    const barWidth = (chartWidth / labels.length) * 0.6 // 60% del espacio disponible para cada barra

    // Limpiar el canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Dibujar título centrado
    ctx.fillStyle = "#333333"
    ctx.font = "bold 18px Arial"
    ctx.textAlign = "center"
    ctx.fillText(chartData.title || "Gráfico de Barras", width / 2, 30)

    // Dibujar ejes
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 2
    ctx.beginPath()
    // Eje Y (vertical)
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    // Eje X (horizontal)
    ctx.moveTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.stroke()

    // Dibujar grid horizontal si está habilitado
    if (showGrid) {
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 1
      const gridLines = 5
      for (let i = 1; i <= gridLines; i++) {
        const y = margin.top + (i / gridLines) * chartHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(width - margin.right, y)
        ctx.stroke()
      }
    }

    // Dibujar etiquetas del eje Y (valores)
    ctx.fillStyle = "#666666"
    ctx.font = "12px Arial"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const value = Math.round((maxValue / ySteps) * i)
      const y = height - margin.bottom - (i / ySteps) * chartHeight
      ctx.fillText(value.toString(), margin.left - 10, y)
    }

    // Dibujar barras con animación
    labels.forEach((label, i) => {
      const value = validData[i] || 0
      const animatedValue = value * animationProgress

      // Validar valores antes de calcular posiciones
      if (!isFinite(animatedValue) || !isFinite(maxValue) || maxValue === 0) {
        return // Saltar esta barra si los valores no son válidos
      }

      const barHeight = (animatedValue / maxValue) * chartHeight
      const x = margin.left + (i + 0.5) * (chartWidth / labels.length) - barWidth / 2
      const y = height - margin.bottom - barHeight

      // Validar posiciones finales
      if (!isFinite(x) || !isFinite(y) || !isFinite(barHeight) || barHeight < 0) {
        return // Saltar esta barra si las posiciones no son válidas
      }

      // Color específico para cada barra
      let color = colors[i % colors.length]

      // Efectos hover y selección
      if (hoveredElement?.dataIndex === i) {
        color = adjustColorBrightness(color, 20)
      }
      if (selectedElement?.dataIndex === i) {
        color = adjustColorBrightness(color, -20)
      }

      // Dibujar barra con estilo moderno
      if (chartStyle === "modern" && barHeight > 0) {
        // Validar coordenadas del gradiente
        const gradientY1 = y
        const gradientY2 = y + barHeight

        if (isFinite(gradientY1) && isFinite(gradientY2) && gradientY2 > gradientY1) {
          try {
            const gradient = ctx.createLinearGradient(0, gradientY1, 0, gradientY2)
            gradient.addColorStop(0, color)
            gradient.addColorStop(1, adjustColorBrightness(color, -30))
            ctx.fillStyle = gradient
          } catch (error) {
            console.warn("Error creating gradient, using solid color:", error)
            ctx.fillStyle = color
          }
        } else {
          ctx.fillStyle = color
        }
      } else {
        ctx.fillStyle = color
      }

      // Barra con bordes redondeados - solo si las dimensiones son válidas
      if (barWidth > 0 && barHeight > 0) {
        try {
          roundedRect(ctx, x, y, barWidth, barHeight, 4)
          ctx.fill()

          // Borde blanco
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()
        } catch (error) {
          console.warn("Error drawing bar:", error)
        }
      }

      // Mostrar valores encima de las barras si está habilitado
      if (showValues && animationProgress > 0.8 && isFinite(animatedValue)) {
        ctx.fillStyle = "#333333"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        try {
          ctx.fillText(Math.round(animatedValue).toString(), x + barWidth / 2, y - 5)
        } catch (error) {
          console.warn("Error drawing text:", error)
        }
      }
    })

    // Dibujar etiquetas del eje X (categorías)
    ctx.fillStyle = "#666666"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    labels.forEach((label, i) => {
      const x = margin.left + (i + 0.5) * (chartWidth / labels.length)
      ctx.fillText(label, x, height - margin.bottom + 10)
    })

    // Dibujar leyenda debajo del gráfico
    if (showLegend) {
      const legendY = height - 40
      const legendItemWidth = chartWidth / labels.length
      const legendStartX = margin.left

      ctx.font = "11px Arial"
      ctx.textAlign = "center"

      labels.forEach((label, i) => {
        const x = legendStartX + (i + 0.5) * legendItemWidth
        const color = colors[i % colors.length]

        // Cuadrado de color
        ctx.fillStyle = color
        ctx.fillRect(x - 8, legendY - 8, 16, 12)

        // Borde del cuadrado
        ctx.strokeStyle = "#333333"
        ctx.lineWidth = 1
        ctx.strokeRect(x - 8, legendY - 8, 16, 12)

        // Texto de la leyenda
        ctx.fillStyle = "#333333"
        ctx.fillText(label, x, legendY + 15)
      })
    }

    // Título de los ejes
    ctx.fillStyle = "#666666"
    ctx.font = "12px Arial"

    // Título eje Y
    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Valores", 0, 0)
    ctx.restore()

    // Título eje X
    ctx.textAlign = "center"
    ctx.fillText("Categorías", width / 2, height - 15)
  }

  // Función para renderizar gráfico de líneas interactivo
  const renderInteractiveLineChart = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    if (!chartData.labels || !chartData.datasets) return

    const margin = { top: 40, right: 30, bottom: 50, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Validar dimensiones
    if (chartWidth <= 0 || chartHeight <= 0) return

    // Validar y limpiar datos
    const allValues = chartData.datasets.flatMap((d) => d.data).filter((v) => isFinite(Number(v)))
    if (allValues.length === 0) return

    const maxValue = Math.max(...allValues) * 1.1

    if (!isFinite(maxValue) || maxValue <= 0) return

    // Renderizar grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (i / 5) * chartHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(width - margin.right, y)
        ctx.stroke()
      }
    }

    chartData.datasets.forEach((dataset, datasetIndex) => {
      const color = colors[datasetIndex % colors.length]

      // Renderizar área bajo la línea con animación
      if (chartStyle === "modern") {
        const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom)
        gradient.addColorStop(0, color + "40")
        gradient.addColorStop(1, color + "10")

        ctx.fillStyle = gradient
        ctx.beginPath()

        dataset.data.forEach((value, i) => {
          const x = margin.left + i * (chartWidth / (chartData.labels.length - 1))
          const animatedValue = value * animationProgress
          const y = height - margin.bottom - (animatedValue / maxValue) * chartHeight

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.lineTo(
          margin.left + (chartData.labels.length - 1) * (chartWidth / (chartData.labels.length - 1)),
          height - margin.bottom,
        )
        ctx.lineTo(margin.left, height - margin.bottom)
        ctx.closePath()
        ctx.fill()
      }

      // Renderizar línea
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()

      dataset.data.forEach((value, i) => {
        const x = margin.left + i * (chartWidth / (chartData.labels.length - 1))
        const animatedValue = value * animationProgress
        const y = height - margin.bottom - (animatedValue / maxValue) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Renderizar puntos
      dataset.data.forEach((value, i) => {
        const x = margin.left + i * (chartWidth / (chartData.labels.length - 1))
        const animatedValue = value * animationProgress
        const y = height - margin.bottom - (animatedValue / maxValue) * chartHeight

        // Punto con efecto hover
        let pointRadius = 6
        if (hoveredElement?.datasetIndex === datasetIndex && hoveredElement?.dataIndex === i) {
          pointRadius = 8
        }

        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.stroke()

        // Mostrar valores
        if (showValues && animationProgress > 0.8) {
          ctx.fillStyle = "#333"
          ctx.font = "bold 10px Arial"
          ctx.textAlign = "center"
          ctx.fillText(Math.round(animatedValue).toString(), x, y - 15)
        }
      })
    })
  }

  // Función para renderizar gráfico circular interactivo
  const renderInteractivePieChart = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    if (!chartData.datasets || !chartData.datasets[0]) return

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    const dataset = chartData.datasets[0]

    // Validar y limpiar datos
    const validData = dataset.data.map((value) => {
      const num = Number(value)
      return isFinite(num) && num >= 0 ? num : 0
    })

    const total = validData.reduce((sum, val) => sum + val, 0)

    if (!isFinite(total) || total <= 0) return

    let startAngle = -Math.PI / 2

    dataset.data.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI * animationProgress
      const endAngle = startAngle + sliceAngle
      const middleAngle = startAngle + sliceAngle / 2

      // Color con efecto hover
      let color = colors[i % colors.length]
      let currentRadius = radius

      if (hoveredElement?.dataIndex === i) {
        currentRadius = radius + 10
        color = adjustColorBrightness(color, 20)
      }

      // Renderizar sector
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, currentRadius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      // Borde
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 3
      ctx.stroke()

      // Etiquetas y valores
      if (showValues && animationProgress > 0.8) {
        const labelRadius = currentRadius * 0.7
        const labelX = centerX + Math.cos(middleAngle) * labelRadius
        const labelY = centerY + Math.sin(middleAngle) * labelRadius

        const percentage = Math.round((value / total) * 100)

        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${percentage}%`, labelX, labelY)
      }

      startAngle = endAngle
    })
  }

  // Función para renderizar leyenda
  const renderLegend = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    if (!chartData.datasets) return

    const legendY = height - 30
    let legendX = 20

    ctx.font = "12px Arial"
    ctx.textAlign = "left"

    chartData.datasets.forEach((dataset, i) => {
      const color = colors[i % colors.length]

      // Cuadrado de color
      ctx.fillStyle = color
      ctx.fillRect(legendX, legendY - 8, 12, 12)

      // Texto
      ctx.fillStyle = "#333"
      ctx.fillText(dataset.label || `Serie ${i + 1}`, legendX + 20, legendY)

      legendX += ctx.measureText(dataset.label || `Serie ${i + 1}`).width + 50
    })
  }

  // Funciones auxiliares
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

  const adjustColorBrightness = (color: string, amount: number) => {
    try {
      if (!color || typeof color !== "string") {
        return "#000000" // Color por defecto
      }

      const usePound = color[0] === "#"
      const col = usePound ? color.slice(1) : color

      if (col.length !== 6) {
        return color // Retornar color original si no es válido
      }

      const num = Number.parseInt(col, 16)

      if (!isFinite(num)) {
        return color
      }

      let r = (num >> 16) + amount
      let g = ((num >> 8) & 0x00ff) + amount
      let b = (num & 0x0000ff) + amount

      r = Math.max(0, Math.min(255, r))
      g = Math.max(0, Math.min(255, g))
      b = Math.max(0, Math.min(255, b))

      return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
    } catch (error) {
      console.warn("Error adjusting color brightness:", error)
      return color || "#000000"
    }
  }

  // Función para descargar el gráfico
  const downloadChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `chart-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // Renderizar cuando cambien las dependencias
  useEffect(() => {
    renderChart()
  }, [renderChart])

  return (
    <div className="space-y-4">
      {/* Controles principales */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isAnimating ? "default" : "outline"}
            onClick={isAnimating ? stopAnimation : startAnimation}
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isAnimating ? "Pausar" : "Animar"}
          </Button>

          <Button size="sm" variant="outline" onClick={resetAnimation}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <Button size="sm" variant="outline" onClick={downloadChart}>
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </div>

        <div className="flex gap-2">
          <Badge variant={showTooltip ? "default" : "secondary"}>
            <button onClick={() => setShowTooltip(!showTooltip)} className="flex items-center gap-1">
              {showTooltip ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Tooltip
            </button>
          </Badge>

          <Badge variant={showGrid ? "default" : "secondary"}>
            <button onClick={() => setShowGrid(!showGrid)} className="flex items-center gap-1">
              Grid
            </button>
          </Badge>

          <Badge variant={showLegend ? "default" : "secondary"}>
            <button onClick={() => setShowLegend(!showLegend)} className="flex items-center gap-1">
              Leyenda
            </button>
          </Badge>
        </div>
      </div>

      {/* Controles de personalización */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">Colores</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(colorSchemes).map((scheme) => (
              <Button
                key={scheme}
                size="sm"
                variant={colorScheme === scheme ? "default" : "outline"}
                onClick={() => setColorScheme(scheme)}
                className="capitalize"
              >
                <Palette className="h-4 w-4 mr-1" />
                {scheme}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartStyle === "modern" ? "default" : "outline"}
              onClick={() => setChartStyle("modern")}
            >
              <Zap className="h-4 w-4 mr-1" />
              Moderno
            </Button>
            <Button
              size="sm"
              variant={chartStyle === "classic" ? "default" : "outline"}
              onClick={() => setChartStyle("classic")}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Clásico
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-2">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Zoom:</label>
            <Input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number.parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-500">{Math.round(zoomLevel * 100)}%</span>
          </div>
        </TabsContent>
      </Tabs>

      {/* Canvas del gráfico */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="border rounded cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              style={{ touchAction: "none" }}
            />

            {/* Tooltip */}
            {tooltipData && (
              <div
                className="absolute bg-black text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
                style={{
                  left: tooltipData.x - (canvasRef.current?.getBoundingClientRect().left || 0) + 10,
                  top: tooltipData.y - (canvasRef.current?.getBoundingClientRect().top || 0) - 30,
                }}
              >
                <div>
                  {tooltipData.label}: {tooltipData.value}
                </div>
              </div>
            )}

            {/* Indicador de progreso de animación */}
            {isAnimating && (
              <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
                Animando... {Math.round(animationProgress * 100)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del elemento seleccionado */}
      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Elemento Seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>
                <strong>Etiqueta:</strong> {selectedElement.label}
              </div>
              <div>
                <strong>Valor:</strong> {selectedElement.value}
              </div>
              <div>
                <strong>Tipo:</strong> {selectedElement.type}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InteractiveChartViewer
