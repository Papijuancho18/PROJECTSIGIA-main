"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save } from "lucide-react"

interface TableData {
  id: string
  title: string
  headers: string[]
  rows: string[][]
}

interface VisualTableEditorProps {
  initialData?: TableData
  onSave?: (tableData: TableData) => void
  readOnly?: boolean
  tableId?: string
}

export default function VisualTableEditor({
  initialData,
  onSave,
  readOnly = false,
  tableId = `table-${Date.now()}`,
}: VisualTableEditorProps) {
  const [tableData, setTableData] = useState<TableData>({
    id: tableId,
    title: initialData?.title || "Nueva Tabla",
    headers: initialData?.headers || ["Columna 1", "Columna 2", "Columna 3"],
    rows: initialData?.rows || [
      ["", "", ""],
      ["", "", ""],
    ],
  })

  // Registrar la tabla en una variable global para exportación
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Crear el objeto global si no existe
      if (!window.__GLOBAL_TABLES__) {
        window.__GLOBAL_TABLES__ = {}
      }

      // Guardar los datos de la tabla
      window.__GLOBAL_TABLES__[tableData.id] = tableData

      console.log(`Tabla ${tableData.id} registrada para exportación`, window.__GLOBAL_TABLES__[tableData.id])
    }

    return () => {
      // Limpiar al desmontar
      if (typeof window !== "undefined" && window.__GLOBAL_TABLES__ && tableData.id) {
        delete window.__GLOBAL_TABLES__[tableData.id]
      }
    }
  }, [tableData])

  const updateHeader = (index: number, value: string) => {
    if (readOnly) return
    const newHeaders = [...tableData.headers]
    newHeaders[index] = value
    setTableData({ ...tableData, headers: newHeaders })
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (readOnly) return
    const newRows = [...tableData.rows]
    if (!newRows[rowIndex]) {
      newRows[rowIndex] = Array(tableData.headers.length).fill("")
    }
    newRows[rowIndex][colIndex] = value
    setTableData({ ...tableData, rows: newRows })
  }

  const addRow = () => {
    if (readOnly) return
    const newRow = Array(tableData.headers.length).fill("")
    setTableData({ ...tableData, rows: [...tableData.rows, newRow] })
  }

  const removeRow = (index: number) => {
    if (readOnly) return
    const newRows = tableData.rows.filter((_, i) => i !== index)
    setTableData({ ...tableData, rows: newRows })
  }

  const addColumn = () => {
    if (readOnly) return
    const newHeaders = [...tableData.headers, `Columna ${tableData.headers.length + 1}`]
    const newRows = tableData.rows.map((row) => [...row, ""])
    setTableData({ ...tableData, headers: newHeaders, rows: newRows })
  }

  const removeColumn = (index: number) => {
    if (readOnly) return
    const newHeaders = tableData.headers.filter((_, i) => i !== index)
    const newRows = tableData.rows.map((row) => row.filter((_, i) => i !== index))
    setTableData({ ...tableData, headers: newHeaders, rows: newRows })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(tableData)
    }
  }

  return (
    <div className="space-y-4" data-table-id={tableData.id}>
      <div className="flex justify-between items-center">
        <Input
          value={tableData.title}
          onChange={(e) => setTableData({ ...tableData, title: e.target.value })}
          className="font-bold text-lg max-w-md"
          disabled={readOnly}
        />

        {!readOnly && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addColumn}>
              <Plus className="h-4 w-4 mr-1" /> Columna
            </Button>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-1" /> Fila
            </Button>
            {onSave && (
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Guardar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableData.headers.map((header, index) => (
                <TableHead key={index} className="min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="font-medium"
                      disabled={readOnly}
                    />
                    {!readOnly && tableData.headers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumn(index)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
              {!readOnly && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {tableData.headers.map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-0">
                    <Input
                      value={row[colIndex] || ""}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border-0 focus:ring-0"
                      disabled={readOnly}
                    />
                  </TableCell>
                ))}
                {!readOnly && (
                  <TableCell className="w-10 p-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(rowIndex)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
