"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus } from "lucide-react"

interface TableCreationModalProps {
  onCreateTable: (rows: number, cols: number) => void
}

export function TableCreationModal({ onCreateTable }: TableCreationModalProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [customHeaders, setCustomHeaders] = useState<string[]>([])
  const [customData, setCustomData] = useState<string[][]>([])

  // Plantillas predefinidas de tablas
  const tableTemplates = [
    {
      name: "Evaluación Docente",
      description: "Tabla para resultados de evaluación docente",
      headers: ["Criterio", "Puntaje 2022", "Puntaje 2023", "Variación"],
      data: [
        ["Dominio del tema", "4.2", "4.5", "+0.3"],
        ["Claridad expositiva", "3.8", "4.2", "+0.4"],
        ["Material didáctico", "4.0", "4.1", "+0.1"],
      ],
    },
    {
      name: "Indicadores Académicos",
      description: "Tabla de indicadores por programa",
      headers: ["Programa", "Retención", "Graduación", "Satisfacción"],
      data: [
        ["Ingeniería", "92%", "85%", "4.2/5"],
        ["Medicina", "95%", "90%", "4.5/5"],
        ["Administración", "90%", "82%", "4.0/5"],
      ],
    },
    {
      name: "Cronograma",
      description: "Tabla de actividades y fechas",
      headers: ["Actividad", "Fecha Inicio", "Fecha Fin", "Responsable"],
      data: [
        ["Planificación", "01/03/2024", "15/03/2024", "Coordinador"],
        ["Ejecución", "16/03/2024", "30/04/2024", "Equipo"],
        ["Evaluación", "01/05/2024", "15/05/2024", "Director"],
      ],
    },
  ]

  const createCustomTable = () => {
    onCreateTable(rows, cols)
  }

  const createFromTemplate = (template: (typeof tableTemplates)[0]) => {
    // Crear tabla basada en plantilla
    const tableData = {
      headers: template.headers,
      data: template.data,
    }

    // Simular la creación con el número correcto de filas y columnas
    onCreateTable(template.data.length, template.headers.length)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom">Tabla Personalizada</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Tabla Personalizada</CardTitle>
              <CardDescription>Define el tamaño de tu tabla personalizada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Número de Filas</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRows(Math.max(1, rows - 1))}
                      disabled={rows <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="rows"
                      type="number"
                      value={rows}
                      onChange={(e) => setRows(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                      max="20"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRows(Math.min(20, rows + 1))}
                      disabled={rows >= 20}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cols">Número de Columnas</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCols(Math.max(1, cols - 1))}
                      disabled={cols <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="cols"
                      type="number"
                      value={cols}
                      onChange={(e) => setCols(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                      max="10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCols(Math.min(10, cols + 1))}
                      disabled={cols >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vista previa de la tabla */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Vista Previa:</h4>
                <div className="overflow-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {Array.from({ length: cols }, (_, i) => (
                          <th key={i} className="border border-gray-300 p-2 text-left">
                            Columna {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rows }, (_, i) => (
                        <tr key={i}>
                          {Array.from({ length: cols }, (_, j) => (
                            <td key={j} className="border border-gray-300 p-2">
                              Celda {i + 1},{j + 1}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button onClick={createCustomTable} className="w-full">
                Crear Tabla ({rows}x{cols})
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {tableTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 overflow-auto max-h-32">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          {template.headers.map((header, i) => (
                            <th key={i} className="border border-gray-300 p-2 text-left">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {template.data.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-gray-300 p-2">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button onClick={() => createFromTemplate(template)} className="w-full">
                    Usar Esta Plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
