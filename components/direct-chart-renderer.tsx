"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

export function DirectChartRenderer() {
  const renderedChartsRef = useRef(new Set())
  const observerRef = useRef<MutationObserver | null>(null)
  const renderIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Función para renderizar un gráfico específico
  const renderChart = (chartElement: HTMLElement) => {
    try {
      // Verificar si el elemento ya tiene un gráfico renderizado
      const chartId = chartElement.getAttribute("data-chart-id")
      if (!chartId || renderedChartsRef.current.has(chartId)) return

      // Obtener los datos del gráfico
      const chartDataAttr = chartElement.getAttribute("data-chart-data")
      if (!chartDataAttr) return

      const chartData = JSON.parse(chartDataAttr)
      if (!chartData) return

      // Crear el canvas para el gráfico si no existe
      let canvas = chartElement.querySelector("canvas")
      if (!canvas) {
        canvas = document.createElement("canvas")

        // Configurar el canvas para pantallas de alta resolución
        const dpr = window.devicePixelRatio || 1
        const rect = chartElement.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.scale(dpr, dpr)
        }

        chartElement.appendChild(canvas)
      }

      // Crear el gráfico
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Configurar opciones según el tipo de gráfico
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
        },
        plugins: {
          legend: {
            position: "top" as const,
            labels: {
              font: {
                family: "Inter, sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: {
              family: "Inter, sans-serif",
              size: 14,
            },
            bodyFont: {
              family: "Inter, sans-serif",
              size: 13,
            },
            padding: 10,
            cornerRadius: 4,
          },
        },
      }

      // Crear el gráfico con Chart.js
      new Chart(ctx, {
        type: chartData.type || "bar",
        data: {
          labels: chartData.labels || [],
          datasets: chartData.datasets || [],
        },
        options,
      })

      // Marcar el gráfico como renderizado
      renderedChartsRef.current.add(chartId)
    } catch (error) {
      console.error("Error al renderizar el gráfico:", error)
    }
  }

  // Función para renderizar todos los gráficos en el documento
  const renderAllCharts = () => {
    const chartElements = document.querySelectorAll("[data-chart-data]")
    chartElements.forEach((element) => {
      renderChart(element as HTMLElement)
    })
  }

  useEffect(() => {
    // Renderizar gráficos al cargar el componente
    setTimeout(renderAllCharts, 100)
    setTimeout(renderAllCharts, 500)
    setTimeout(renderAllCharts, 1000)

    // Configurar un intervalo para renderizar gráficos periódicamente
    renderIntervalRef.current = setInterval(renderAllCharts, 3000)

    // Configurar un observador para detectar cambios en el DOM
    observerRef.current = new MutationObserver((mutations) => {
      let shouldRenderCharts = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes" || mutation.type === "characterData") {
          shouldRenderCharts = true
        }
      })

      if (shouldRenderCharts) {
        setTimeout(renderAllCharts, 100)
      }
    })

    // Iniciar la observación del DOM
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })

    // Limpiar al desmontar
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (renderIntervalRef.current) {
        clearInterval(renderIntervalRef.current)
      }
    }
  }, [])

  return null
}
