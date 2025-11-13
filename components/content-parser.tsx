// Utilidades para parsear contenido de reportes y convertir markdown/JSON a elementos renderizables

export interface ParsedContent {
  type: "text" | "chart" | "table"
  content: string
  data?: any
}

// Función para detectar y parsear gráficos en formato ```chart
export function parseChartBlocks(content: string): ParsedContent[] {
  const results: ParsedContent[] = []
  const chartRegex = /```chart\s*\n([\s\S]*?)\n```/g
  let lastIndex = 0
  let match

  while ((match = chartRegex.exec(content)) !== null) {
    // Agregar texto antes del gráfico
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim()
      if (textContent) {
        results.push({
          type: "text",
          content: textContent,
        })
      }
    }

    // Parsear el gráfico
    try {
      const chartJson = match[1].trim()
      const chartData = JSON.parse(chartJson)

      // Convertir al formato esperado
      const convertedChart = convertChartData(chartData)
      results.push({
        type: "chart",
        content: `Gráfico: ${convertedChart.title}`,
        data: convertedChart,
      })
    } catch (error) {
      console.error("Error al parsear gráfico:", error)
      results.push({
        type: "text",
        content: `Error al procesar gráfico: ${match[0]}`,
      })
    }

    lastIndex = chartRegex.lastIndex
  }

  // Agregar texto restante
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim()
    if (textContent) {
      results.push({
        type: "text",
        content: textContent,
      })
    }
  }

  return results
}

// Función para detectar y parsear tablas en formato markdown
export function parseTableBlocks(content: string): ParsedContent[] {
  const results: ParsedContent[] = []
  const tableRegex = /\|(.+)\|\s*\n\|[\s\-|]+\|\s*\n((?:\|.+\|\s*\n?)*)/g
  let lastIndex = 0
  let match

  while ((match = tableRegex.exec(content)) !== null) {
    // Agregar texto antes de la tabla
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim()
      if (textContent) {
        results.push({
          type: "text",
          content: textContent,
        })
      }
    }

    // Parsear la tabla
    try {
      const headerRow = match[1]
      const bodyRows = match[2]

      const convertedTable = convertTableData(headerRow, bodyRows)
      results.push({
        type: "table",
        content: `Tabla: ${convertedTable.title}`,
        data: convertedTable,
      })
    } catch (error) {
      console.error("Error al parsear tabla:", error)
      results.push({
        type: "text",
        content: `Error al procesar tabla: ${match[0]}`,
      })
    }

    lastIndex = tableRegex.lastIndex
  }

  // Agregar texto restante
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim()
    if (textContent) {
      results.push({
        type: "text",
        content: textContent,
      })
    }
  }

  return results
}

// Función para convertir datos de gráfico al formato esperado
function convertChartData(chartJson: any): any {
  const { title, type, labels, datasets } = chartJson

  // Convertir al formato esperado por nuestras funciones de renderizado
  const data = []

  if (datasets && datasets.length > 0) {
    const dataset = datasets[0] // Usar el primer dataset

    if (labels && dataset.data) {
      for (let i = 0; i < labels.length; i++) {
        data.push({
          label: labels[i],
          value: dataset.data[i] || 0,
        })
      }
    }
  }

  return {
    id: `chart-${Date.now()}`,
    title: title || "Gráfico sin título",
    type: mapChartType(type),
    data: data,
    description: `Gráfico de tipo ${type} con ${data.length} puntos de datos`,
  }
}

// Función para mapear tipos de gráfico
function mapChartType(type: string): "bar" | "line" | "pie" | "scatter" {
  switch (type?.toLowerCase()) {
    case "bar":
    case "column":
      return "bar"
    case "line":
      return "line"
    case "pie":
    case "doughnut":
      return "pie"
    case "scatter":
      return "scatter"
    default:
      return "bar"
  }
}

// Función para convertir datos de tabla al formato esperado
function convertTableData(headerRow: string, bodyRows: string): any {
  // Parsear encabezados
  const headers = headerRow
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h.length > 0)

  // Parsear filas
  const rows = bodyRows
    .split("\n")
    .filter((row) => row.trim().length > 0)
    .map((row) => {
      return row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)
    })
    .filter((row) => row.length > 0)

  return {
    id: `table-${Date.now()}`,
    title: "Tabla de datos",
    headers: headers,
    rows: rows,
    summary: `Tabla con ${headers.length} columnas y ${rows.length} filas`,
  }
}

// Función principal para procesar contenido completo
export function parseReportContent(content: string): ParsedContent[] {
  let results: ParsedContent[] = []

  // Primero parsear gráficos
  const afterCharts = parseChartBlocks(content)

  // Luego parsear tablas en cada elemento
  for (const item of afterCharts) {
    if (item.type === "text") {
      const tablesInText = parseTableBlocks(item.content)
      results = results.concat(tablesInText)
    } else {
      results.push(item)
    }
  }

  return results
}

// Función para procesar secciones de reporte
export function processReportSections(sections: any[]): any[] {
  return sections.flatMap((section, index) => {
    const parsedContent = parseReportContent(section.content || "")

    // Si hay elementos parseados, crear secciones separadas
    if (parsedContent.length > 1) {
      const processedSections = []

      parsedContent.forEach((parsed, subIndex) => {
        processedSections.push({
          id: `${section.id}-${subIndex}`,
          title: subIndex === 0 ? section.title : `${section.title} - Parte ${subIndex + 1}`,
          content: parsed.content,
          type: parsed.type,
          data: parsed.data,
        })
      })

      return processedSections
    } else if (parsedContent.length === 1) {
      // Una sola sección procesada
      return {
        ...section,
        content: parsedContent[0].content,
        type: parsedContent[0].type,
        data: parsedContent[0].data,
      }
    } else {
      // Sin cambios
      return section
    }
  }) // Aplanar el array en caso de secciones múltiples
}
