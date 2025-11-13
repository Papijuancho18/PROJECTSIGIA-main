"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import ChartRendererScript from "./chart-renderer-script"

interface EmbeddedChartRendererProps {
  chartId: string
  chartConfig: any
  width?: number
  height?: number
}

export default function EmbeddedChartRenderer({
  chartId,
  chartConfig,
  width = 400,
  height = 300,
}: EmbeddedChartRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return

    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, chartConfig)
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [chartConfig])

  return (
    <div className="chart-container" data-chart-id={chartId}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
      <ChartRendererScript chartId={chartId} chartData={chartConfig} />
    </div>
  )
}
