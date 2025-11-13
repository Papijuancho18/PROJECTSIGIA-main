"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

export interface TableTemplate {
  id: string
  name: string
  description: string
  category: string
  rowHeaders: string[]
  columnHeaders: string[]
  data: string[][]
}

// Plantillas predefinidas
export const predefinedTemplates: TableTemplate[] = [
  {
    id: "academic-performance",
    name: "Rendimiento Académico",
    description: "Tabla para comparar rendimiento académico por programa y período",
    category: "académico",
    rowHeaders: ["Ingeniería", "Medicina", "Administración", "Derecho", "Psicología"],
    columnHeaders: ["Programa", "2023-1", "2023-2", "2024-1", "Promedio"],
    data: [
      ["85%", "87%", "86%", "86%"],
      ["90%", "92%", "91%", "91%"],
      ["82%", "84%", "85%", "83.7%"],
      ["88%", "86%", "89%", "87.7%"],
      ["87%", "89%", "88%", "88%"],
    ],
  },
  {
    id: "satisfaction-survey",
    name: "Encuesta de Satisfacción",
    description: "Resultados de encuestas de satisfacción por categoría",
    category: "evaluación",
    rowHeaders: ["Docencia", "Infraestructura", "Servicios", "Contenido", "Administración"],
    columnHeaders: ["Categoría", "Excelente", "Bueno", "Regular", "Insuficiente"],
    data: [
      ["45%", "35%", "15%", "5%"],
      ["30%", "40%", "20%", "10%"],
      ["25%", "45%", "20%", "10%"],
      ["50%", "30%", "15%", "5%"],
      ["35%", "40%", "20%", "5%"],
    ],
  },
  {
    id: "budget-allocation",
    name: "Asignación Presupuestaria",
    description: "Distribución del presupuesto por departamento y categoría",
    category: "administrativo",
    rowHeaders: ["Facultad de Ciencias", "Facultad de Humanidades", "Investigación", "Extensión", "Administración"],
    columnHeaders: ["Departamento", "Personal", "Equipamiento", "Operación", "Total"],
    data: [
      ["$500,000", "$150,000", "$100,000", "$750,000"],
      ["$450,000", "$100,000", "$80,000", "$630,000"],
      ["$300,000", "$200,000", "$50,000", "$550,000"],
      ["$200,000", "$50,000", "$150,000", "$400,000"],
      ["$350,000", "$80,000", "$120,000", "$550,000"],
    ],
  },
  {
    id: "research-metrics",
    name: "Métricas de Investigación",
    description: "Indicadores de producción científica por facultad",
    category: "investigación",
    rowHeaders: ["Ciencias", "Ingeniería", "Medicina", "Humanidades", "Ciencias Sociales"],
    columnHeaders: ["Facultad", "Publicaciones", "Proyectos", "Patentes", "Índice de Impacto"],
    data: [
      ["45", "12", "2", "3.5"],
      ["38", "15", "5", "3.2"],
      ["52", "18", "3", "4.1"],
      ["25", "8", "0", "2.8"],
      ["30", "10", "1", "3.0"],
    ],
  },
  {
    id: "enrollment-trends",
    name: "Tendencias de Matrícula",
    description: "Evolución de matrículas por programa en los últimos años",
    category: "académico",
    rowHeaders: ["Ingeniería de Sistemas", "Medicina", "Administración", "Derecho", "Psicología"],
    columnHeaders: ["Programa", "2021", "2022", "2023", "Variación"],
    data: [
      ["450", "480", "520", "+15.6%"],
      ["320", "350", "380", "+18.8%"],
      ["380", "400", "410", "+7.9%"],
      ["290", "310", "300", "+3.4%"],
      ["250", "280", "310", "+24.0%"],
    ],
  },
]

export function TableTemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: TableTemplate
  onSave: (template: TableTemplate) => void
  onCancel: () => void
}) {
  const [editedTemplate, setEditedTemplate] = useState<TableTemplate>({ ...template })

  const handleRowHeaderChange = (index: number, value: string) => {
    const newRowHeaders = [...editedTemplate.rowHeaders]
    newRowHeaders[index] = value
    setEditedTemplate({ ...editedTemplate, rowHeaders: newRowHeaders })
  }

  const handleColumnHeaderChange = (index: number, value: string) => {
    const newColumnHeaders = [...editedTemplate.columnHeaders]
    newColumnHeaders[index] = value
    setEditedTemplate({ ...editedTemplate, columnHeaders: newColumnHeaders })
  }

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...editedTemplate.data]
    if (!newData[rowIndex]) {
      newData[rowIndex] = []
    }
    newData[rowIndex][colIndex] = value
    setEditedTemplate({ ...editedTemplate, data: newData })
  }

  const addRow = () => {
    const newRowHeaders = [...editedTemplate.rowHeaders, "Nueva fila"]
    const newData = [...editedTemplate.data]
    newData.push(Array(editedTemplate.columnHeaders.length - 1).fill(""))
    setEditedTemplate({ ...editedTemplate, rowHeaders: newRowHeaders, data: newData })
  }

  const removeRow = (index: number) => {
    const newRowHeaders = [...editedTemplate.rowHeaders]
    newRowHeaders.splice(index, 1)
    const newData = [...editedTemplate.data]
    newData.splice(index, 1)
    setEditedTemplate({ ...editedTemplate, rowHeaders: newRowHeaders, data: newData })
  }

  const addColumn = () => {
    const newColumnHeaders = [...editedTemplate.columnHeaders, "Nueva columna"]
    const newData = editedTemplate.data.map((row) => [...row])

    editedTemplate.data.forEach((row, rowIndex) => {
      newData[rowIndex] = [...row, ""]
    })

    setEditedTemplate({ ...editedTemplate, columnHeaders: newColumnHeaders, data: newData })
  }

  const removeColumn = (index: number) => {
    if (index === 0) return

    const newColumnHeaders = [...editedTemplate.columnHeaders]
    newColumnHeaders.splice(index, 1)

    const newData = editedTemplate.data.map((row) => {
      const newRow = [...row]
      newRow.splice(index, 1)
      return newRow
    })

    setEditedTemplate({ ...editedTemplate, columnHeaders: newColumnHeaders, data: newData })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor de Plantilla</h2>
          <p className="text-gray-500">Edite los campos de la plantilla</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(editedTemplate)}>Guardar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Nombre
                </label>
                <Input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Descripción
                </label>
                <Input
                  type="text"
                  value={editedTemplate.description}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Categoría
                </label>
                <Input
                  type="text"
                  value={editedTemplate.category}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, category: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tabla</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]"> </TableHead>
                      {editedTemplate.columnHeaders.map((header, index) => (
                        <TableHead key={index} className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={header}
                              onChange={(e) => handleColumnHeaderChange(index, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeColumn(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[50px]">
                        <Button variant="ghost" size="icon" onClick={addColumn}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedTemplate.rowHeaders.map((rowHeader, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={rowHeader}
                              onChange={(e) => handleRowHeaderChange(rowIndex, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        {editedTemplate.data[rowIndex]?.map((cell, colIndex) => (
                          <TableCell key={colIndex}>
                            <Input
                              type="text"
                              value={cell || ""}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={addRow}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
