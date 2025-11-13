"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TemplateExportManager } from "./template-export-manager"
import { TemplateImportManager } from "./template-import-manager"
import { ArrowUpDown, Download, Upload, History, Info, CheckCircle, AlertTriangle, Clock } from "lucide-react"

// Historial de transferencias de ejemplo
const transferHistory = [
  {
    id: "transfer-1",
    type: "export",
    date: "2024-01-15T10:30:00Z",
    templates: 3,
    format: "json",
    status: "success",
    description: "Exportación de plantillas académicas",
  },
  {
    id: "transfer-2",
    type: "import",
    date: "2024-01-14T15:45:00Z",
    templates: 5,
    format: "zip",
    status: "success",
    description: "Importación desde sistema departamental",
  },
  {
    id: "transfer-3",
    type: "export",
    date: "2024-01-12T09:15:00Z",
    templates: 2,
    format: "package",
    status: "partial",
    description: "Exportación con algunos errores",
  },
  {
    id: "transfer-4",
    type: "import",
    date: "2024-01-10T14:20:00Z",
    templates: 1,
    format: "json",
    status: "failed",
    description: "Falló por formato incompatible",
  },
]

export function TemplateTransferManager() {
  const [activeTab, setActiveTab] = useState("export")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Exitoso</Badge>
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Parcial</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fallido</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Transferencia de Plantillas
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Importe y exporte plantillas para compartir entre sistemas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Importar</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Historial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="mt-0">
              <TemplateExportManager />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <TemplateImportManager />
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Historial de Transferencias</h3>
                <Button variant="outline" size="sm">
                  Limpiar historial
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Información del historial</AlertTitle>
                <AlertDescription>
                  Se mantiene un registro de todas las operaciones de importación y exportación para auditoría y
                  seguimiento.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {transferHistory.map((transfer) => (
                  <Card key={transfer.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {transfer.type === "export" ? (
                              <Download className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Upload className="h-5 w-5 text-green-500" />
                            )}
                            <div>
                              <h4 className="font-medium">
                                {transfer.type === "export" ? "Exportación" : "Importación"}
                              </h4>
                              <p className="text-sm text-gray-600">{transfer.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <div className="font-medium">{transfer.templates} plantilla(s)</div>
                            <div className="text-gray-500">{formatDate(transfer.date)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {transfer.format}
                            </Badge>
                            {getStatusBadge(transfer.status)}
                          </div>
                          {getStatusIcon(transfer.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {transferHistory.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay transferencias registradas</h3>
                  <p className="text-gray-500">Las operaciones de importación y exportación aparecerán aquí.</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium text-blue-700">
                    {transferHistory.filter((t) => t.type === "export").length}
                  </div>
                  <div className="text-blue-600">Exportaciones</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium text-green-700">
                    {transferHistory.filter((t) => t.type === "import").length}
                  </div>
                  <div className="text-green-600">Importaciones</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded">
                  <div className="font-medium text-emerald-700">
                    {transferHistory.filter((t) => t.status === "success").length}
                  </div>
                  <div className="text-emerald-600">Exitosas</div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="font-medium text-red-700">
                    {transferHistory.filter((t) => t.status === "failed").length}
                  </div>
                  <div className="text-red-600">Fallidas</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
