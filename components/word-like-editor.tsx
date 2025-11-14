"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, List, ListOrdered, ImageIcon, Table, BarChart3, Download, Eye } from "lucide-react"
import { TableCreationModal } from "./table-creation-modal"
import { ChartCreationModal } from "./chart-creation-modal"
import EnhancedChartPreview from "./enhanced-chart-preview"
import { VisualChartEditorInline } from "./visual-chart-editor-inline"
// Remover la importación estática de VisualTableEditorInline


interface WordLikeEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function WordLikeEditor({
  initialContent = "",
  onChange,
  reportId,
  sectionId,
  readOnly = false,
}: WordLikeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Actualizar contenido cuando cambie el prop
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  // Notificar cambios
  const handleContentChange = useCallback(
    (newContent: string) => {
      console.log("📝 WordLikeEditor: Content changed, length:", newContent.length)
      setContent(newContent)
      if (onChange) {
        console.log("📤 WordLikeEditor: Calling onChange callback")
        onChange(newContent)
      }
    },
    [onChange],
  )

  // Funciones de formato de texto
  const insertFormatting = (before: string, after = "") => {
    if (!textareaRef.current || readOnly) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)

    handleContentChange(newContent)

    // Restaurar el foco y posición del cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatBold = () => insertFormatting("**", "**")
  const formatItalic = () => insertFormatting("*", "*")
  const formatUnderline = () => insertFormatting("<u>", "</u>")

  const insertHeading = (level: number) => {
    const prefix = "#".repeat(level) + " "
    insertFormatting("\n" + prefix)
  }

  const insertList = (ordered = false) => {
    const prefix = ordered ? "1. " : "- "
    insertFormatting("\n" + prefix)
  }

  // Insertar tabla
  const insertTable = (rows: number, cols: number) => {
    const tableId = `table-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const headers = Array.from({ length: cols }, (_, i) => `Columna ${i + 1}`)
    const dataRows = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => `Dato ${i + 1},${j + 1}`),
    )

    const tableData = {
      id: tableId,
      title: `Nueva Tabla`,
      headers: headers,
      rows: dataRows,
    }

    const tableBlock = `

\`\`\`table
${JSON.stringify(tableData, null, 2)}
\`\`\`

`
    insertFormatting(tableBlock)
    setShowTableModal(false)
  }

  // Insertar gráfico
  const insertChart = (chartData: any) => {
    const chartBlock = `

\`\`\`chart
${JSON.stringify(chartData, null, 2)}
\`\`\`

`
    insertFormatting(chartBlock)
    setShowChartModal(false)
  }

  // Insertar imagen
  const insertImage = (url: string, alt = "Imagen") => {
    const imageMarkdown = `![${alt}](${url})`
    insertFormatting(imageMarkdown)
    setShowImageModal(false)
  }

  // Actualizar gráfico existente
  const updateChart = (blockIndex: number, newChartData: any) => {
    console.log("📊 WordLikeEditor: Updating chart at index", blockIndex, "with data:", newChartData)

    const blocks = processContentForPreview(content)
    const chartBlocks = blocks.filter((block) => block.type === "chart")

    if (blockIndex < chartBlocks.length) {
      // Encontrar el bloque de gráfico en el contenido original y reemplazarlo
      const chartRegex = /```chart\s+([\s\S]+?)\s+```/g
      let match
      let chartCount = 0
      let foundMatch = false

      const newContent = content.replace(chartRegex, (fullMatch, chartJson) => {
        if (chartCount === blockIndex) {
          foundMatch = true
          chartCount++
          console.log("📊 WordLikeEditor: Replacing chart block", blockIndex)
          return `\`\`\`chart
${JSON.stringify(newChartData, null, 2)}
\`\`\``
        }
        chartCount++
        return fullMatch
      })

      if (foundMatch) {
        console.log("📊 WordLikeEditor: Chart updated successfully")
        handleContentChange(newContent)
      } else {
        console.warn("📊 WordLikeEditor: Chart block not found for index", blockIndex)
      }
    }
  }

  // Procesar contenido para vista previa
  const processContentForPreview = (content: string) => {
    const blocks = []
    const lines = content.split("\n")
    let currentBlock = ""
    let inCodeBlock = false
    let codeBlockType = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // Fin del bloque de código
          if (codeBlockType === "chart") {
            try {
              const chartData = JSON.parse(currentBlock)
              blocks.push({
                type: "chart",
                content: chartData,
              })
            } catch (error) {
              blocks.push({
                type: "text",
                content: "Error al procesar el gráfico",
              })
            }
          } else if (codeBlockType === "table") {
            try {
              const tableData = JSON.parse(currentBlock)
              blocks.push({
                type: "table",
                content: tableData,
              })
            } catch (error) {
              blocks.push({
                type: "text",
                content: "Error al procesar la tabla",
              })
            }
          } else {
            blocks.push({
              type: "code",
              content: currentBlock,
              language: codeBlockType,
            })
          }
          currentBlock = ""
          inCodeBlock = false
          codeBlockType = ""
        } else {
          // Inicio del bloque de código
          if (currentBlock.trim()) {
            blocks.push({
              type: "text",
              content: currentBlock.trim(),
            })
          }
          currentBlock = ""
          inCodeBlock = true
          codeBlockType = line.substring(3).trim()
        }
      } else if (inCodeBlock) {
        currentBlock += line + "\n"
      } else {
        currentBlock += line + "\n"
      }
    }

    // Agregar el último bloque si no está vacío
    if (currentBlock.trim()) {
      blocks.push({
        type: "text",
        content: currentBlock.trim(),
      })
    }

    return blocks
  }

  // Actualizar tabla existente
  const updateTable = (blockIndex: number, newTableData: any) => {
    console.log("📋 WordLikeEditor: Updating table at index", blockIndex, "with data:", newTableData)

    const blocks = processContentForPreview(content)
    const tableBlocks = blocks.filter((block) => block.type === "table")

    if (blockIndex < tableBlocks.length) {
      // Encontrar el bloque de tabla en el contenido original y reemplazarlo
      const tableRegex = /```table\s+([\s\S]+?)\s+```/g
      let match
      let tableCount = 0
      let foundMatch = false

      const newContent = content.replace(tableRegex, (fullMatch, tableJson) => {
        if (tableCount === blockIndex) {
          foundMatch = true
          tableCount++
          console.log("📋 WordLikeEditor: Replacing table block", blockIndex)
          return `\`\`\`table
${JSON.stringify(newTableData, null, 2)}
\`\`\``
        }
        tableCount++
        return fullMatch
      })

      if (foundMatch) {
        console.log("📋 WordLikeEditor: Table updated successfully")
        handleContentChange(newContent)
      } else {
        console.warn("📋 WordLikeEditor: Table block not found for index", blockIndex)
      }
    }
  }

  // Renderizar bloque de contenido
  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case "chart":
        // Calcular el índice real del gráfico (solo contar bloques de gráficos)
        const blocks = processContentForPreview(content)
        const chartBlocks = blocks.slice(0, index + 1).filter((b) => b.type === "chart")
        const chartIndex = chartBlocks.length - 1

        return (
          <div key={index} className="my-4">
            {isPreviewMode ? (
              // Modo vista previa: solo el gráfico estático
              <div className="p-4 border rounded-lg bg-gray-50">
                <EnhancedChartPreview chartData={block.content} width={500} height={350} interactive={false} />
              </div>
            ) : (
              // Modo edición: editor visual del gráfico
              <VisualChartEditorInline
                chartData={block.content}
                onDataChange={(newData) => {
                  console.log("📊 WordLikeEditor: Chart data changed for index", chartIndex)
                  updateChart(chartIndex, newData)
                }}
                onEdit={() => {
                  // Aquí podrías abrir un editor más avanzado si es necesario
                  console.log("Open advanced editor for chart", chartIndex)
                }}
              />
            )}
          </div>
        )

      case "code":
        return (
          <div key={index} className="my-4">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{block.content}</code>
            </pre>
          </div>
        )

      case "table":
        // Calcular el índice real de la tabla (solo contar bloques de tablas)
        const allBlocks = processContentForPreview(content)
        const tableBlocks = allBlocks.slice(0, index + 1).filter((b) => b.type === "table")
        const tableIndex = tableBlocks.length - 1

        return (
          <div key={index} className="my-4">
            {isPreviewMode ? (
              // Modo vista previa: solo la tabla estática
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      {block.content.headers.map((header, headerIndex) => (
                        <th key={headerIndex} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.content.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Modo edición: editor visual de tabla (versión simplificada temporal)
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="text-sm font-medium mb-2">Editor de Tabla (Simplificado)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {block.content.headers.map((header, headerIndex) => (
                          <th key={headerIndex} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.content.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    console.log("📋 WordLikeEditor: Table data changed for index", tableIndex)
                    // updateTable(tableIndex, newData) // Comentado temporalmente
                  }}
                >
                  Editar Tabla
                </Button>
              </div>
            )}
          </div>
        )

      case "text":
      default:
        return (
          <div key={index} className="my-4">
            {block.content.split("\n").map((line: string, lineIndex: number) => {
              // Procesar markdown básico
              if (line.startsWith("# ")) {
                return (
                  <h1 key={lineIndex} className="text-3xl font-bold my-4">
                    {line.substring(2)}
                  </h1>
                )
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={lineIndex} className="text-2xl font-bold my-3">
                    {line.substring(3)}
                  </h2>
                )
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={lineIndex} className="text-xl font-bold my-2">
                    {line.substring(4)}
                  </h3>
                )
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <ul key={lineIndex} className="list-disc list-inside my-2">
                    <li>{line.substring(2)}</li>
                  </ul>
                )
              }
              if (/^\d+\. /.test(line)) {
                return (
                  <ol key={lineIndex} className="list-decimal list-inside my-2">
                    <li>{line.replace(/^\d+\. /, "")}</li>
                  </ol>
                )
              }
              if (line.includes("|") && line.includes("---")) {
                // Es una tabla markdown
                return null // Las tablas se procesan por separado
              }

              // Procesar texto con formato
              let processedLine = line
              processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              processedLine = processedLine.replace(/\*(.*?)\*/g, "<em>$1</em>")
              processedLine = processedLine.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
              processedLine = processedLine.replace(
                /!\[(.*?)\]$$(.*?)$$/g,
                '<img src="$2" alt="$1" class="max-w-full h-auto my-2" />',
              )

              return <p key={lineIndex} className="my-2" dangerouslySetInnerHTML={{ __html: processedLine }} />
            })}
          </div>
        )
    }
  }

  // Exportar contenido
  const exportContent = (format: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `documento.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Barra de herramientas */}
      {!readOnly && (
        <div className="border-b p-2 bg-gray-50">
          <div className="flex flex-wrap gap-1">
            {/* Formato de texto */}
            <div className="flex gap-1 mr-2">
              <Button variant="outline" size="sm" onClick={formatBold} title="Negrita">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={formatItalic} title="Cursiva">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={formatUnderline} title="Subrayado">
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Encabezados */}
            <div className="flex gap-1 mr-2">
              <Button variant="outline" size="sm" onClick={() => insertHeading(1)} title="Título 1">
                H1
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertHeading(2)} title="Título 2">
                H2
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertHeading(3)} title="Título 3">
                H3
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Listas */}
            <div className="flex gap-1 mr-2">
              <Button variant="outline" size="sm" onClick={() => insertList(false)} title="Lista">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertList(true)} title="Lista numerada">
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Insertar elementos */}
            <div className="flex gap-1 mr-2">
              <Button variant="outline" size="sm" onClick={() => setShowTableModal(true)} title="Insertar tabla">
                <Table className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowChartModal(true)} title="Insertar gráfico">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImageModal(true)} title="Insertar imagen">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Vista previa y exportar */}
            <div className="flex gap-1">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                title="Vista previa"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportContent("md")} title="Exportar">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Área de contenido */}
      <div className="flex-1 p-4">
        {isPreviewMode ? (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
            <div className="border rounded-lg p-4 bg-white min-h-[400px]">
              {processContentForPreview(content).map((block, index) => renderBlock(block, index))}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {/* Editor de texto */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Comienza a escribir tu documento..."
                className="w-full h-full min-h-[400px] resize-none border-0 focus:ring-0 text-base leading-relaxed"
                readOnly={readOnly}
              />
            </div>

            {/* Vista previa en vivo */}
            <div className="flex-1 border-l pl-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista en Vivo</h4>
              <div className="border rounded-lg p-4 bg-white h-full overflow-y-auto">
                {processContentForPreview(content).map((block, index) => renderBlock(block, index))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para insertar tabla */}
      <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Insertar Tabla</DialogTitle>
            <DialogDescription>Selecciona el tamaño de la tabla que deseas crear</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <TableCreationModal onCreateTable={insertTable} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal para insertar gráfico */}
      <Dialog open={showChartModal} onOpenChange={setShowChartModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Insertar Gráfico</DialogTitle>
            <DialogDescription>Crea un nuevo gráfico o selecciona una plantilla prediseñada</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <ChartCreationModal onCreateChart={insertChart} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal para insertar imagen */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insertar Imagen</DialogTitle>
            <DialogDescription>Agrega una imagen a tu documento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">URL de la imagen</label>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const url = (e.target as HTMLInputElement).value
                    if (url) insertImage(url)
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImageModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="ejemplo.com"]') as HTMLInputElement
                  if (input?.value) insertImage(input.value)
                }}
              >
                Insertar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WordLikeEditor
