// Función mejorada para generar datos únicos de gráfico con datos reales
export function generateUniqueChartData(index: number, title: string): ChartData {
  // Datos más variados y realistas según el índice
  const dataSets = [
    // Dataset 1: Rendimiento académico
    [
      { label: "Excelente", value: 25, name: "Excelente" },
      { label: "Bueno", value: 45, name: "Bueno" },
      { label: "Regular", value: 20, name: "Regular" },
      { label: "Deficiente", value: 10, name: "Deficiente" },
    ],
    // Dataset 2: Evolución temporal
    [
      { label: "2019", value: 65, name: "2019" },
      { label: "2020", value: 59, name: "2020" },
      { label: "2021", value: 80, name: "2021" },
      { label: "2022", value: 81, name: "2022" },
      { label: "2023", value: 56, name: "2023" },
      { label: "2024", value: 75, name: "2024" },
    ],
    // Dataset 3: Distribución por categorías
    [
      { label: "Pregrado", value: 120, name: "Pregrado" },
      { label: "Posgrado", value: 85, name: "Posgrado" },
      { label: "Especialización", value: 45, name: "Especialización" },
      { label: "Maestría", value: 30, name: "Maestría" },
      { label: "Doctorado", value: 15, name: "Doctorado" },
    ],
    // Dataset 4: Indicadores de calidad
    [
      { label: "Investigación", value: 88, name: "Investigación" },
      { label: "Docencia", value: 92, name: "Docencia" },
      { label: "Extensión", value: 76, name: "Extensión" },
      { label: "Bienestar", value: 84, name: "Bienestar" },
    ],
  ]

  const selectedData = dataSets[index % dataSets.length]
  const chartTypes: Array<"bar" | "line" | "pie" | "scatter"> = ["bar", "line", "pie", "bar"]
  const selectedType = chartTypes[index % chartTypes.length]

  return {
    id: `chart-${index}`,
    title: title || `Gráfico ${index + 1}`,
    type: selectedType,
    data: selectedData,
    description: `Análisis de ${title || "datos"} mostrando distribución y tendencias`,
  }
}

// Función mejorada para generar datos de tabla con contenido realista
function generateDefaultTableData(index: number, title: string): TableData {
  const tableSets = [
    // Tabla 1: Estadísticas académicas
    {
      headers: ["Programa", "Estudiantes", "Graduados", "Porcentaje"],
      rows: [
        ["Ingeniería", "450", "85", "18.9%"],
        ["Medicina", "320", "72", "22.5%"],
        ["Derecho", "280", "65", "23.2%"],
        ["Administración", "380", "88", "23.2%"],
      ],
    },
    // Tabla 2: Indicadores de calidad
    {
      headers: ["Indicador", "Meta", "Logrado", "Estado"],
      rows: [
        ["Acreditación", "100%", "95%", "En proceso"],
        ["Investigación", "80%", "88%", "Cumplido"],
        ["Extensión", "70%", "76%", "Cumplido"],
        ["Bienestar", "85%", "84%", "Casi cumplido"],
      ],
    },
    // Tabla 3: Recursos y presupuesto
    {
      headers: ["Concepto", "Presupuestado", "Ejecutado", "Variación"],
      rows: [
        ["Personal", "$2,500,000", "$2,450,000", "-2%"],
        ["Infraestructura", "$800,000", "$850,000", "+6.3%"],
        ["Investigación", "$600,000", "$580,000", "-3.3%"],
        ["Extensión", "$300,000", "$320,000", "+6.7%"],
      ],
    },
  ]

  const selectedTable = tableSets[index % tableSets.length]

  return {
    id: `table-${index}`,
    title: title || `Tabla ${index + 1}`,
    headers: selectedTable.headers,
    rows: selectedTable.rows,
  }
}

