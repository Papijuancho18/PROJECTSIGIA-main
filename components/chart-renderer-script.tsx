"use client"

import { useEffect } from "react"

interface ChartRendererScriptProps {
  chartId: string
  chartData: any
}

export default function ChartRendererScript({ chartId, chartData }: ChartRendererScriptProps) {
  useEffect(() => {
    // Función para renderizar todos los gráficos en el documento
    const renderAllCharts = () => {
      console.log("Renderizando todos los gráficos en el documento...")

      // Buscar todos los contenedores de gráficos
      const chartContainers = document.querySelectorAll(".embedded-chart-container")
      console.log(`Encontrados ${chartContainers.length} contenedores de gráficos`)

      chartContainers.forEach((container, index) => {
        try {
          // Obtener datos del gráfico
          const chartDataStr = container.getAttribute("data-chart")
          if (!chartDataStr) {
            console.warn("Contenedor sin datos de gráfico:", container)
            return
          }

          const chartData = JSON.parse(chartDataStr)
          console.log(`Renderizando gráfico #${index}:`, chartData.type)

          // Limpiar el contenedor de visualización
          const previewContainer = container.querySelector(".chart-preview")
          if (!previewContainer) {
            console.warn("Contenedor sin elemento de vista previa")
            return
          }

          previewContainer.innerHTML = ""

          // Crear un canvas para renderizar el gráfico manualmente
          const canvas = document.createElement("canvas")
          canvas.width = previewContainer.clientWidth || 300
          canvas.height = previewContainer.clientHeight || 200
          previewContainer.appendChild(canvas)

          const ctx = canvas.getContext("2d")
          if (ctx) {
            renderChartToCanvas(ctx, chartData, canvas.width, canvas.height)
          } else {
            console.warn("No se pudo obtener el contexto 2D del canvas")
          }
        } catch (error) {
          console.error("Error al renderizar gráfico incrustado:", error)
        }
      })
    }

    // Función para renderizar un gráfico en un canvas
    const renderChartToCanvas = (ctx, chartData, width, height) => {
      // Determinar qué tipo de gráfico renderizar
      switch (chartData.type) {
        case "bar":
          renderBarChart(ctx, chartData, width, height)
          break
        case "line":
          renderLineChart(ctx, chartData, width, height)
          break
        case "pie":
        case "donut":
          renderPieChart(ctx, chartData, width, height, chartData.type === "donut")
          break
        default:
          renderBarChart(ctx, chartData, width, height)
      }
    }

    // Funciones para renderizar diferentes tipos de gráficos
    const renderBarChart = (ctx, data, width, height) => {
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // Limpiar el canvas
      ctx.clearRect(0, 0, width, height)

      // Dibujar título
      ctx.fillStyle = "#333"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(data.title || "Gráfico de barras", width / 2, 20)

      // Encontrar el valor máximo para escalar
      const maxValue = Math.max(...data.datasets.flatMap((d) => d.data)) * 1.1 || 100

      // Dibujar ejes
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.strokeStyle = "#ccc"
      ctx.stroke()

      // Dibujar etiquetas del eje Y
      ctx.textAlign = "right"
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"

      // Dibujar 5 marcas en el eje Y
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * chartHeight) / 5
        const value = Math.round((maxValue * i) / 5)
        ctx.fillText(value.toString(), padding - 5, y + 3)

        // Líneas de cuadrícula horizontales
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.strokeStyle = "#eee"
        ctx.stroke()
      }

      // Dibujar etiquetas del eje X
      ctx.textAlign = "center"
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"

      const barWidth = chartWidth / data.labels.length / (data.datasets.length + 0.5)

      // Dibujar barras y leyenda
      data.datasets.forEach((dataset, datasetIndex) => {
        const color = dataset.backgroundColor || `hsl(${datasetIndex * 60}, 70%, 50%)`

        dataset.data.forEach((value, i) => {
          const x = padding + (i * chartWidth) / data.labels.length + (datasetIndex + 0.5) * barWidth
          // Calcular altura de la barra proporcional al valor
          const barHeight = (value / maxValue) * chartHeight
          const y = height - padding - barHeight

          // Dibujar barra con el color del dataset
          ctx.fillStyle = Array.isArray(color) ? color[i % color.length] : color
          ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight)

          // Dibujar borde de la barra
          ctx.strokeStyle = dataset.borderColor || "#333"
          ctx.lineWidth = 1
          ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight)

          // Dibujar valor encima de la barra
          ctx.fillStyle = "#333"
          ctx.textAlign = "center"
          ctx.font = "10px Arial"
          ctx.fillText(value.toString(), x, y - 5)
        })

        // Añadir a la leyenda
        const legendY = 20 + datasetIndex * 15
        ctx.fillStyle = Array.isArray(color) ? color[0] : color
        ctx.fillRect(width - 100, legendY, 10, 10)
        ctx.fillStyle = "#333"
        ctx.textAlign = "left"
        ctx.fillText(dataset.label || `Serie ${datasetIndex + 1}`, width - 85, legendY + 8)
      })

      // Dibujar etiquetas
      data.labels.forEach((label, i) => {
        const x = padding + (i + 0.5) * (chartWidth / data.labels.length)
        ctx.fillStyle = "#666"
        ctx.textAlign = "center"
        ctx.font = "10px Arial"
        ctx.fillText(label, x, height - padding + 15)
      })
    }

    const renderLineChart = (ctx, data, width, height) => {
      // Implementación similar a la del componente RichTextEditor
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // Encontrar el valor máximo para escalar
      const maxValue = Math.max(...data.datasets.flatMap((d) => d.data)) * 1.1 || 100

      // Dibujar ejes
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.strokeStyle = "#ccc"
      ctx.stroke()

      // Dibujar etiquetas del eje X
      ctx.textAlign = "center"
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"

      data.labels.forEach((label, i) => {
        const x = padding + i * (chartWidth / (data.labels.length - 1))
        ctx.fillText(label, x, height - padding + 15)
      })

      // Dibujar líneas
      data.datasets.forEach((dataset, datasetIndex) => {
        const color = dataset.borderColor || `hsl(${datasetIndex * 60}, 70%, 50%)`

        ctx.beginPath()
        dataset.data.forEach((value, i) => {
          const x = padding + i * (chartWidth / (data.labels.length - 1))
          const y = height - padding - (value / maxValue) * chartHeight

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()

        // Dibujar puntos
        dataset.data.forEach((value, i) => {
          const x = padding + i * (chartWidth / (data.labels.length - 1))
          const y = height - padding - (value / maxValue) * chartHeight

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = dataset.backgroundColor || color
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 1
          ctx.stroke()
        })
      })
    }

    const renderPieChart = (ctx, data, width, height, isDonut = false) => {
      // Implementación similar a la del componente RichTextEditor
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(centerX, centerY) - 40

      // Usar el primer dataset para el gráfico circular
      const dataset = data.datasets[0]
      const total = dataset.data.reduce((sum, val) => sum + val, 0) || 100

      let startAngle = -Math.PI / 2

      // Dibujar sectores
      dataset.data.forEach((value, i) => {
        const sliceAngle = (value / total) * (Math.PI * 2)
        const endAngle = startAngle + sliceAngle

        // Determinar color
        const color = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[i % dataset.backgroundColor.length]
          : `hsl(${i * 30}, 70%, 50%)`

        // Dibujar sector
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Si es dona, dibujar círculo blanco en el centro
        if (isDonut) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = "#fff"
          ctx.fill()
        }

        startAngle = endAngle
      })
    }

    // Registrar el gráfico en una variable global para que esté disponible para la exportación
    if (typeof window !== "undefined" && chartId && chartData) {
      // Crear el objeto global si no existe
      if (!window.__GLOBAL_CHARTS__) {
        window.__GLOBAL_CHARTS__ = {}
      }

      // Guardar los datos del gráfico
      window.__GLOBAL_CHARTS__[chartId] = {
        id: chartId,
        title: chartData.options?.plugins?.title?.text || "Gráfico",
        type: chartData.type || "bar",
        data:
          chartData.data?.datasets?.[0]?.data?.map((value: number, index: number) => ({
            label: chartData.data?.labels?.[index] || `Item ${index + 1}`,
            value: value,
            name: chartData.data?.labels?.[index] || `Item ${index + 1}`,
          })) || [],
        description: `Gráfico de tipo ${chartData.type || "barras"}`,
      }

      console.log(`Gráfico ${chartId} registrado para exportación`, window.__GLOBAL_CHARTS__[chartId])
    }

    // Renderizar gráficos al cargar la página
    renderAllCharts()

    // Configurar un observador de mutaciones para detectar cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldRenderCharts = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Es un elemento
              const element = node as HTMLElement
              if (
                element.classList?.contains("embedded-chart-container") ||
                element.querySelector?.(".embedded-chart-container")
              ) {
                shouldRenderCharts = true
              }
            }
          })
        }
      })

      if (shouldRenderCharts) {
        console.log("Detectado nuevo gráfico, renderizando...")
        setTimeout(renderAllCharts, 100)
      }
    })

    // Observar todo el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Renderizar gráficos periódicamente para asegurar que se muestren
    const interval = setInterval(renderAllCharts, 2000)

    // Limpiar al desmontar
    return () => {
      observer.disconnect()
      clearInterval(interval)
      if (typeof window !== "undefined" && window.__GLOBAL_CHARTS__ && chartId) {
        delete window.__GLOBAL_CHARTS__[chartId]
      }
    }
  }, [chartId, chartData])

  // Este componente no renderiza nada visible
  return null
}
