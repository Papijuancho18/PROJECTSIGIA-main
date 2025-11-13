"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { exportReport, downloadBlob, type ReportData } from "@/utils/report-export"
import { FileDown, FileText, FileSpreadsheet, FileIcon as FilePdf, Loader2 } from "lucide-react"

interface ExportButtonProps {
  report: ReportData
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  className?: string
}

export function ExportButton({
  report,
  variant = "outline",
  size = "default",
  showLabel = true,
  className = "",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  // Plantilla por defecto con el formato especificado
  const defaultTemplate = {
    id: "default",
    name: "Plantilla Estándar",
    styles: {
      fontFamily: "Calibri",
      primaryColor: "#000000", // Negro para todo el texto
      secondaryColor: "#666666",
      headerStyle: "bold-uppercase",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait" as const,
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
      textAlignment: "justified" as const,
    },
  }

  const handleExport = async (format: "pdf" | "word" | "excel") => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)

    try {
      toast({
        title: "Exportando reporte",
        description: `Preparando ${report.title} en formato ${format.toUpperCase()}...`,
        duration: 3000,
      })

      const result = await exportReport(report, format, defaultTemplate, (progress, message) => {
        if (progress === 100) {
          toast({
            title: "Exportación completada",
            description: "El archivo se descargará automáticamente",
            duration: 3000,
          })
        }
      })

      downloadBlob(result.blob, result.filename)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "Error desconocido durante la exportación",
        duration: 5000,
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "word":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      default:
        return <FileDown className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {showLabel && `Exportando ${exportFormat?.toUpperCase() || ""}...`}
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              {showLabel && "Exportar"}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={isExporting}>
          <FilePdf className="h-4 w-4 text-red-500 mr-2" />
          <span>Exportar como PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("word")} disabled={isExporting}>
          <FileText className="h-4 w-4 text-blue-500 mr-2" />
          <span>Exportar como Word</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 text-green-500 mr-2" />
          <span>Exportar como Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
