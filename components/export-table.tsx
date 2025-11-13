"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExportButton } from "@/components/export-button"
import { FileText, FileIcon as FilePdf, FileSpreadsheet } from "lucide-react"
import type { ReportData } from "@/utils/report-export"

interface ExportTableProps {
  reports: ReportData[]
}

export function ExportTable({ reports }: ExportTableProps) {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "word":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Table>
      <TableHeader className="bg-highlight">
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id} className="hover:bg-highlight/50">
            <TableCell className="font-medium">{report.title}</TableCell>
            <TableCell>{report.author}</TableCell>
            <TableCell>{new Date(report.updatedAt).toLocaleDateString("es-ES")}</TableCell>
            <TableCell>
              <Badge
                variant={report.status === "draft" ? "outline" : "default"}
                className={report.status === "draft" ? "border-primary/20 text-primary" : ""}
              >
                {report.status === "draft" ? "Borrador" : "Publicado"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <ExportButton report={report} variant="outline" size="sm" showLabel={false} />
            </TableCell>
          </TableRow>
        ))}

        {reports.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
              No hay informes disponibles para exportar
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
