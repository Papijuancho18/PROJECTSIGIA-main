"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Download, FileDown, Package, Archive } from "lucide-react"

interface ExportProgressDialogProps {
  isOpen: boolean
  onClose: () => void
  progress: number
  status: "idle" | "exporting" | "success" | "error"
  message?: string
  filename?: string
  format?: string
  templateCount?: number
}

export function ExportProgressDialog({
  isOpen,
  onClose,
  progress,
  status,
  message,
  filename,
  format,
  templateCount,
}: ExportProgressDialogProps) {
  const getFormatIcon = (format?: string) => {
    switch (format) {
      case "json":
        return <FileDown className="h-5 w-5 text-blue-500" />
      case "zip":
        return <Archive className="h-5 w-5 text-green-500" />
      case "package":
        return <Package className="h-5 w-5 text-purple-500" />
      default:
        return <Download className="h-5 w-5" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "exporting":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFormatIcon(format)}
            Exportando Plantillas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {templateCount && (
            <div className="text-sm text-gray-600">
              Exportando {templateCount} plantilla(s) en formato {format?.toUpperCase()}
            </div>
          )}

          {status === "exporting" && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{message || "Procesando..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Exportación completada</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{message}</p>
                {filename && (
                  <p className="text-sm text-gray-600">
                    Archivo generado: <span className="font-mono">{filename}</span>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 border-red-200" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error en la exportación</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            {status === "success" || status === "error" ? (
              <Button onClick={onClose}>Cerrar</Button>
            ) : (
              <Button variant="outline" onClick={onClose} disabled={status === "exporting"}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
