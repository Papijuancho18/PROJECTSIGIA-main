import type { ChartData } from "./content-parser"

/**
 * Renderiza un gráfico en un canvas según su tipo con alta calidad
 * @param ctx Contexto del canvas
 * @param chartData Datos del gráfico
 * @param width Ancho del canvas
 * @param height Alto del canvas
 */
export function renderChartToCanvas(
  ctx: CanvasRenderingContext2D,
  chartData: ChartData,
  width: number,
  height: number,
): void {
  // Configurar para alta calidad
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  // Limpiar el canvas
  ctx.clearRect(0, 0, width, height)

  // Establecer fondo blanco con sombra sutil
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Dibujar sombra del gráfico
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  // Dibujar borde redondeado
  ctx.strokeStyle = "#e0e0e0"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(5, 5, width - 10, height - 10, 8)
  ctx.stroke()

  // Resetear sombra
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Verificar que hay datos
  if (!chartData.data || chartData.data.length === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  // Renderizar según el tipo de gráfico
  switch (chartData.type) {
    case "bar":
      renderBarChart(ctx, chartData, width, height)
      break
    case "line":
      renderLineChart(ctx, chartData, width, height)
      break
    case "pie":
      renderPieChart(ctx, chartData, width, height)
      break
    case "scatter":
      renderScatterChart(ctx, chartData, width, height)
      break
    default:
      renderBarChart(ctx, chartData, width, height)
  }

  // Añadir título con mejor tipografía
  if (chartData.title) {
    ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif"
    ctx.fillStyle = "#2c3e50"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    // Sombra del texto
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    ctx.fillText(chartData.title, width / 2, 15)

    // Resetear sombra
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

/**
 * Función para renderizar gráfico como representación visual textual en PDF
 */
export function renderChartAsVisualRepresentation(
  pdf: any,
  chartData: ChartData,
  x: number,
  y: number,
  maxWidth: number,
): number {
  try {
    let currentY = y

    // Título del gráfico con marco
    pdf.setFillColor(245, 245, 245)
    pdf.rect(x, currentY, maxWidth, 15, "F")
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(x, currentY, maxWidth, 15, "S")

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 0, 0)
    pdf.text(chartData.title || "Gráfico", x + 5, currentY + 10)
    currentY += 20

    // Información del gráfico
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 100, 100)
    const chartTypeText = `Tipo de gráfico: ${chartData.type === "bar" ? "Gráfico de Barras" : chartData.type === "line" ? "Gráfico de Líneas" : chartData.type === "pie" ? "Gráfico Circular" : "Gráfico de Dispersión"}`
    pdf.text(chartTypeText, x, currentY)
    currentY += 8

    if (chartData.description) {
      pdf.setTextColor(80, 80, 80)
      const descLines = pdf.splitTextToSize(`Descripción: ${chartData.description}`, maxWidth)
      pdf.text(descLines, x, currentY)
      currentY += descLines.length * 5 + 5
    }

    // Datos del gráfico
    if (chartData.data && chartData.data.length > 0) {
      // Calcular estadísticas
      const values = chartData.data
        .map((item: any) => item.value || item.y || 0)
        .filter((val: any) => typeof val === "number")

      if (values.length > 0) {
        const total = values.reduce((sum: number, val: number) => sum + val, 0)
        const average = total / values.length
        const max = Math.max(...values)
        const min = Math.min(...values)

        // Sección de resumen estadístico
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(0, 0, 0)
        pdf.text("RESUMEN ESTADÍSTICO", x, currentY)
        currentY += 10

        // Marco para estadísticas
        pdf.setFillColor(250, 250, 250)
        pdf.rect(x, currentY, maxWidth, 35, "F")
        pdf.setDrawColor(220, 220, 220)
        pdf.rect(x, currentY, maxWidth, 35, "S")

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(0, 0, 0)

        // Estadísticas en dos columnas
        const leftCol = x + 5
        const rightCol = x + maxWidth / 2 + 5

        pdf.text(`Total de elementos: ${chartData.data.length}`, leftCol, currentY + 8)
        pdf.text(`Suma total: ${total.toFixed(1)}`, rightCol, currentY + 8)

        pdf.text(`Promedio: ${average.toFixed(1)}`, leftCol, currentY + 16)
        pdf.text(`Valor máximo: ${max}`, rightCol, currentY + 16)

        pdf.text(`Valor mínimo: ${min}`, leftCol, currentY + 24)
        pdf.text(`Rango: ${(max - min).toFixed(1)}`, rightCol, currentY + 24)

        currentY += 45

        // Representación visual simple del gráfico
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(0, 0, 0)
        pdf.text("REPRESENTACIÓN VISUAL", x, currentY)
        currentY += 10

        // Crear una representación visual simple con barras ASCII
        const sortedData = [...chartData.data]
          .sort((a: any, b: any) => (b.value || b.y || 0) - (a.value || a.y || 0))
          .slice(0, 8) // Mostrar máximo 8 elementos

        const maxValue = Math.max(...sortedData.map((item: any) => item.value || item.y || 0))
        const barWidth = 40 // Ancho máximo de la barra en caracteres

        pdf.setFontSize(9)
        pdf.setFont("helvetica", "normal")

        sortedData.forEach((item: any, index: number) => {
          const label = item.label || item.name || `Item ${index + 1}`
          const value = item.value || item.y || 0
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
          const barLength = Math.round((percentage / 100) * barWidth)

          // Verificar si necesitamos una nueva página
          if (currentY > pdf.internal.pageSize.getHeight() - 40) {
            pdf.addPage()
            currentY = 30
          }

          // Etiqueta del elemento
          pdf.setTextColor(0, 0, 0)
          pdf.text(`${label}:`, x, currentY)

          // Valor numérico
          pdf.text(`${value}`, x + 60, currentY)

          // Barra visual simple
          pdf.setDrawColor(100, 100, 100)
          pdf.setFillColor(200, 200, 255)
          const barPixelWidth = (barLength / barWidth) * 80 // Convertir a píxeles
          if (barPixelWidth > 2) {
            pdf.rect(x + 80, currentY - 3, barPixelWidth, 6, "F")
            pdf.rect(x + 80, currentY - 3, barPixelWidth, 6, "S")
          }

          // Porcentaje
          pdf.setTextColor(100, 100, 100)
          pdf.text(`(${percentage.toFixed(1)}%)`, x + 165, currentY)

          currentY += 8
        })

        currentY += 10

        // Interpretación y conclusiones
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(0, 0, 0)
        pdf.text("INTERPRETACIÓN", x, currentY)
        currentY += 8

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(60, 60, 60)

        // Generar interpretación automática
        const topElement = sortedData[0]
        const bottomElement = sortedData[sortedData.length - 1]

        let interpretation = ""
        if (chartData.type === "line") {
          interpretation = `Este gráfico de líneas muestra la evolución temporal de ${chartData.title.toLowerCase()}. `
          interpretation += `El valor más alto se registra en ${topElement?.label} con ${topElement?.value || 0}, `
          interpretation += `mientras que el más bajo corresponde a ${bottomElement?.label} con ${bottomElement?.value || 0}. `
          interpretation += `El promedio general es de ${average.toFixed(1)}.`
        } else if (chartData.type === "bar") {
          interpretation = `Este gráfico de barras compara diferentes categorías de ${chartData.title.toLowerCase()}. `
          interpretation += `La categoría con mayor valor es ${topElement?.label} (${topElement?.value || 0}), `
          interpretation += `seguida por las demás categorías mostradas en orden descendente.`
        } else {
          interpretation = `Este gráfico presenta datos sobre ${chartData.title.toLowerCase()}. `
          interpretation += `Los valores varían desde ${min} hasta ${max}, con un promedio de ${average.toFixed(1)}.`
        }

        const interpretationLines = pdf.splitTextToSize(interpretation, maxWidth)
        pdf.text(interpretationLines, x, currentY)
        currentY += interpretationLines.length * 5 + 10
      } else {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text("No hay datos numéricos disponibles para mostrar", x, currentY)
        currentY += 15
      }
    } else {
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      pdf.text("No hay datos disponibles para mostrar", x, currentY)
      currentY += 15
    }

    return currentY + 10
  } catch (error) {
    console.error("Error al renderizar gráfico:", error)
    pdf.setFontSize(10)
    pdf.setTextColor(150, 150, 150)
    pdf.text("Error al procesar los datos del gráfico", x, y + 10)
    return y + 25
  }
}

/**
 * Muestra un mensaje cuando no hay datos con mejor diseño
 */
function drawNoDataMessage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Fondo del mensaje
  ctx.fillStyle = "#f8f9fa"
  ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.2)

  // Borde del mensaje
  ctx.strokeStyle = "#dee2e6"
  ctx.lineWidth = 1
  ctx.strokeRect(width * 0.2, height * 0.4, width * 0.6, height * 0.2)

  // Texto del mensaje
  ctx.font = "16px 'Segoe UI', Arial, sans-serif"
  ctx.fillStyle = "#6c757d"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("📊 No hay datos disponibles", width / 2, height / 2)
}

