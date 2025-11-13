import jsPDF from "jspdf"
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx"
import * as XLSX from "xlsx"

interface ReportSection {
  id: string
  title: string
  content?: string
  type?: "text" | "table" | "chart" | "image"
  data?: any
  elements?: any[]
  subsections?: any[]
  children?: any[] // Alternativa para subsecciones
  items?: any[] // Otra alternativa para subsecciones o elementos
}

interface ReportData {
  id: string
  title: string
  subtitle?: string
  author: string
  department: string
  createdAt: string
  updatedAt: string
  sections: ReportSection[]
  tables?: any[]
  charts?: any[]
  metadata?: Record<string, any>
}

interface TableData {
  id: string
  title: string
  headers: string[]
  rows: string[][]
  summary?: string
}

interface ChartData {
  id: string
  title: string
  type: "bar" | "line" | "pie" | "scatter"
  data: any[]
  description?: string
}

interface ExportTemplate {
  id: string
  name: string
  format?: string
  styles: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    headerStyle: string
    includePageNumbers: boolean
    includeTableOfContents: boolean
    orientation: "portrait" | "landscape"
    fontSize?: {
      title: number
      heading: number
      subheading: number
      body: number
      table: number
    }
    lineSpacing?: number
    paragraphSpacing?: {
      before: number
      after: number
    }
    margins?: {
      top: number
      bottom: number
      left: number
      right: number
    }
    textAlignment?: "left" | "justified" | "center" | "right"
  }
}

const institutionalTemplate: ExportTemplate = {
  id: "institutional",
  name: "Formato Institucional",
  format: "institutional",
  styles: {
    fontFamily: "Calibri",
    primaryColor: "#000000",
    secondaryColor: "#666666",
    headerStyle: "bold_uppercase_left",
    includePageNumbers: true,
    includeTableOfContents: true,
    orientation: "portrait",
    fontSize: {
      title: 18,
      heading: 14,
      subheading: 12,
      body: 11,
      table: 10,
    },
    lineSpacing: 1.15,
    paragraphSpacing: {
      before: 0,
      after: 6,
    },
    margins: {
      top: 2.5,
      bottom: 2.5,
      left: 3,
      right: 2.5,
    },
    textAlignment: "left", // Cambiar a left para evitar problemas de justificación
  },
}

// Función para renderizar tabla
function renderTable(pdf: jsPDF, tableData: TableData, x: number, y: number, maxWidth: number): number {
  try {
    const headers = tableData.headers || ["Columna 1", "Columna 2", "Columna 3"]
    const rows = tableData.rows || [["Dato 1", "Dato 2", "Dato 3"]]

    const cellHeight = 10
    const colWidth = Math.min(maxWidth / headers.length, 45)
    let currentY = y

    // Título de la tabla
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text(tableData.title || "Tabla", x, currentY)
    currentY += 15

    // Headers
    pdf.setFillColor(230, 230, 230)
    pdf.setDrawColor(100, 100, 100)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9)

    headers.forEach((header, i) => {
      const cellX = x + i * colWidth
      pdf.rect(cellX, currentY, colWidth, cellHeight, "FD")
      const headerText = String(header).substring(0, 15)
      pdf.text(headerText, cellX + 2, currentY + 7)
    })

    currentY += cellHeight

    // Filas de datos
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)

    rows.forEach((row) => {
      row.forEach((cell, i) => {
        if (i < headers.length) {
          const cellX = x + i * colWidth
          pdf.rect(cellX, currentY, colWidth, cellHeight, "S")
          const cellText = String(cell || "").substring(0, 15)
          pdf.text(cellText, cellX + 2, currentY + 7)
        }
      })
      currentY += cellHeight
    })

    return currentY + 10
  } catch (error) {
    console.error("Error rendering table:", error)
    return y + 20
  }
}

