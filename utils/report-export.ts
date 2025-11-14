import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
} from "chart.js";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import * as XLSX from "xlsx";

// Registrar todos los componentes de Chart.js
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
);

interface ReportSection {
  id: string;
  title: string;
  content?: string;
  type?: "text" | "table" | "chart" | "image";
  data?: any;
  elements?: any[];
  subsections?: any[];
  children?: any[];
  items?: any[];
}

interface ReportData {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
  tables?: any[];
  charts?: any[];
  metadata?: Record<string, any>;
}

interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  summary?: string;
}

interface ChartData {
  id: string;
  title: string;
  type: "bar" | "line" | "pie" | "scatter";
  labels: string[];
  datasets: any[];
  description?: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  format?: string;
  styles: {
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    headerStyle: string;
    includePageNumbers: boolean;
    includeTableOfContents: boolean;
    orientation: "portrait" | "landscape";
    fontSize?: {
      title: number;
      heading: number;
      subheading: number;
      body: number;
      table: number;
    };
    lineSpacing?: number;
    paragraphSpacing?: {
      before: number;
      after: number;
    };
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    textAlignment?: "left" | "justified" | "center" | "right";
  };
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
    textAlignment: "left",
  },
};

// Función para renderizar tabla usando jspdf-autotable
function renderTable(pdf: jsPDF, tableData: TableData, y: number): number {
  try {
    const head = [tableData.headers || []];
    const body = tableData.rows || [];

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(tableData.title || "Tabla", pdf.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 8;

    autoTable(pdf, {
      startY: y,
      head: head,
      body: body,
      theme: "grid",
      headStyles: { fillColor: [230, 230, 230], textColor: 20 },
      styles: { fontSize: 9 },
    });

    return (pdf as any).lastAutoTable.finalY + 15;
  } catch (error) {
    console.error("Error rendering table:", error);
    return y + 20;
  }
}

// Función para renderizar gráfico usando Chart.js
async function renderChart(pdf: jsPDF, chartData: ChartData, y: number): Promise<number> {
  try {
    console.log("renderChart: Iniciando renderizado de gráfico", chartData.title);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(chartData.title || "Gráfico", pdf.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 8;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    console.log("renderChart: Canvas creado", canvas);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("renderChart: No se pudo obtener el contexto 2D del canvas.");
      return y;
    }

    const chart = new Chart(ctx, {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets,
      },
      options: {
        responsive: false,
        animation: false, // Desactivar animación para la exportación
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: false, // El título ya lo pusimos manualmente
          },
        },
      },
    });
    console.log("renderChart: Objeto Chart.js creado", chart);

    // Esperar un momento para que el gráfico se renderice
    await new Promise(resolve => setTimeout(resolve, 500)); // Aumentar el tiempo de espera
    console.log("renderChart: Espera de renderizado completada.");

    const imgData = canvas.toDataURL("image/png");
    console.log("renderChart: imgData generada. Longitud:", imgData.length);
    if (imgData.length < 100) { // Un PNG muy pequeño podría indicar un gráfico vacío
      console.warn("renderChart: imgData es muy pequeña, el gráfico podría estar vacío.");
    }

    const imgWidth = 150;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    console.log("renderChart: Imagen añadida al PDF.");

    chart.destroy(); // Limpiar memoria
    console.log("renderChart: Objeto Chart.js destruido.");

    return y + imgHeight + 15;
  } catch (error) {
    console.error("Error rendering chart:", error);
    return y + 30;
  }
}