/**
 * Renderiza un gráfico de barras con diseño moderno
 */
function renderBarChart(ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number): void {
  const data = chartData.data
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2 - 40 // Espacio para título
  const barCount = data.length

  if (barCount === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  // Encontrar el valor máximo
  let maxValue = 0
  for (const item of data) {
    if (typeof item.value === "number" && item.value > maxValue) {
      maxValue = item.value
    }
  }

  if (maxValue === 0) maxValue = 100

  // Calcular dimensiones de barras
  const barWidth = Math.min((chartWidth / barCount) * 0.7, 60)
  const barSpacing = (chartWidth - barCount * barWidth) / (barCount + 1)

  // Colores modernos con gradientes
  const colors = ["#3498db", "#e74c3c", "#f39c12", "#2ecc71", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"]

  // Dibujar grid de fondo
  ctx.strokeStyle = "#ecf0f1"
  ctx.lineWidth = 1
  const gridSteps = 5
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding + 40 + (i / gridSteps) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Dibujar ejes principales
  ctx.strokeStyle = "#34495e"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding + 40)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Dibujar barras con gradientes
  for (let i = 0; i < barCount; i++) {
    const item = data[i]
    if (typeof item.value !== "number") continue

    const barHeight = (item.value / maxValue) * chartHeight
    const x = padding + barSpacing + i * (barWidth + barSpacing)
    const y = height - padding - barHeight

    // Crear gradiente para la barra
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
    const baseColor = colors[i % colors.length]
    gradient.addColorStop(0, baseColor)
    gradient.addColorStop(1, baseColor + "80") // Más transparente abajo

    // Dibujar barra con bordes redondeados
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
    ctx.fill()

    // Borde de la barra
    ctx.strokeStyle = baseColor
    ctx.lineWidth = 1
    ctx.stroke()

    // Valor encima de la barra
    ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif"
    ctx.fillStyle = "#2c3e50"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"
    ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)

    // Etiqueta debajo del eje
    if (item.label) {
      ctx.font = "11px 'Segoe UI', Arial, sans-serif"
      ctx.fillStyle = "#7f8c8d"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      const label = item.label.length > 12 ? item.label.substring(0, 12) + "..." : item.label
      ctx.fillText(label, x + barWidth / 2, height - padding + 8)
    }
  }

  // Etiquetas del eje Y
  ctx.font = "10px 'Segoe UI', Arial, sans-serif"
  ctx.fillStyle = "#7f8c8d"

  // Eje Y
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  for (let i = 0; i <= gridSteps; i++) {
    const value = Math.round((maxValue * (gridSteps - i)) / gridSteps)
    const y = padding + 40 + (i / gridSteps) * chartHeight
    ctx.fillText(value.toString(), padding - 8, y)
  }
}