// Función para renderizar gráfico
function renderChart(pdf: jsPDF, chartData: ChartData, x: number, y: number, maxWidth: number): number {
  try {
    let currentY = y

    // Título del gráfico
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text(chartData.title || "Gráfico", x, currentY)
    currentY += 15

    // Marco para el gráfico
    const chartHeight = 60
    pdf.setDrawColor(150, 150, 150)
    pdf.setFillColor(250, 250, 250)
    pdf.rect(x, currentY, maxWidth, chartHeight, "FD")

    // Información del gráfico
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Tipo: ${chartData.type}`, x + 5, currentY + 15)

    // Mostrar algunos datos
    if (chartData.data && chartData.data.length > 0) {
      pdf.text("Datos:", x + 5, currentY + 25)
      const maxItems = Math.min(3, chartData.data.length)
      chartData.data.slice(0, maxItems).forEach((item, index) => {
        const label = String(item.label || item.name || `Item ${index + 1}`).substring(0, 15)
        const value = String(item.value || item.y || 0)
        pdf.text(`• ${label}: ${value}`, x + 5, currentY + 35 + index * 8)
      })
    }

    return currentY + chartHeight + 10
  } catch (error) {
    console.error("Error rendering chart:", error)
    return y + 30
  }
}

// Función principal de exportación COMPLETAMENTE REESCRITA
async function exportToPDF(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<Blob> {
  try {
    onProgress?.(10, "Inicializando PDF...")

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let yPosition = margin

    onProgress?.(20, "Creando portada...")

    // === PORTADA ===
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("INFORME DE GESTIÓN ACADÉMICA", pageWidth / 2, 50, { align: "center" })

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Título: ${reportData.title || "Sin título"}`, margin, 80)
    pdf.text(`Autor: ${reportData.author || "Sin autor"}`, margin, 95)
    pdf.text(`Departamento: ${reportData.department || "Sin departamento"}`, margin, 110)
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, 125)

    // Nueva página para contenido
    pdf.addPage()
    yPosition = margin

    onProgress?.(50, "Procesando contenido...")

    // === FUNCIONES AUXILIARES ===
    const checkPageSpace = (requiredSpace: number): void => {
      if (yPosition + requiredSpace > pageHeight - margin - 20) {
        pdf.addPage()
        yPosition = margin
      }
    }

    const renderSimpleText = (text: string, x: number, y: number, fontSize = 11, fontStyle = "normal"): number => {
      if (!text || typeof text !== "string") {
        return y
      }

      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", fontStyle as any)

      // Limpiar texto
      const cleanText = text
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()

      if (!cleanText) {
        return y
      }

      // Dividir en líneas SIN justificación
      const availableWidth = maxWidth - (x - margin)
      const lines = pdf.splitTextToSize(cleanText, availableWidth)
      const lineHeight = fontSize * 0.35

      // Verificar espacio
      checkPageSpace(lines.length * lineHeight + 5)

      // Renderizar líneas simples
      lines.forEach((line: string, index: number) => {
        pdf.text(line, x, y + index * lineHeight)
      })

      return y + lines.length * lineHeight + 5
    }

    // === FUNCIÓN RECURSIVA SIMPLIFICADA ===
    const processSections = (sections: any[], level = 0, parentNumber = ""): void => {
      if (!Array.isArray(sections)) return

      sections.forEach((section, index) => {
        try {
          if (!section || !section.title) return

          const currentNumber = level === 0 ? `${index + 1}` : `${parentNumber}.${index + 1}`

          onProgress?.(50 + (index / sections.length) * 40, `Procesando: ${section.title}`)

          // Verificar espacio para título
          checkPageSpace(25)

          // === CONFIGURACIÓN DE ESTILO ===
          let titleFontSize: number
          let fontWeight: string
          let indent: number

          if (level === 0) {
            titleFontSize = 14
            fontWeight = "bold"
            indent = 0
            yPosition += index > 0 ? 15 : 0 // Espacio entre secciones principales
          } else if (level === 1) {
            titleFontSize = 12
            fontWeight = "bold"
            indent = 10
            yPosition += 10
          } else {
            titleFontSize = 11
            fontWeight = "normal"
            indent = 20
            yPosition += 8
          }

          // === RENDERIZAR TÍTULO ===
          pdf.setFontSize(titleFontSize)
          pdf.setFont("helvetica", fontWeight as any)

          const sectionTitle = `${currentNumber}. ${section.title}`
          yPosition = renderSimpleText(sectionTitle, margin + indent, yPosition, titleFontSize, fontWeight)

          // Línea decorativa solo para secciones principales
          if (level === 0) {
            pdf.setDrawColor(150, 150, 150)
            pdf.setLineWidth(0.3)
            pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
            yPosition += 8
          } else {
            yPosition += 5
          }

          // === RENDERIZAR CONTENIDO ===
          if (section.content && typeof section.content === "string" && section.content.trim()) {
            const contentIndent = margin + indent + 5
            yPosition = renderSimpleText(section.content, contentIndent, yPosition, 11, "normal")
            yPosition += 8
          }

          // === RENDERIZAR ELEMENTOS ===
          if (section.elements && Array.isArray(section.elements)) {
            section.elements.forEach((element: any) => {
              try {
                checkPageSpace(30)
                const elementIndent = margin + indent + 10

                if (element.type === "table" && element.data) {
                  yPosition = renderTable(pdf, element.data, elementIndent, yPosition, maxWidth - indent - 15)
                } else if (element.type === "chart" && element.data) {
                  yPosition = renderChart(pdf, element.data, elementIndent, yPosition, maxWidth - indent - 15)
                } else if (element.content || element.text) {
                  const elementText = element.content || element.text
                  if (elementText && typeof elementText === "string") {
                    yPosition = renderSimpleText(elementText, elementIndent, yPosition, 10, "normal")
                    yPosition += 5
                  }
                }
              } catch (elementError) {
                console.error("Error procesando elemento:", elementError)
              }
            })
          }

          // === PROCESAR SUBSECCIONES ===
          const subsections = section.subsections || section.children || []
          if (Array.isArray(subsections) && subsections.length > 0) {
            yPosition += 8
            processSections(subsections, level + 1, currentNumber)
          }

          // Espacio después de la sección
          yPosition += level === 0 ? 12 : 8
        } catch (sectionError) {
          console.error(`Error en sección ${index}:`, sectionError)
          yPosition = renderSimpleText(
            `Error al procesar sección: ${section?.title || "Sin título"}`,
            margin,
            yPosition,
            10,
            "italic",
          )
          yPosition += 15
        }
      })
    }

    // === PROCESAR TODAS LAS SECCIONES ===
    const sections = reportData.sections || []
    console.log("📄 Procesando", sections.length, "secciones principales")

    if (sections.length > 0) {
      processSections(sections)
    } else {
      yPosition = renderSimpleText("No hay contenido disponible para mostrar", margin, yPosition, 11, "italic")
    }

    onProgress?.(95, "Finalizando...")

    // === NÚMEROS DE PÁGINA ===
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10)
    }

    onProgress?.(100, "PDF completado")

    return new Blob([pdf.output("blob")], { type: "application/pdf" })
  } catch (error) {
    console.error("Error en exportToPDF:", error)
    throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

async function exportToWord(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<Blob> {
  try {
    onProgress?.(50, "Generando documento Word...")

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: reportData.title || "Informe de Gestión",
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    })

    onProgress?.(100, "Word completado")
    return await Packer.toBlob(doc)
  } catch (error) {
    throw new Error(`Error al generar Word: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

async function exportToExcel(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<Blob> {
  try {
    onProgress?.(50, "Generando Excel...")

    const workbook = XLSX.utils.book_new()
    const summaryData = [
      ["Título", reportData.title || "Sin título"],
      ["Autor", reportData.author || "Sin autor"],
      ["Departamento", reportData.department || "Sin departamento"],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    onProgress?.(100, "Excel completado")
    return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  } catch (error) {
    throw new Error(`Error al generar Excel: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

async function exportReport(
  reportData: ReportData,
  format: "pdf" | "word" | "excel",
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<{ blob: Blob; filename: string }> {
  try {
    onProgress?.(5, "Iniciando exportación...")

    if (!reportData || !reportData.title) {
      throw new Error("Datos del reporte inválidos")
    }

    console.log("Datos del reporte a exportar:", reportData)

    let blob: Blob
    let extension: string

    switch (format) {
      case "pdf":
        blob = await exportToPDF(reportData, template, onProgress)
        extension = "pdf"
        break
      case "word":
        blob = await exportToWord(reportData, template, onProgress)
        extension = "docx"
        break
      case "excel":
        blob = await exportToExcel(reportData, template, onProgress)
        extension = "xlsx"
        break
      default:
        throw new Error(`Formato no soportado: ${format}`)
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    const sanitizedTitle = reportData.title.replace(/[^a-zA-Z0-9]/g, "_")
    const filename = `${sanitizedTitle}_${timestamp}.${extension}`

    return { blob, filename }
  } catch (error) {
    console.error("Error en exportReport:", error)
    throw new Error(`Error al exportar: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading file:", error)
  }
}

export { exportReport, downloadBlob }
export type { ReportData, ChartData, TableData, ExportTemplate }
