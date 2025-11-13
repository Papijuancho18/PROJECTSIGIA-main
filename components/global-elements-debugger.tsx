"use client"

import { useState } from "react"
import { useGlobalElements } from "@/contexts/global-elements-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const GlobalElementsDebugger = () => {
  const { elements, debug, setDebug } = useGlobalElements()
  const [isOpen, setIsOpen] = useState(false)

  if (!debug) {
    return null
  }

  const charts = Object.values(elements).filter((element) => element.type === "chart")
  const tables = Object.values(elements).filter((element) => element.type === "table")

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-white shadow-md">
        {isOpen ? "Cerrar Depurador" : "Abrir Depurador"}
      </Button>

      {isOpen && (
        <Card className="w-[500px] max-h-[600px] overflow-auto shadow-xl">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Depurador de Elementos Globales</span>
              <div className="flex items-center space-x-2">
                <Checkbox id="debug-mode" checked={debug} onCheckedChange={(checked) => setDebug(!!checked)} />
                <Label htmlFor="debug-mode" className="text-sm font-normal">
                  Modo depuración
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="charts">Gráficos ({charts.length})</TabsTrigger>
                <TabsTrigger value="tables">Tablas ({tables.length})</TabsTrigger>
                <TabsTrigger value="all">Todos ({Object.keys(elements).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="p-4 space-y-4">
                {charts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay gráficos registrados</p>
                ) : (
                  charts.map((chart) => (
                    <div key={chart.id} className="border rounded-md p-2 text-sm">
                      <div className="font-medium">ID: {chart.id}</div>
                      <div>Informe: {chart.reportId || "N/A"}</div>
                      <div>Sección: {chart.sectionId || "N/A"}</div>
                      <div>Título: {chart.content.title || chart.content.name || "Sin título"}</div>
                      <div>Tipo: {chart.content.type || "N/A"}</div>
                      <div>Datos: {chart.content.data ? chart.content.data.length : 0} valores</div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tables" className="p-4 space-y-4">
                {tables.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay tablas registradas</p>
                ) : (
                  tables.map((table) => (
                    <div key={table.id} className="border rounded-md p-2 text-sm">
                      <div className="font-medium">ID: {table.id}</div>
                      <div>Informe: {table.reportId || "N/A"}</div>
                      <div>Sección: {table.sectionId || "N/A"}</div>
                      <div>Nombre: {table.content.name || "Sin nombre"}</div>
                      <div>Filas: {table.content.rows ? table.content.rows.length : 0}</div>
                      <div>Columnas: {table.content.headers ? table.content.headers.length : 0}</div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="p-4 space-y-4">
                {Object.keys(elements).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay elementos registrados</p>
                ) : (
                  Object.values(elements).map((element) => (
                    <div key={element.id} className="border rounded-md p-2 text-sm">
                      <div className="font-medium">ID: {element.id}</div>
                      <div>Tipo: {element.type}</div>
                      <div>Informe: {element.reportId || "N/A"}</div>
                      <div>Sección: {element.sectionId || "N/A"}</div>
                      <div className="mt-1 pt-1 border-t">
                        <details>
                          <summary className="cursor-pointer">Ver contenido</summary>
                          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(element.content, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