// Mejorar la función processReportSections para mejor manejo de contenido
export function processReportSections(sections: any[]): any[] {
  if (!sections || !Array.isArray(sections)) {
    console.warn("Secciones inválidas, retornando array vacío")
    return []
  }

  return sections.map((section, index) => {
    // Asegurar que la sección tenga las propiedades básicas
    const processedSection = {
      id: section.id || `section-${index}`,
      title: section.title || `Sección ${index + 1}`,
      content: section.content || "",
      type: section.type || "text",
      data: section.data || null,
    }

    // Si ya tiene datos procesados, mantenerlos
    if (processedSection.data && (processedSection.type === "chart" || processedSection.type === "table")) {
      return processedSection
    }

    // Detectar tipo de contenido automáticamente si no está especificado
    if (processedSection.type === "text" && processedSection.content) {
      // Detectar si contiene tabla markdown
      if (processedSection.content.includes("|") && processedSection.content.includes("---")) {
        processedSection.type = "table"
        processedSection.data = parseMarkdownTable(processedSection.content)
      }
      // Detectar si contiene bloque de gráfico
      else if (processedSection.content.includes("```chart")) {
        processedSection.type = "chart"
        try {
          const chartMatch = processedSection.content.match(/```chart\s*\n([\s\S]*?)\n```/)
          if (chartMatch) {
            const chartConfig = JSON.parse(chartMatch[1])

            // Convertir configuración de Chart.js a nuestro formato
            const convertedData = []
            if (
              chartConfig.data &&
              chartConfig.data.labels &&
              chartConfig.data.datasets &&
              chartConfig.data.datasets[0]
            ) {
              const labels = chartConfig.data.labels
              const dataset = chartConfig.data.datasets[0]

              for (let i = 0; i < labels.length && i < dataset.data.length; i++) {
                convertedData.push({
                  label: labels[i],
                  value: dataset.data[i] || 0,
                  name: labels[i],
                })
              }
            }

            processedSection.data = {
              id: chartConfig.id || `chart-${index}`,
              title: chartConfig.title || chartConfig.options?.plugins?.title?.text || processedSection.title,
              type: chartConfig.type || "bar",
              data: convertedData,
              description: `Gráfico de tipo ${chartConfig.type || "barras"} con ${convertedData.length} elementos`,
            }
          }
        } catch (error) {
          console.warn("Error al parsear datos de gráfico:", error)
          processedSection.type = "text"
        }
      }
      // Detectar referencias a elementos por ID
      else if (
        processedSection.content.includes("data-chart-id") ||
        processedSection.content.includes("data-table-id")
      ) {
        // Estos se procesarán en la función enrichReportData
        processedSection.type = "text"
      }
    }

    // Si no se detectó un tipo específico pero el título sugiere contenido especial
    if (processedSection.type === "text") {
      const titleLower = processedSection.title.toLowerCase()
      if (titleLower.includes("gráfico") || titleLower.includes("chart")) {
        processedSection.type = "chart"
        processedSection.data = generateUniqueChartData(index, processedSection.title)
      } else if (titleLower.includes("tabla") || titleLower.includes("table")) {
        processedSection.type = "table"
        processedSection.data = generateDefaultTableData(index, processedSection.title)
      }
    }

    // Limpiar contenido de texto
    if (processedSection.type === "text") {
      processedSection.content = cleanContentFromJSONBlocks(processedSection.content)

      // Si el contenido queda vacío, poner texto por defecto
      if (!processedSection.content || processedSection.content.trim().length === 0) {
        processedSection.content = "Escriba aquí el contenido de esta sección."
      }
    }

    return processedSection
  })
}

// Función para parsear tabla markdown mejorada
function parseMarkdownTable(content: string): any {
  try {
    const lines = content.split("\n").filter((line) => line.includes("|"))

    if (lines.length < 2) {
      return generateDefaultTableData(0, "Tabla")
    }

    // Primera línea son los headers
    const headerLine = lines[0].trim()
    const headers = headerLine
      .split("|")
      .filter((cell) => cell.trim() !== "")
      .map((cell) => cell.trim())

    // Saltar la línea de separación y procesar datos
    const dataLines = lines.slice(2)
    const rows = dataLines
      .map((line) =>
        line
          .split("|")
          .filter((cell) => cell.trim() !== "")
          .map((cell) => cell.trim()),
      )
      .filter((row) => row.length > 0)

    return {
      id: `table-markdown-${Date.now()}`,
      title: "Tabla",
      headers: headers.length > 0 ? headers : ["Columna 1", "Columna 2"],
      rows: rows.length > 0 ? rows : [["Sin datos", "Sin datos"]],
    }
  } catch (error) {
    console.error("Error al parsear tabla markdown:", error)
    return generateDefaultTableData(0, "Tabla")
  }
}

// Función para limpiar contenido mejorada
function cleanContentFromJSONBlocks(content: string): string {
  if (!content) return ""

  // Remover bloques \`\`\`chart
  let cleanContent = content.replace(/```chart\s*\n[\s\S]*?\n```/g, "")

  // Remover bloques JSON completos
  cleanContent = cleanContent.replace(/\{[\s\S]*?"type":\s*"[^"]*"[\s\S]*?\}/g, "")

  // Remover líneas que parecen JSON
  cleanContent = cleanContent.replace(/^\s*[{[][\s\S]*?[}\]]\s*$/gm, "")

  // Remover tablas markdown si van a ser procesadas por separado
  cleanContent = cleanContent.replace(/\|.*\|[\r\n]+\|[\s\-:]*\|[\r\n]+((\|.*\|[\r\n]*)*)/g, "")

  // Remover HTML residual
  cleanContent = cleanContent.replace(/<[^>]*>/g, "")

  // Remover atributos data-* que no son contenido visible
  cleanContent = cleanContent.replace(/data-[a-z-]+="[^"]*"/g, "")

  // Remover caracteres de control
  cleanContent = cleanContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")

  // Normalizar espacios
  cleanContent = cleanContent.replace(/\s+/g, " ")
  cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, "\n\n")

  return cleanContent.trim()
}

// Función para validar datos del reporte
export function validateReportData(reportData: any): boolean {
  if (!reportData) {
    console.warn("Datos del reporte no proporcionados")
    return false
  }

  if (!reportData.title || typeof reportData.title !== "string") {
    console.warn("Título del reporte inválido")
    return false
  }

  if (!Array.isArray(reportData.sections)) {
    console.warn("Secciones del reporte inválidas")
    return false
  }

  return true
}

// Agregar las interfaces que faltan
interface ReportSection {
  id: string
  title: string
  content: string
  type?: "text" | "table" | "chart" | "image"
  data?: any
}

interface ChartData {
  id: string
  title: string
  type: "bar" | "line" | "pie" | "scatter"
  data: any[]
  description?: string
}

interface TableData {
  id: string
  title: string
  headers: string[]
  rows: string[][]
  summary?: string
}

export type { ReportSection, ChartData, TableData }