/**
 * Renderiza un gráfico de líneas con diseño moderno
 */
function renderLineChart(ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number): void {
  const data = chartData.data
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2 - 40
  const pointCount = data.length

  if (pointCount === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  let maxValue = 0
  for (const item of data) {
    if (typeof item.value === "number" && item.value > maxValue) {
      maxValue = item.value
    }
  }

  if (maxValue === 0) maxValue = 100

  // Dibujar grid
  ctx.strokeStyle = "#ecf0f1"
  ctx.lineWidth = 1
  const gridSteps = 5
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding + 40 + (i / gridSteps) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Ejes
  ctx.strokeStyle = "#34495e"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding + 40)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Área bajo la curva (gradiente)
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)

  for (let i = 0; i < pointCount; i++) {
    const item = data[i]
    if (typeof item.value !== "number") continue

    const x = padding + (i / (pointCount - 1)) * chartWidth
    const y = padding + 40 + ((maxValue - item.value) / maxValue) * chartHeight

    if (i === 0) {
      ctx.lineTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.lineTo(width - padding, height - padding)
  ctx.closePath()

  const areaGradient = ctx.createLinearGradient(0, padding + 40, 0, height - padding)
  areaGradient.addColorStop(0, "rgba(52, 152, 219, 0.3)")
  areaGradient.addColorStop(1, "rgba(52, 152, 219, 0.05)")
  ctx.fillStyle = areaGradient
  ctx.fill()

  // Línea principal
  ctx.strokeStyle = "#3498db"
  ctx.lineWidth = 3
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()

  for (let i = 0; i < pointCount; i++) {
    const item = data[i]
    if (typeof item.value !== "number") continue

    const x = padding + (i / (pointCount - 1)) * chartWidth
    const y = padding + 40 + ((maxValue - item.value) / maxValue) * chartHeight

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    // Puntos con sombra
    ctx.save()
    ctx.shadowColor = "rgba(52, 152, 219, 0.5)"
    ctx.shadowBlur = 8
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#3498db"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    // Valores
    ctx.font = "bold 11px 'Segoe UI', Arial, sans-serif"
    ctx.fillStyle = "#2c3e50"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"
    ctx.fillText(item.value.toString(), x, y - 12)

    // Etiquetas
    if (item.label) {
      ctx.font = "10px 'Segoe UI', Arial, sans-serif"
      ctx.fillStyle = "#7f8c8d"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      const label = item.label.length > 8 ? item.label.substring(0, 8) + "..." : item.label
      ctx.fillText(label, x, height - padding + 8)
    }
  }

  ctx.stroke()

  // Etiquetas del eje Y
  ctx.font = "10px 'Segoe UI', Arial, sans-serif"
  ctx.fillStyle = "#7f8c8d"

  // Eje Y
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"

  for (let i = 0; i <= gridSteps; i++) {
    const value = Math.round((maxValue * (gridSteps - i)) / gridSteps)
    const y = padding + 40 + (i / gridSteps) * chartHeight
    ctx.fillText(value.toString(), padding - 8, y)
  }
}

/**
 * Renderiza un gráfico circular moderno
 */
function renderPieChart(ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number): void {
  const data = chartData.data
  const padding = 40
  const centerX = width / 2
  const centerY = (height + 40) / 2 // Ajustar por título
  const radius = Math.min(width, height - 80) / 3

  if (data.length === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  let total = 0
  for (const item of data) {
    if (typeof item.value === "number") {
      total += item.value
    }
  }

  if (total === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  const colors = ["#3498db", "#e74c3c", "#f39c12", "#2ecc71", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"]

  let startAngle = -Math.PI / 2
  let legendY = padding + 60
  const legendX = width - 150

  // Sombra del gráfico
  ctx.save()
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
  ctx.shadowBlur = 15
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 3

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (typeof item.value !== "number" || item.value <= 0) continue

    const sliceAngle = (item.value / total) * (Math.PI * 2)
    const endAngle = startAngle + sliceAngle

    // Crear gradiente radial
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    const baseColor = colors[i % colors.length]
    gradient.addColorStop(0, baseColor)
    gradient.addColorStop(1, baseColor + "CC")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fill()

    // Borde de la sección
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.stroke()

    startAngle = endAngle
  }

  ctx.restore()

  // Reiniciar para porcentajes y leyenda
  startAngle = -Math.PI / 2

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (typeof item.value !== "number" || item.value <= 0) continue

    const sliceAngle = (item.value / total) * (Math.PI * 2)
    const endAngle = startAngle + sliceAngle
    const midAngle = startAngle + sliceAngle / 2

    // Porcentaje en el centro de cada sección
    const percent = Math.round((item.value / total) * 100)
    if (percent >= 5) {
      // Solo mostrar si es >= 5%
      const percentX = centerX + Math.cos(midAngle) * (radius * 0.7)
      const percentY = centerY + Math.sin(midAngle) * (radius * 0.7)

      ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Sombra del texto
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 2
      ctx.fillText(`${percent}%`, percentX, percentY)
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
    }

    // Leyenda
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(legendX, legendY, 12, 12)

    ctx.font = "11px 'Segoe UI', Arial, sans-serif"
    ctx.fillStyle = "#2c3e50"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    const label = item.label || `Item ${i + 1}`
    const displayLabel = label.length > 15 ? label.substring(0, 15) + "..." : label
    ctx.fillText(`${displayLabel}: ${item.value} (${percent}%)`, legendX + 18, legendY)

    legendY += 18
    startAngle = endAngle
  }
}

/**
 * Renderiza un gráfico de dispersión moderno
 */
function renderScatterChart(ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number): void {
  const data = chartData.data
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2 - 40

  if (data.length === 0) {
    drawNoDataMessage(ctx, width, height)
    return
  }

  let maxX = 0,
    maxY = 0

  for (const item of data) {
    if (typeof item.x === "number" && item.x > maxX) maxX = item.x
    if (typeof item.y === "number" && item.y > maxY) maxY = item.y
  }

  if (maxX === 0) maxX = 100
  if (maxY === 0) maxY = 100

  // Grid
  ctx.strokeStyle = "#ecf0f1"
  ctx.lineWidth = 1
  const steps = 5

  for (let i = 0; i <= steps; i++) {
    // Líneas horizontales
    const y = padding + 40 + (i / steps) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()

    // Líneas verticales
    const x = padding + (i / steps) * chartWidth
    ctx.beginPath()
    ctx.moveTo(x, padding + 40)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  // Ejes
  ctx.strokeStyle = "#34495e"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding + 40)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Puntos
  for (const item of data) {
    if (typeof item.x !== "number" || typeof item.y !== "number") continue

    const x = padding + (item.x / maxX) * chartWidth
    const y = padding + 40 + ((maxY - item.y) / maxY) * chartHeight

    // Sombra del punto
    ctx.save()
    ctx.shadowColor = "rgba(52, 152, 219, 0.4)"
    ctx.shadowBlur = 8

    // Punto principal
    ctx.fillStyle = "#3498db"
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()

    // Borde del punto
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()

    // Etiqueta
    if (item.label) {
      ctx.font = "10px 'Segoe UI', Arial, sans-serif"
      ctx.fillStyle = "#2c3e50"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      const label = item.label.length > 8 ? item.label.substring(0, 8) + "..." : item.label
      ctx.fillText(label, x, y - 12)
    }
  }

  // Etiquetas de los ejes
  ctx.font = "10px 'Segoe UI', Arial, sans-serif"
  ctx.fillStyle = "#7f8c8d"

  // Eje Y
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"

  for (let i = 0; i <= steps; i++) {
    const value = Math.round((maxY * (steps - i)) / steps)
    const y = padding + 40 + (i / steps) * chartHeight
    ctx.fillText(value.toString(), padding - 8, y)
  }

  // Eje X
  ctx.textAlign = "center"
  ctx.textBaseline = "top"

  for (let i = 0; i <= steps; i++) {
    const value = Math.round((maxX * i) / steps)
    const x = padding + (i / steps) * chartWidth
    ctx.fillText(value.toString(), x, height - padding + 8)
  }
}