// Helper function to parse standard Markdown table syntax
function parseMarkdownTable(markdown: string): TableData | null {
  const lines = markdown.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return null;

  // Check for separator line (e.g., |---|---|)
  const separatorLineIndex = lines.findIndex((line) => /\|[\s-]+\|/.test(line));
  if (separatorLineIndex === -1) return null;

  const headerLine = lines[0];
  const headers = headerLine
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);

  if (headers.length === 0) return null;

  const dataLines = lines.slice(separatorLineIndex + 1);
  const rows = dataLines.map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  );

  // Basic validation: ensure consistent number of columns
  if (rows.some(row => row.length !== headers.length)) {
    console.warn("Markdown table has inconsistent column count, skipping:", markdown);
    return null;
  }

  return {
    id: `markdown-table-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: "Tabla", // Default title for parsed markdown tables
    headers: headers,
    rows: rows,
  };
}

// Función principal de exportación
async function exportToPDF(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message:string) => void,
): Promise<Blob> {
  try {
    onProgress?.(10, "Inicializando PDF...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    onProgress?.(20, "Creando portada...");

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("INFORME DE GESTIÓN ACADÉMICA", pageWidth / 2, 50, { align: "center" });
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Título: ${reportData.title || "Sin título"}`, margin, 80);
    pdf.text(`Autor: ${reportData.author || "Sin autor"}`, margin, 95);
    pdf.text(`Departamento: ${reportData.department || "Sin departamento"}`, margin, 110);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, 125);

    pdf.addPage();
    yPosition = margin;

    onProgress?.(40, "Procesando contenido...");

    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    const renderText = (text: string, x: number, y: number, fontSize = 11, fontStyle = "normal") => {
      if (!text) return y;
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", fontStyle as any);
      const lines = pdf.splitTextToSize(text, pageWidth - x - margin);
      pdf.text(lines, x, y);
      return y + lines.length * (fontSize * 0.35) + 5;
    };

    const CHART_REGEX = /```chart\s*(\{[\s\S]*?\})\s*```/g;
    const JSON_TABLE_REGEX = /```table\s*(\{[\s\S]*?\})\s*```/g;
    // Regex para tablas Markdown estándar
    // Captura:
    // 1. Línea de encabezado (que contiene al menos un '|')
    // 2. Línea separadora (que contiene al menos un '|' y '---')
    // 3. Múltiples líneas de datos (que contienen al menos un '|')
    const MARKDOWN_TABLE_REGEX = /(\|.*\|\r?\n\|(?:[\s-]+\|)+\r?\n(?:\|.*\|\r?\n)*)/g;


    for (const section of reportData.sections) {
      checkPageSpace(20);
      yPosition = renderText(section.title, margin, yPosition, 14, "bold");
      
      if (section.content) {
        let currentContent = section.content;
        let match;
        let lastIndex = 0;

        // Process charts
        while ((match = CHART_REGEX.exec(currentContent)) !== null) {
          // Render text before the chart
          if (match.index > lastIndex) {
            checkPageSpace(20);
            yPosition = renderText(currentContent.substring(lastIndex, match.index), margin, yPosition, 11, "normal");
          }

          // Render chart
          try {
            const chartJson = JSON.parse(match[1]);
            checkPageSpace(80);
            yPosition = await renderChart(pdf, chartJson, yPosition);
          } catch (e) {
            console.error("Error parsing chart JSON:", e);
            checkPageSpace(20);
            yPosition = renderText(`[Error al renderizar gráfico: ${e.message}]`, margin, yPosition, 10, "italic");
          }
          lastIndex = CHART_REGEX.lastIndex;
        }

        // Process JSON tables (after charts)
        currentContent = currentContent.substring(lastIndex); // Remaining content after charts
        lastIndex = 0; // Reset lastIndex for JSON table processing

        while ((match = JSON_TABLE_REGEX.exec(currentContent)) !== null) {
          // Render text before the JSON table
          if (match.index > lastIndex) {
            checkPageSpace(20);
            yPosition = renderText(currentContent.substring(lastIndex, match.index), margin, yPosition, 11, "normal");
          }

          // Render JSON table
          try {
            const tableJson = JSON.parse(match[1]);
            checkPageSpace(50);
            yPosition = renderTable(pdf, tableJson, yPosition);
          } catch (e) {
            console.error("Error parsing JSON table:", e);
            checkPageSpace(20);
            yPosition = renderText(`[Error al renderizar tabla JSON: ${e.message}]`, margin, yPosition, 10, "italic");
          }
          lastIndex = JSON_TABLE_REGEX.lastIndex;
        }

        // Process standard Markdown tables (after JSON tables)
        currentContent = currentContent.substring(lastIndex); // Remaining content after JSON tables
        lastIndex = 0; // Reset lastIndex for Markdown table processing

        while ((match = MARKDOWN_TABLE_REGEX.exec(currentContent)) !== null) {
          // Render text before the Markdown table
          if (match.index > lastIndex) {
            checkPageSpace(20);
            yPosition = renderText(currentContent.substring(lastIndex, match.index), margin, yPosition, 11, "normal");
          }

          // Render Markdown table
          try {
            const tableData = parseMarkdownTable(match[1]);
            if (tableData) {
              checkPageSpace(50);
              yPosition = renderTable(pdf, tableData, yPosition);
            } else {
              // If parsing fails, render as plain text
              checkPageSpace(20);
              yPosition = renderText(match[1], margin, yPosition, 11, "normal");
            }
          } catch (e) {
            console.error("Error rendering Markdown table:", e);
            checkPageSpace(20);
            yPosition = renderText(`[Error al renderizar tabla Markdown: ${e.message}]`, margin, yPosition, 10, "italic");
          }
          lastIndex = MARKDOWN_TABLE_REGEX.lastIndex;
        }

        // Render any remaining text after all charts and tables
        if (currentContent.substring(lastIndex).trim().length > 0) {
          checkPageSpace(20);
          yPosition = renderText(currentContent.substring(lastIndex), margin, yPosition, 11, "normal");
        }
      }
    }

    onProgress?.(95, "Finalizando...");

    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }

    onProgress?.(100, "PDF completado");

    return new Blob([pdf.output("blob")], { type: "application/pdf" });
  } catch (error) {
    console.error("Error en exportToPDF:", error);
    throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
}

async function exportToWord(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<Blob> {
  onProgress?.(50, "Generando documento Word...");
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: reportData.title || "Informe", bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });
  onProgress?.(100, "Word completado");
  return await Packer.toBlob(doc);
}

async function exportToExcel(
  reportData: ReportData,
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<Blob> {
  onProgress?.(50, "Generando Excel...");
  const workbook = XLSX.utils.book_new();
  const summaryData = [
    ["Título", reportData.title || "Sin título"],
    ["Autor", reportData.author || "Sin autor"],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  onProgress?.(100, "Excel completado");
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

async function exportReport(
  reportData: ReportData,
  format: "pdf" | "word" | "excel",
  template: ExportTemplate = institutionalTemplate,
  onProgress?: (progress: number, message: string) => void,
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(5, "Iniciando exportación...");
  if (!reportData || !reportData.title) {
    throw new Error("Datos del reporte inválidos");
  }

  let blob: Blob;
  let extension: string;

  switch (format) {
    case "pdf":
      blob = await exportToPDF(reportData, template, onProgress);
      extension = "pdf";
      break;
    case "word":
      blob = await exportToWord(reportData, template, onProgress);
      extension = "docx";
      break;
    case "excel":
      blob = await exportToExcel(reportData, template, onProgress);
      extension = "xlsx";
      break;
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedTitle = reportData.title.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${sanitizedTitle}_${timestamp}.${extension}`;

  return { blob, filename };
}

function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

export { exportReport, downloadBlob };
export type { ReportData, ChartData, TableData, ExportTemplate };

