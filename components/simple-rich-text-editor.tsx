"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ImageIcon,
  Link,
  Table,
  BarChart,
  Trash,
  Eye,
  FileDown,
  Edit,
  Pilcrow,
  Indent,
  Outdent,
  Palette,
  Quote,
  Code,
  ListChecks,
  Undo,
  Redo,
  Superscript,
  Subscript,
  Strikethrough,
  Highlighter,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Importar el contexto global de elementos
import { useGlobalElements } from "@/contexts/global-elements-context"

interface SimpleRichTextEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

// Interfaces para los datos de tablas y gráficos
interface TableData {
  id: string
  name: string
  headers: string[]
  rows: string[][]
}

interface ChartData {
  id: string
  name: string
  type: "bar" | "line" | "pie" | "donut"
  title: string
  labels: string[]
  data: number[]
  backgroundColor?: string[]
  borderColor?: string[]
  showAxes?: boolean
}

// Plantillas predefinidas para tablas
const TABLE_TEMPLATES = [
  {
    id: "simple",
    name: "Tabla Simple",
    headers: ["Encabezado 1", "Encabezado 2", "Encabezado 3"],
    rows: [
      ["Dato 1-1", "Dato 1-2", "Dato 1-3"],
      ["Dato 2-1", "Dato 2-2", "Dato 2-3"],
    ],
  },
  {
    id: "evaluacion",
    name: "Tabla de Evaluación",
    headers: ["Criterio", "Puntaje", "Observaciones"],
    rows: [
      ["Criterio 1", "0", ""],
      ["Criterio 2", "0", ""],
      ["Criterio 3", "0", ""],
      ["Total", "0", ""],
    ],
  },
  {
    id: "comparativa",
    name: "Tabla Comparativa",
    headers: ["Característica", "Opción A", "Opción B", "Opción C"],
    rows: [
      ["Característica 1", "", "", ""],
      ["Característica 2", "", "", ""],
      ["Característica 3", "", "", ""],
      ["Ventajas", "", "", ""],
      ["Desventajas", "", "", ""],
    ],
  },
  {
    id: "personalizada",
    name: "Tabla Personalizada",
    headers: ["Encabezado 1", "Encabezado 2"],
    rows: [["Dato 1", "Dato 2"]],
  },
]

// Plantillas predefinidas para gráficos
const CHART_TEMPLATES = [
  {
    id: "ventas",
    name: "Gráfico de Ventas",
    type: "bar" as const,
    title: "Ventas Trimestrales",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    data: [120, 150, 180, 210],
  },
  {
    id: "distribucion",
    name: "Distribución de Recursos",
    type: "pie" as const,
    title: "Distribución de Recursos",
    labels: ["Recurso A", "Recurso B", "Recurso C", "Recurso D"],
    data: [30, 25, 20, 25],
  },
  {
    id: "tendencia",
    name: "Tendencia Anual",
    type: "line" as const,
    title: "Tendencia Anual",
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    data: [50, 60, 55, 70, 65, 80],
  },
  {
    id: "comparacion",
    name: "Comparación de Categorías",
    type: "bar" as const,
    title: "Comparación por Categorías",
    labels: ["Cat. A", "Cat. B", "Cat. C", "Cat. D"],
    data: [45, 65, 35, 55],
  },
  {
    id: "personalizado",
    name: "Gráfico Personalizado",
    type: "bar" as const,
    title: "Gráfico Personalizado",
    labels: ["Etiqueta 1", "Etiqueta 2", "Etiqueta 3"],
    data: [50, 60, 70],
  },
]

// Colores predeterminados
const defaultColors = [
  "#3EBD93", // verde
  "#334E68", // azul oscuro
  "#FFCA3A", // amarillo
  "#E63946", // rojo
  "#4361EE", // azul
  "#7209B7", // púrpura
]

// Fuentes disponibles
const AVAILABLE_FONTS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Calibri", value: "Calibri, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Palatino", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { name: "Garamond", value: "Garamond, serif" },
]

// Tamaños de fuente
const FONT_SIZES = [
  { name: "8 pt", value: "8pt" },
  { name: "9 pt", value: "9pt" },
  { name: "10 pt", value: "10pt" },
  { name: "11 pt", value: "11pt" },
  { name: "12 pt", value: "12pt" },
  { name: "14 pt", value: "14pt" },
  { name: "16 pt", value: "16pt" },
  { name: "18 pt", value: "18pt" },
  { name: "20 pt", value: "20pt" },
  { name: "22 pt", value: "22pt" },
  { name: "24 pt", value: "24pt" },
  { name: "26 pt", value: "26pt" },
  { name: "28 pt", value: "28pt" },
  { name: "36 pt", value: "36pt" },
  { name: "48 pt", value: "48pt" },
  { name: "72 pt", value: "72pt" },
]

// Estilos de texto predefinidos
const TEXT_STYLES = [
  { name: "Título 1", tag: "h1", className: "text-3xl font-bold mb-4 text-primary" },
  { name: "Título 2", tag: "h2", className: "text-2xl font-bold mb-3 text-primary" },
  { name: "Título 3", tag: "h3", className: "text-xl font-bold mb-2 text-primary" },
  { name: "Subtítulo", tag: "h4", className: "text-lg font-semibold mb-2 text-gray-700" },
  { name: "Párrafo", tag: "p", className: "text-base mb-4" },
  { name: "Cita", tag: "blockquote", className: "pl-4 border-l-4 border-gray-300 italic my-4 text-gray-700" },
  { name: "Código", tag: "pre", className: "bg-gray-100 p-2 rounded font-mono text-sm my-4 overflow-x-auto" },
  { name: "Nota", tag: "div", className: "bg-yellow-50 p-3 border-l-4 border-yellow-400 my-4" },
  { name: "Advertencia", tag: "div", className: "bg-red-50 p-3 border-l-4 border-red-400 my-4" },
  { name: "Información", tag: "div", className: "bg-blue-50 p-3 border-l-4 border-blue-400 my-4" },
]

// Colores de texto y fondo
const TEXT_COLORS = [
  { name: "Negro", value: "#000000" },
  { name: "Gris oscuro", value: "#333333" },
  { name: "Gris", value: "#666666" },
  { name: "Gris claro", value: "#999999" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Rojo", value: "#E63946" },
  { name: "Azul", value: "#334E68" },
  { name: "Verde", value: "#3EBD93" },
  { name: "Amarillo", value: "#FFCA3A" },
  { name: "Naranja", value: "#F4A261" },
  { name: "Púrpura", value: "#7209B7" },
]

// Historial para deshacer/rehacer
interface HistoryState {
  content: string
  selection?: {
    start: number
    end: number
  }
}

export function SimpleRichTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: SimpleRichTextEditorProps) {
  // Estado para el contenido del editor
  const [content, setContent] = useState(initialContent || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")

  // Estado para los diálogos
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [showTableEditor, setShowTableEditor] = useState(false)
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Estado para los formularios
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageWidth, setImageWidth] = useState("auto")
  const [imageHeight, setImageHeight] = useState("auto")
  const [imageFloat, setImageFloat] = useState("none")

  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkTarget, setLinkTarget] = useState("_blank")

  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "donut">("bar")

  // Estado para plantillas
  const [selectedTableTemplate, setSelectedTableTemplate] = useState("personalizada")
  const [selectedChartTemplate, setSelectedChartTemplate] = useState("personalizado")

  // Estado para los datos de tablas y gráficos
  const [tables, setTables] = useState<TableData[]>([])
  const [charts, setCharts] = useState<ChartData[]>([])
  const [currentTableId, setCurrentTableId] = useState<string | null>(null)
  const [currentChartId, setCurrentChartId] = useState<string | null>(null)
  const [editingTable, setEditingTable] = useState<TableData | null>(null)
  const [editingChart, setEditingChart] = useState<ChartData | null>(null)

  // Estado para exportación
  const [documentTitle, setDocumentTitle] = useState("Documento sin título")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [exportOptions, setExportOptions] = useState({
    includeHeader: true,
    includeFooter: false,
    pageNumbers: true,
    landscape: false,
  })

  // Estado para formato de texto
  const [currentFont, setCurrentFont] = useState(AVAILABLE_FONTS[0].value)
  const [currentFontSize, setCurrentFontSize] = useState(FONT_SIZES[4].value) // 12pt por defecto
  const [currentTextColor, setCurrentTextColor] = useState("#000000")
  const [currentBgColor, setCurrentBgColor] = useState("transparent")
  const [currentLineHeight, setCurrentLineHeight] = useState("1.5")
  const [currentLetterSpacing, setCurrentLetterSpacing] = useState("normal")
  const [currentTextIndent, setCurrentTextIndent] = useState("0px")
  const [currentTextAlign, setCurrentTextAlign] = useState("left")

  // Estado para historial (deshacer/rehacer)
  const [history, setHistory] = useState<HistoryState[]>([{ content: initialContent || "" }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false)
  const historyLimitRef = useRef(50) // Límite de estados en el historial

  // Acceder al contexto global de elementos
  const { registerElement, getElement, getElementsByReportAndSection } = useGlobalElements()

  // Función para guardar el estado actual en el historial
  const saveToHistory = useCallback(
    (newContent: string) => {
      // Si el contenido es el mismo que el estado actual, no hacer nada
      if (history[historyIndex]?.content === newContent) {
        return
      }

      // Obtener la selección actual
      const selection = window.getSelection()
      let selectionState = undefined

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        selectionState = {
          start: getCaretPosition(range.startContainer, range.startOffset),
          end: getCaretPosition(range.endContainer, range.endOffset),
        }
      }

      // Crear una copia del historial existente
      const newHistory = [...history.slice(0, historyIndex + 1)]

      // Añadir el nuevo estado al final
      newHistory.push({ content: newContent, selection: selectionState })

      // Limitar el número de estados en el historial
      if (newHistory.length > historyLimitRef.current) {
        newHistory.shift()
      }

      // Actualizar el historial y el índice
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  // Función para obtener la posición del cursor
  const getCaretPosition = (node: Node, offset: number): number => {
    if (!editorRef.current) return 0

    const treeWalker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => NodeFilter.FILTER_ACCEPT,
    })

    let currentNode = treeWalker.currentNode
    let position = 0

    // Recorrer todos los nodos de texto hasta encontrar el nodo actual
    while (currentNode && currentNode !== node) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        position += currentNode.textContent?.length || 0
      }
      currentNode = treeWalker.nextNode()
    }

    // Añadir el offset dentro del nodo actual
    if (currentNode === node) {
      position += offset
    }

    return position
  }

  // Función para establecer la posición del cursor
  const setCaretPosition = (position: number) => {
    if (!editorRef.current) return

    const treeWalker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => NodeFilter.FILTER_ACCEPT,
    })

    let currentNode = treeWalker.currentNode
    let currentPosition = 0

    // Recorrer todos los nodos de texto hasta encontrar la posición deseada
    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        const nodeLength = currentNode.textContent?.length || 0
        if (currentPosition + nodeLength >= position) {
          // La posición está dentro de este nodo
          const range = document.createRange()
          range.setStart(currentNode, position - currentPosition)
          range.collapse(true)

          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
          return
        }
        currentPosition += nodeLength
      }
      currentNode = treeWalker.nextNode()
    }
  }

  // Función para establecer la selección
  const setSelection = (start: number, end: number) => {
    if (!editorRef.current) return

    // Establecer la posición inicial
    setCaretPosition(start)

    // Extender la selección hasta la posición final
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      // Encontrar el nodo y offset para la posición final
      const treeWalker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => NodeFilter.FILTER_ACCEPT,
      })

      let currentNode = treeWalker.currentNode
      let currentPosition = 0

      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          const nodeLength = currentNode.textContent?.length || 0
          if (currentPosition + nodeLength >= end) {
            // La posición está dentro de este nodo
            range.setEnd(currentNode, end - currentPosition)
            selection.removeAllRanges()
            selection.addRange(range)
            return
          }
          currentPosition += nodeLength
        }
        currentNode = treeWalker.nextNode()
      }
    }
  }

  // Funciones para deshacer/rehacer
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true)
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]

      if (editorRef.current && previousState) {
        editorRef.current.innerHTML = previousState.content

        // Restaurar la selección si está disponible
        if (previousState.selection) {
          setTimeout(() => {
            setSelection(previousState.selection!.start, previousState.selection!.end)
          }, 0)
        }

        setHistoryIndex(newIndex)
        onChange(previousState.content)

        setTimeout(() => {
          setIsUndoRedoAction(false)
        }, 0)
      }
    }
  }, [history, historyIndex, onChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true)
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]

      if (editorRef.current && nextState) {
        editorRef.current.innerHTML = nextState.content

        // Restaurar la selección si está disponible
        if (nextState.selection) {
          setTimeout(() => {
            setSelection(nextState.selection!.start, nextState.selection!.end)
          }, 0)
        }

        setHistoryIndex(newIndex)
        onChange(nextState.content)

        setTimeout(() => {
          setIsUndoRedoAction(false)
        }, 0)
      }
    }
  }, [history, historyIndex, onChange])

  // Inicializar el editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || ""

      if (!readOnly) {
        editorRef.current.setAttribute("contenteditable", "true")
      }

      // Inicializar el historial
      setHistory([{ content: initialContent || "" }])
      setHistoryIndex(0)
    }
  }, [initialContent, readOnly])

  // Cargar elementos existentes del almacenamiento global
  useEffect(() => {
    if (reportId && sectionId) {
      const elements = getElementsByReportAndSection(reportId, sectionId)

      // Cargar tablas
      const tablesToLoad = elements.filter((el) => el.type === "table")
      if (tablesToLoad.length > 0) {
        const loadedTables = tablesToLoad.map((el) => ({
          id: el.id,
          name: el.content.name || "Tabla",
          headers: el.content.headers || [],
          rows: el.content.rows || [],
        }))
        setTables(loadedTables)
      }

      // Cargar gráficos
      const chartsToLoad = elements.filter((el) => el.type === "chart")
      if (chartsToLoad.length > 0) {
        const loadedCharts = chartsToLoad.map((el) => ({
          id: el.id,
          name: el.content.name || "Gráfico",
          type: el.content.type || "bar",
          title: el.content.title || "Gráfico",
          labels: el.content.labels || [],
          data: el.content.data || [],
          backgroundColor: el.content.backgroundColor,
          borderColor: el.content.borderColor,
        }))
        setCharts(loadedCharts)
      }
    }
  }, [reportId, sectionId, getElementsByReportAndSection])

  // Manejar cambios en el contenido
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUndoRedoAction) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
      saveToHistory(newContent)
    }
  }, [onChange, saveToHistory, isUndoRedoAction])

  // Configurar eventos del editor
  useEffect(() => {
    const editor = editorRef.current
    if (editor && !readOnly) {
      const handleInput = () => {
        handleContentChange()
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case "z":
              if (!e.shiftKey) {
                e.preventDefault()
                handleUndo()
              }
              break
            case "y":
              e.preventDefault()
              handleRedo()
              break
            case "b":
              e.preventDefault()
              applyFormat("NEGRITA")
              break
            case "i":
              e.preventDefault()
              applyFormat("CURSIVA")
              break
            case "u":
              e.preventDefault()
              applyFormat("SUBRAYADO")
              break
          }
        }
      }

      // Detectar formato actual al hacer clic o mover el cursor
      const handleSelectionChange = () => {
        detectCurrentFormat()
      }

      editor.addEventListener("input", handleInput)
      editor.addEventListener("keydown", handleKeyDown)
      document.addEventListener("selectionchange", handleSelectionChange)

      return () => {
        editor.removeEventListener("input", handleInput)
        editor.removeEventListener("keydown", handleKeyDown)
        document.removeEventListener("selectionchange", handleSelectionChange)
      }
    }
  }, [handleContentChange, handleUndo, handleRedo, readOnly])

  // Detectar el formato actual del texto seleccionado
  const detectCurrentFormat = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Obtener el elemento que contiene la selección
    const parentElement = selection.anchorNode?.parentElement

    if (parentElement) {
      // Detectar fuente
      const fontFamily = getComputedStyle(parentElement).fontFamily
      setCurrentFont(fontFamily || AVAILABLE_FONTS[0].value)

      // Detectar tamaño de fuente
      const fontSize = getComputedStyle(parentElement).fontSize
      setCurrentFontSize(fontSize || FONT_SIZES[4].value)

      // Detectar color de texto
      const textColor = getComputedStyle(parentElement).color
      setCurrentTextColor(rgbToHex(textColor) || "#000000")

      // Detectar color de fondo
      const bgColor = getComputedStyle(parentElement).backgroundColor
      setCurrentBgColor(bgColor === "rgba(0, 0, 0, 0)" ? "transparent" : rgbToHex(bgColor) || "transparent")

      // Detectar alineación
      const textAlign = getComputedStyle(parentElement).textAlign
      setCurrentTextAlign((textAlign as any) || "left")

      // Detectar interlineado
      const lineHeight = getComputedStyle(parentElement).lineHeight
      setCurrentLineHeight(lineHeight === "normal" ? "1.5" : lineHeight)

      // Detectar espaciado entre letras
      const letterSpacing = getComputedStyle(parentElement).letterSpacing
      setCurrentLetterSpacing(letterSpacing || "normal")

      // Detectar sangría
      const textIndent = getComputedStyle(parentElement).textIndent
      setCurrentTextIndent(textIndent || "0px")
    }
  }

  // Convertir RGB a Hexadecimal
  const rgbToHex = (rgb: string): string => {
    // Verificar si ya es un color hexadecimal
    if (rgb.startsWith("#")) return rgb

    // Extraer valores RGB
    const rgbMatch = rgb.match(/^rgb$$(\d+),\s*(\d+),\s*(\d+)$$$/)
    if (!rgbMatch) return rgb

    const r = Number.parseInt(rgbMatch[1])
    const g = Number.parseInt(rgbMatch[2])
    const b = Number.parseInt(rgbMatch[3])

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // Insertar imagen
  const handleInsertImage = () => {
    if (imageUrl && editorRef.current) {
      const imageTag = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: ${imageHeight}; width: ${imageWidth}; float: ${imageFloat}; margin: 10px;" />`
      document.execCommand("insertHTML", false, imageTag)
      setImageUrl("")
      setImageAlt("")
      setImageWidth("auto")
      setImageHeight("auto")
      setImageFloat("none")
      setShowImageDialog(false)
      handleContentChange()
    }
  }

  // Insertar enlace
  const handleInsertLink = () => {
    if (linkUrl && editorRef.current) {
      const linkTag = `<a href="${linkUrl}" target="${linkTarget}" title="${linkTitle}">${linkText || linkUrl}</a>`
      document.execCommand("insertHTML", false, linkTag)
      setLinkUrl("")
      setLinkText("")
      setLinkTitle("")
      setLinkTarget("_blank")
      setShowLinkDialog(false)
      handleContentChange()
    }
  }

  // Insertar tabla
  const handleInsertTable = () => {
    if (!editorRef.current) return

    const tableId = `table-${Date.now()}`
    const tableName = `Tabla ${tables.length + 1}`

    // Obtener la plantilla seleccionada
    const template = TABLE_TEMPLATES.find((t) => t.id === selectedTableTemplate) || TABLE_TEMPLATES[0]

    // Crear tabla basada en la plantilla o en los valores personalizados
    let headers: string[]
    let rows: string[][]

    if (selectedTableTemplate === "personalizada") {
      // Usar los valores personalizados
      headers = Array(tableCols)
        .fill("")
        .map((_, i) => `Encabezado ${i + 1}`)
      rows = Array(tableRows)
        .fill("")
        .map((_, i) =>
          Array(tableCols)
            .fill("")
            .map((_, j) => `Celda ${i + 1}-${j + 1}`),
        )
    } else {
      // Usar la plantilla
      headers = [...template.headers]
      rows = template.rows.map((row) => [...row])
    }

    // Crear el objeto de tabla
    const newTable: TableData = {
      id: tableId,
      name: tableName,
      headers,
      rows,
    }

    // Actualizar el estado local
    setTables((prevTables) => [...prevTables, newTable])

    // Registrar la tabla en el almacenamiento global
    registerElement({
      id: tableId,
      type: "table",
      content: newTable,
      reportId,
      sectionId,
    })

    // Insertar marcador de tabla en el contenido
    const tableHTML = renderTableHTML(newTable)
    document.execCommand("insertHTML", false, tableHTML)

    setShowTableDialog(false)
    handleContentChange()
  }

  // Insertar gráfico
  const handleInsertChart = () => {
    if (!editorRef.current) return

    const chartId = `chart-${Date.now()}`
    const chartName = `Gráfico ${charts.length + 1}`

    // Obtener la plantilla seleccionada
    const template = CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate) || CHART_TEMPLATES[0]

    // Crear gráfico basado en la plantilla o en los valores personalizados
    let type: "bar" | "line" | "pie" | "donut"
    let title: string
    let labels: string[]
    let data: number[]

    if (selectedChartTemplate === "personalizado") {
      // Usar los valores personalizados
      type = chartType
      title = `Gráfico de ${chartType === "bar" ? "Barras" : chartType === "line" ? "Líneas" : chartType === "pie" ? "Circular" : "Dona"}`
      labels = ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"]
      data = [65, 59, 80, 81]
    } else {
      // Usar la plantilla
      type = template.type
      title = template.title
      labels = [...template.labels]
      data = [...template.data]
    }

    // Crear el objeto de gráfico
    const newChart: ChartData = {
      id: chartId,
      name: chartName,
      type,
      title,
      labels,
      data,
      backgroundColor: data.map((_, i) => defaultColors[i % defaultColors.length]),
      borderColor: data.map((_, i) => defaultColors[i % defaultColors.length]),
    }

    // Actualizar el estado local
    setCharts((prevCharts) => [...prevCharts, newChart])

    // Registrar el gráfico en el almacenamiento global
    registerElement({
      id: chartId,
      type: "chart",
      content: newChart,
      reportId,
      sectionId,
    })

    // Insertar marcador de gráfico en el contenido
    const chartHTML = renderChartHTML(newChart)
    document.execCommand("insertHTML", false, chartHTML)

    setShowChartDialog(false)
    handleContentChange()
  }

  // Aplicar formato
  const applyFormat = (format: string, value = "") => {
    if (!editorRef.current || readOnly) return

    // Guardar la selección actual
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Aplicar el formato usando comandos de documento
    switch (format) {
      case "NEGRITA":
        document.execCommand("bold", false)
        break
      case "CURSIVA":
        document.execCommand("italic", false)
        break
      case "SUBRAYADO":
        document.execCommand("underline", false)
        break
      case "TACHADO":
        document.execCommand("strikeThrough", false)
        break
      case "SUPERINDICE":
        document.execCommand("superscript", false)
        break
      case "SUBINDICE":
        document.execCommand("subscript", false)
        break
      case "IZQUIERDA":
        document.execCommand("justifyLeft", false)
        setCurrentTextAlign("left")
        break
      case "CENTRO":
        document.execCommand("justifyCenter", false)
        setCurrentTextAlign("center")
        break
      case "DERECHA":
        document.execCommand("justifyRight", false)
        setCurrentTextAlign("right")
        break
      case "JUSTIFICADO":
        document.execCommand("justifyFull", false)
        setCurrentTextAlign("justify")
        break
      case "LISTA":
        document.execCommand("insertUnorderedList", false)
        break
      case "LISTA_NUMERADA":
        document.execCommand("insertOrderedList", false)
        break
      case "LISTA_TAREAS":
        // Crear una lista de tareas personalizada
        const taskListHTML = `
          <ul class="task-list" style="list-style-type: none; padding-left: 20px;">
            <li><input type="checkbox"> Tarea 1</li>
            <li><input type="checkbox"> Tarea 2</li>
            <li><input type="checkbox"> Tarea 3</li>
          </ul>
        `
        document.execCommand("insertHTML", false, taskListHTML)
        break
      case "SANGRIA_AUMENTAR":
        document.execCommand("indent", false)
        break
      case "SANGRIA_DISMINUIR":
        document.execCommand("outdent", false)
        break
      case "FUENTE":
        setCurrentFont(value)
        document.execCommand("fontName", false, value)
        break
      case "TAMANO_FUENTE":
        setCurrentFontSize(value)
        // Aplicar tamaño de fuente como estilo
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          const span = document.createElement("span")
          span.style.fontSize = value
          range.surroundContents(span)
        } else {
          document.execCommand("fontSize", false, "3") // Valor temporal
          // Encontrar el elemento recién creado y cambiar su estilo
          const fontElements = editorRef.current.querySelectorAll("font[size='3']")
          if (fontElements.length > 0) {
            const lastFont = fontElements[fontElements.length - 1]
            lastFont.removeAttribute("size")
            lastFont.style.fontSize = value
          }
        }
        break
      case "COLOR_TEXTO":
        setCurrentTextColor(value)
        document.execCommand("foreColor", false, value)
        break
      case "COLOR_FONDO":
        setCurrentBgColor(value)
        document.execCommand("hiliteColor", false, value)
        break
      case "INTERLINEADO":
        setCurrentLineHeight(value)
        // Aplicar interlineado al párrafo actual
        const parentBlock = getParentBlock(selection.anchorNode)
        if (parentBlock) {
          parentBlock.style.lineHeight = value
        }
        break
      case "ESPACIADO_LETRAS":
        setCurrentLetterSpacing(value)
        // Aplicar espaciado entre letras al texto seleccionado
        if (!selection.isCollapsed) {
          const rangeLetterSpacing = selection.getRangeAt(0)
          const spanLetterSpacing = document.createElement("span")
          spanLetterSpacing.style.letterSpacing = value
          rangeLetterSpacing.surroundContents(spanLetterSpacing)
        } else {
          // Si no hay selección, aplicar al párrafo actual
          const parentBlockLetterSpacing = getParentBlock(selection.anchorNode)
          if (parentBlockLetterSpacing) {
            parentBlockLetterSpacing.style.letterSpacing = value
          }
        }
        break
      case "ESTILO":
        // Aplicar estilo predefinido
        const style = TEXT_STYLES.find((s) => s.name === value)
        if (style) {
          const parentElement = getParentBlock(selection.anchorNode)
          if (parentElement) {
            // Crear nuevo elemento con el estilo
            const newElement = document.createElement(style.tag)
            newElement.className = style.className
            newElement.innerHTML = parentElement.innerHTML

            // Reemplazar el elemento actual
            parentElement.parentNode?.replaceChild(newElement, parentElement)
          } else {
            // Si no hay un bloque padre, crear uno nuevo
            const styleHTML = `<${style.tag} class="${style.className}">${selection.toString() || "Texto con estilo"}</${style.tag}>`
            document.execCommand("insertHTML", false, styleHTML)
          }
        }
        break
      case "CITA":
        const quoteHTML = `<blockquote class="pl-4 border-l-4 border-gray-300 italic my-4 text-gray-700">${selection.toString() || "Texto de cita"}</blockquote>`
        document.execCommand("insertHTML", false, quoteHTML)
        break
      case "CODIGO":
        const codeHTML = `<pre class="bg-gray-100 p-2 rounded font-mono text-sm my-4 overflow-x-auto">${selection.toString() || "// Código de ejemplo"}</pre>`
        document.execCommand("insertHTML", false, codeHTML)
        break
      default:
        break
    }

    handleContentChange()
  }

  // Obtener el elemento de bloque padre (párrafo, encabezado, etc.)
  const getParentBlock = (node: Node | null): HTMLElement | null => {
    if (!node) return null

    let current: Node | null = node

    // Si el nodo es un nodo de texto, obtener su elemento padre
    if (current.nodeType === Node.TEXT_NODE) {
      current = current.parentElement
    }

    // Buscar el elemento de bloque padre
    while (current && current !== editorRef.current) {
      const element = current as HTMLElement
      const display = getComputedStyle(element).display

      if (
        display === "block" ||
        display === "flex" ||
        display === "grid" ||
        element.tagName === "P" ||
        element.tagName === "DIV" ||
        element.tagName === "H1" ||
        element.tagName === "H2" ||
        element.tagName === "H3" ||
        element.tagName === "H4" ||
        element.tagName === "H5" ||
        element.tagName === "H6" ||
        element.tagName === "BLOCKQUOTE" ||
        element.tagName === "PRE"
      ) {
        return element
      }

      current = current.parentElement
    }

    return null
  }

  // Guardar cambios en la tabla
  const handleSaveTable = () => {
    if (!editingTable) return

    // Actualizar la tabla en el estado local
    setTables((prevTables) => prevTables.map((table) => (table.id === editingTable.id ? editingTable : table)))

    // Actualizar la tabla en el almacenamiento global
    registerElement({
      id: editingTable.id,
      type: "table",
      content: editingTable,
      reportId,
      sectionId,
    })

    // Actualizar el HTML en el editor
    if (editorRef.current) {
      const tableElement = editorRef.current.querySelector(`[data-table-id="${editingTable.id}"]`)
      if (tableElement) {
        const newTableHTML = renderTableHTML(editingTable)
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = newTableHTML
        tableElement.replaceWith(tempDiv.firstChild as Node)
      }
    }

    setShowTableEditor(false)
    setEditingTable(null)
    handleContentChange()
  }

  // Guardar cambios en el gráfico
  const handleSaveChart = () => {
    if (!editingChart) return

    // Asegurarse de que los colores estén definidos
    const updatedChart = {
      ...editingChart,
      backgroundColor:
        editingChart.backgroundColor || editingChart.data.map((_, i) => defaultColors[i % defaultColors.length]),
      borderColor: editingChart.borderColor || editingChart.data.map((_, i) => defaultColors[i % defaultColors.length]),
    }

    // Actualizar el gráfico en el estado local
    setCharts((prevCharts) => prevCharts.map((chart) => (chart.id === updatedChart.id ? updatedChart : chart)))

    // Actualizar el gráfico en el almacenamiento global
    registerElement({
      id: updatedChart.id,
      type: "chart",
      content: updatedChart,
      reportId,
      sectionId,
    })

    // Actualizar el HTML en el editor
    if (editorRef.current) {
      const chartElement = editorRef.current.querySelector(`[data-chart-id="${updatedChart.id}"]`)
      if (chartElement) {
        const newChartHTML = renderChartHTML(updatedChart)
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = newChartHTML
        chartElement.replaceWith(tempDiv.firstChild as Node)
      }
    }

    setShowChartEditor(false)
    setEditingChart(null)
    handleContentChange()
  }

  // Buscar tabla o gráfico por ID en el contenido y abrir el editor
  const handleEditElement = (type: "table" | "chart", id: string) => {
    if (type === "table") {
      const table = tables.find((t) => t.id === id)
      if (table) {
        setCurrentTableId(id)
        setEditingTable(table)
        setShowTableEditor(true)
      }
    } else {
      const chart = charts.find((c) => c.id === id)
      if (chart) {
        setCurrentChartId(id)
        setEditingChart(chart)
        setShowChartEditor(true)
      }
    }
  }

  // Generar HTML para una tabla
  const renderTableHTML = (table: TableData) => {
    if (!table || !table.headers || !table.rows) {
      return `<div class="my-4 border rounded-md p-4 bg-red-50 text-red-500">Error: Datos de tabla inválidos</div>`
    }

    return `
      <div class="my-4 border rounded-md overflow-hidden" data-element-type="table" data-table-id="${table.id}">
        <div class="bg-gray-100 p-2 flex justify-between items-center">
          <span class="font-medium">${table.name || "Tabla"}</span>
          <button type="button" class="text-blue-600 hover:text-blue-800 text-sm edit-table-btn" data-table-id="${table.id}">
            Editar
          </button>
        </div>
        <div class="p-2">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                ${table.headers.map((header) => `<th class="border p-2 text-left">${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${table.rows
                .map(
                  (row) => `
                <tr>
                  ${row.map((cell) => `<td class="border p-2">${cell}</td>`).join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  // Generar HTML para un gráfico
  const renderChartHTML = (chart: ChartData) => {
    if (!chart || !chart.labels || !chart.data) {
      return `<div class="my-4 border rounded-md p-4 bg-red-50 text-red-500">Error: Datos de gráfico inválidos</div>`
    }

    // Colores predeterminados si no se especifican
    const backgroundColors = chart.backgroundColor || chart.data.map((_, i) => defaultColors[i % defaultColors.length])

    const borderColors = chart.borderColor || chart.data.map((_, i) => defaultColors[i % defaultColors.length])

    // Calcular valores para los ejes
    const maxValue = Math.max(...chart.data) * 1.1
    const minValue = Math.min(0, ...chart.data)
    const valueRange = maxValue - minValue

    // Generar marcas para el eje Y (5 marcas)
    const yAxisTicks = Array.from({ length: 6 }, (_, i) => {
      return Math.round((minValue + (valueRange * i) / 5) * 100) / 100
    })

    return `
      <div class="my-4 border rounded-md overflow-hidden" data-element-type="chart" data-chart-id="${chart.id}">
        <div class="bg-gray-100 p-2 flex justify-between items-center">
          <span class="font-medium">${chart.name || chart.title}</span>
          <button type="button" class="text-blue-600 hover:text-blue-800 text-sm edit-chart-btn" data-chart-id="${chart.id}">
            Editar
          </button>
        </div>
        <div class="p-4 bg-gray-50">
          <div class="text-center">
            <h3 class="font-medium mb-2">${chart.title}</h3>
            
            ${
              chart.type === "bar"
                ? `
            <div class="relative h-64 w-full">
              <!-- Eje Y -->
              <div class="absolute top-0 bottom-0 left-10 w-px bg-gray-300"></div>
              ${yAxisTicks
                .map(
                  (tick, i) => `
                <div class="absolute left-0 text-xs text-gray-600" style="bottom: ${(i * 100) / 5}%">
                  ${tick}
                </div>
                <div class="absolute left-10 right-10 border-t border-gray-200 border-dashed" style="bottom: ${
                  (i * 100) / 5
                }%"></div>
              `,
                )
                .join("")}
              
              <!-- Eje X -->
              <div class="absolute left-10 right-0 bottom-6 h-px bg-gray-300"></div>
              
              <!-- Barras -->
              <div class="absolute left-12 right-2 bottom-6 top-2 flex items-end justify-around">
                ${chart.data
                  .map((value, index) => {
                    const height = Math.max(1, ((value - minValue) / valueRange) * 100)
                    return `
                  <div class="flex flex-col items-center">
                    <div class="w-12 rounded-t relative" 
                         style="height: ${height}%; background-color: ${backgroundColors[index % backgroundColors.length]}; border: 1px solid ${
                           borderColors[index % borderColors.length]
                         }">
                      <span class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-white px-1 py-0.5 rounded shadow-sm">
                        ${value}
                      </span>
                    </div>
                    <div class="text-xs mt-2 text-center">${chart.labels[index] || ""}</div>
                  </div>
                `
                  })
                  .join("")}
              </div>
            </div>
            `
                : ""
            }
            
            ${
              chart.type === "line"
                ? `
            <div class="relative h-64 w-full">
              <!-- Eje Y -->
              <div class="absolute top-0 bottom-0 left-10 w-px bg-gray-300"></div>
              ${yAxisTicks
                .map(
                  (tick, i) => `
                <div class="absolute left-0 text-xs text-gray-600" style="bottom: ${(i * 100) / 5}%">
                  ${tick}
                </div>
                <div class="absolute left-10 right-10 border-t border-gray-200 border-dashed" style="bottom: ${
                  (i * 100) / 5
                }%"></div>
              `,
                )
                .join("")}
              
              <!-- Eje X -->
              <div class="absolute left-10 right-0 bottom-6 h-px bg-gray-300"></div>
              
              <!-- Línea y puntos -->
              <div class="absolute left-12 right-2 bottom-6 top-2">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full">
                  <polyline 
                    points="${chart.data
                      .map((value, index) => {
                        const x = (index / (chart.data.length - 1)) * 100
                        const y = 100 - ((value - minValue) / valueRange) * 100
                        return `${x},${y}`
                      })
                      .join(" ")}" 
                    fill="none" 
                    stroke="${borderColors[0]}" 
                    strokeWidth="2" 
                  />
                  ${chart.data
                    .map((value, index) => {
                      const x = (index / (chart.data.length - 1)) * 100
                      const y = 100 - ((value - minValue) / valueRange) * 100
                      return `
                    <circle 
                      cx="${x}" 
                      cy="${y}" 
                      r="2" 
                      fill="${backgroundColors[index % backgroundColors.length]}" 
                      stroke="${borderColors[index % borderColors.length]}"
                      strokeWidth="1"
                    />
                    <text 
                      x="${x}" 
                      y="${y - 5}" 
                      textAnchor="middle" 
                      fontSize="8" 
                      fill="#333"
                    >${value}</text>
                  `
                    })
                    .join("")}
                </svg>
                
                <!-- Etiquetas del eje X -->
                <div class="absolute left-0 right-0 bottom-0 flex justify-between">
                  ${chart.labels
                    .map(
                      (label) => `
                    <div class="text-xs text-center">${label}</div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
            `
                : ""
            }
            
            ${
              chart.type === "pie" || chart.type === "donut"
                ? `
            <div class="relative h-64 flex items-center justify-center">
              <svg viewBox="0 0 100 100" class="w-64 h-64">
                ${(() => {
                  let startAngle = 0
                  const total = chart.data.reduce((sum, val) => sum + val, 0)

                  return chart.data
                    .map((value, index) => {
                      const percentage = value / total
                      const endAngle = startAngle + percentage * 2 * Math.PI

                      // Calcular coordenadas para el arco
                      const x1 = 50 + 45 * Math.cos(startAngle)
                      const y1 = 50 + 45 * Math.sin(startAngle)
                      const x2 = 50 + 45 * Math.cos(endAngle)
                      const y2 = 50 + 45 * Math.sin(endAngle)

                      // Determinar si el arco es mayor que 180 grados
                      const largeArcFlag = percentage > 0.5 ? 1 : 0

                      // Crear el path para el sector
                      const path = `
                        M 50 50
                        L ${x1} ${y1}
                        A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}
                        Z
                      `

                      // Calcular posición para la etiqueta
                      const labelAngle = startAngle + percentage * Math.PI
                      const labelRadius = chart.type === "donut" ? 30 : 25
                      const labelX = 50 + labelRadius * Math.cos(labelAngle)
                      const labelY = 50 + labelRadius * Math.sin(labelAngle)

                      const result = `
                        <path d="${path}" fill="${backgroundColors[index % backgroundColors.length]}" stroke="white" strokeWidth="1" />
                        <text x="${labelX}" y="${labelY}" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
                          ${Math.round(percentage * 100)}%
                        </text>
                      `

                      startAngle = endAngle
                      return result
                    })
                    .join("")
                })()}
                ${chart.type === "donut" ? '<circle cx="50" cy="50" r="25" fill="white" />' : ""}
              </svg>
              
              <!-- Leyenda -->
              <div class="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 text-xs">
                ${chart.data
                  .map(
                    (value, index) => `
                  <div class="flex items-center">
                    <div class="w-3 h-3 mr-1" style="background-color: ${backgroundColors[index % backgroundColors.length]}"></div>
                    <span>${chart.labels[index]}: ${value}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `
  }

  // Función para encontrar y editar elementos en el texto
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return

    const target = e.target as HTMLElement

    // Manejar clics en botones de edición de tabla
    const tableEditBtn = target.closest(".edit-table-btn")
    if (tableEditBtn) {
      const tableId = tableEditBtn.getAttribute("data-table-id")
      if (tableId) {
        handleEditElement("table", tableId)
        e.preventDefault()
        return
      }
    }

    // Manejar clics en botones de edición de gráfico
    const chartEditBtn = target.closest(".edit-chart-btn")
    if (chartEditBtn) {
      const chartId = chartEditBtn.getAttribute("data-chart-id")
      if (chartId) {
        handleEditElement("chart", chartId)
        e.preventDefault()
        return
      }
    }
  }

  // Alternar entre modo edición y vista previa
  const toggleViewMode = () => {
    setViewMode(viewMode === "edit" ? "preview" : "edit")
  }

  // Exportar documento
  const handleDocumentExport = () => {
    // Preparar el contenido para exportación
    let exportContent = ""

    if (editorRef.current) {
      exportContent = editorRef.current.innerHTML
    }

    // Crear un documento HTML completo
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 10px;
            font-size: 0.8em;
            color: #666;
          }
          .chart-container {
            margin: 20px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .chart-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
          }
          .chart-bar {
            background-color: #3EBD93;
            margin: 0 2px;
            border-radius: 2px 2px 0 0;
          }
          .chart-label {
            font-size: 12px;
            text-align: center;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              margin: 2cm;
              ${exportOptions.landscape ? "size: landscape;" : ""}
            }
          }
        </style>
      </head>
      <body>
        ${
          exportOptions.includeHeader
            ? `<div class="header">
                <h1>${documentTitle}</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
              </div>`
            : ""
        }
        
        ${exportContent}
        
        ${
          exportOptions.includeFooter
            ? `<div class="footer">
                <p>© ${new Date().getFullYear()} - ${documentTitle}</p>
                ${
                  exportOptions.pageNumbers
                    ? `<script>
                        (function() {
                          var pages = document.querySelectorAll('.page');
                          pages.forEach(function(page, index) {
                            var footer = page.querySelector('.footer');
                            if (footer) {
                              footer.innerHTML += '<p>Página ' + (index + 1) + ' de ' + pages.length + '</p>';
                            }
                          });
                        })();
                      </script>`
                    : ""
                }
              </div>`
            : ""
        }
      </body>
      </html>
    `

    // Crear un blob con el contenido HTML
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    if (exportFormat === "html") {
      // Descargar como HTML
      const a = document.createElement("a")
      a.href = url
      a.download = `${documentTitle}.html`
      a.click()
      URL.revokeObjectURL(url)
    } else if (exportFormat === "print") {
      // Abrir ventana de impresión
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } else {
      // Para PDF, abrimos una ventana de impresión que el usuario puede guardar como PDF
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }

    setShowExportDialog(false)
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden w-full">
      {/* Barra de herramientas principal */}
      <div className="bg-gray-100 border-b p-2 flex flex-wrap gap-1 items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center">
          {!readOnly && viewMode === "edit" && (
            <>
              {/* Deshacer/Rehacer */}
              <div className="flex gap-1 mr-2 border-r pr-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleUndo}>
                        <Undo className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRedo}>
                        <Redo className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Selector de fuente */}
              <Select value={currentFont} onValueChange={(value) => applyFormat("FUENTE", value)}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Fuente" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value} className="text-xs">
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selector de tamaño de fuente */}
              <Select value={currentFontSize} onValueChange={(value) => applyFormat("TAMANO_FUENTE", value)}>
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value} className="text-xs">
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Estilos de texto */}
              <Select onValueChange={(value) => applyFormat("ESTILO", value)}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Estilo" />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_STYLES.map((style) => (
                    <SelectItem key={style.name} value={style.name} className="text-xs">
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Formatos de texto */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("NEGRITA")}>
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Negrita (Ctrl+B)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("CURSIVA")}>
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cursiva (Ctrl+I)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("SUBRAYADO")}>
                      <Underline className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Subrayado (Ctrl+U)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("TACHADO")}>
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tachado</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("SUPERINDICE")}
                    >
                      <Superscript className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Superíndice</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("SUBINDICE")}>
                      <Subscript className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Subíndice</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Colores */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                    <Palette className="h-4 w-4" />
                    <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full border"
                      style={{ backgroundColor: currentTextColor }}
                    ></div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="mb-2">
                    <Label className="text-xs">Color de texto</Label>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      {TEXT_COLORS.map((color) => (
                        <Button
                          key={color.value}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          style={{ backgroundColor: color.value }}
                          onClick={() => applyFormat("COLOR_TEXTO", color.value)}
                        >
                          <span className="sr-only">{color.name}</span>
                        </Button>
                      ))}
                      <Input
                        type="color"
                        value={currentTextColor}
                        onChange={(e) => applyFormat("COLOR_TEXTO", e.target.value)}
                        className="w-6 h-6 p-0 border-0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Color de fondo</Label>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      {TEXT_COLORS.map((color) => (
                        <Button
                          key={color.value}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          style={{ backgroundColor: color.value }}
                          onClick={() => applyFormat("COLOR_FONDO", color.value)}
                        >
                          <span className="sr-only">{color.name}</span>
                        </Button>
                      ))}
                      <Input
                        type="color"
                        value={currentBgColor === "transparent" ? "#ffffff" : currentBgColor}
                        onChange={(e) => applyFormat("COLOR_FONDO", e.target.value)}
                        className="w-6 h-6 p-0 border-0"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("COLOR_TEXTO", "#000000")}
                    >
                      <Highlighter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resaltador</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Alineación */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentTextAlign === "left" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("IZQUIERDA")}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alinear a la izquierda</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentTextAlign === "center" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("CENTRO")}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Centrar</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentTextAlign === "right" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("DERECHA")}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alinear a la derecha</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentTextAlign === "justify" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("JUSTIFICADO")}
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Justificar</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Párrafos y listas */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1">
                    <Pilcrow className="h-4 w-4" />
                    <span className="text-xs">Párrafo</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="mb-2">
                    <Label className="text-xs">Interlineado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[Number.parseFloat(currentLineHeight)]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => applyFormat("INTERLINEADO", value[0].toString())}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-center">{currentLineHeight}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <Label className="text-xs">Espaciado entre letras</Label>
                    <Select
                      value={currentLetterSpacing}
                      onValueChange={(value) => applyFormat("ESPACIADO_LETRAS", value)}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="Espaciado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal" className="text-xs">
                          Normal
                        </SelectItem>
                        <SelectItem value="0.05em" className="text-xs">
                          Estrecho
                        </SelectItem>
                        <SelectItem value="0.1em" className="text-xs">
                          Medio
                        </SelectItem>
                        <SelectItem value="0.15em" className="text-xs">
                          Amplio
                        </SelectItem>
                        <SelectItem value="0.2em" className="text-xs">
                          Muy amplio
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => applyFormat("SANGRIA_AUMENTAR")}
                    >
                      <Indent className="h-4 w-4 mr-1" />
                      Aumentar sangría
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => applyFormat("SANGRIA_DISMINUIR")}
                    >
                      <Outdent className="h-4 w-4 mr-1" />
                      Disminuir sangría
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Listas */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("LISTA")}>
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lista con viñetas</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("LISTA_NUMERADA")}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lista numerada</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyFormat("LISTA_TAREAS")}
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lista de tareas</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Estilos especiales */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("CITA")}>
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cita</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat("CODIGO")}>
                      <Code className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Código</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Insertar elementos */}
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Insertar imagen</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="image-url">URL de la imagen</Label>
                      <Input
                        id="image-url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image-alt">Texto alternativo</Label>
                      <Input
                        id="image-alt"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Descripción de la imagen"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="image-width">Ancho</Label>
                        <Input
                          id="image-width"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(e.target.value)}
                          placeholder="auto, 100%, 300px"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image-height">Alto</Label>
                        <Input
                          id="image-height"
                          value={imageHeight}
                          onChange={(e) => setImageHeight(e.target.value)}
                          placeholder="auto, 200px"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image-float">Alineación</Label>
                      <Select value={imageFloat} onValueChange={setImageFloat}>
                        <SelectTrigger id="image-float">
                          <SelectValue placeholder="Seleccionar alineación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Normal</SelectItem>
                          <SelectItem value="left">Izquierda</SelectItem>
                          <SelectItem value="right">Derecha</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInsertImage}>Insertar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Link className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Insertar enlace</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="link-text">Texto del enlace</Label>
                      <Input
                        id="link-text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Texto a mostrar"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-url">URL del enlace</Label>
                      <Input
                        id="link-url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-title">Título (tooltip)</Label>
                      <Input
                        id="link-title"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="Descripción al pasar el ratón"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-target">Abrir en</Label>
                      <Select value={linkTarget} onValueChange={setLinkTarget}>
                        <SelectTrigger id="link-target">
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_blank">Nueva ventana</SelectItem>
                          <SelectItem value="_self">Misma ventana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInsertLink}>Insertar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Table className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Insertar tabla</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label className="mb-2 block">Seleccione una plantilla</Label>
                      <RadioGroup
                        value={selectedTableTemplate}
                        onValueChange={setSelectedTableTemplate}
                        className="grid grid-cols-2 gap-2"
                      >
                        {TABLE_TEMPLATES.map((template) => (
                          <div key={template.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={template.id} id={`template-${template.id}`} />
                            <Label htmlFor={`template-${template.id}`} className="font-normal">
                              {template.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {selectedTableTemplate === "personalizada" && (
                      <>
                        <div>
                          <Label htmlFor="table-rows">Filas</Label>
                          <Input
                            id="table-rows"
                            type="number"
                            min="1"
                            max="10"
                            value={tableRows}
                            onChange={(e) => setTableRows(Number.parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="table-cols">Columnas</Label>
                          <Input
                            id="table-cols"
                            type="number"
                            min="1"
                            max="10"
                            value={tableCols}
                            onChange={(e) => setTableCols(Number.parseInt(e.target.value))}
                          />
                        </div>
                      </>
                    )}

                    {/* Vista previa de la plantilla */}
                    <div className="border rounded-md p-2 bg-gray-50">
                      <h3 className="text-sm font-medium mb-2">Vista previa:</h3>
                      <div className="overflow-x-auto max-h-40">
                        {selectedTableTemplate !== "personalizada" && (
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr className="bg-gray-100">
                                {TABLE_TEMPLATES.find((t) => t.id === selectedTableTemplate)?.headers.map(
                                  (header, i) => (
                                    <th key={i} className="border p-1 text-left">
                                      {header}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {TABLE_TEMPLATES.find((t) => t.id === selectedTableTemplate)?.rows.map((row, i) => (
                                <tr key={i}>
                                  {row.map((cell, j) => (
                                    <td key={j} className="border p-1">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {selectedTableTemplate === "personalizada" && (
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr className="bg-gray-100">
                                {Array(tableCols)
                                  .fill(0)
                                  .map((_, i) => (
                                    <th key={i} className="border p-1 text-left">
                                      Encabezado {i + 1}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array(tableRows)
                                .fill(0)
                                .map((_, i) => (
                                  <tr key={i}>
                                    {Array(tableCols)
                                      .fill(0)
                                      .map((_, j) => (
                                        <td key={j} className="border p-1">
                                          Celda {i + 1}-{j + 1}
                                        </td>
                                      ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTableDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInsertTable}>Insertar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Insertar gráfico</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label className="mb-2 block">Seleccione una plantilla</Label>
                      <RadioGroup
                        value={selectedChartTemplate}
                        onValueChange={setSelectedChartTemplate}
                        className="grid grid-cols-2 gap-2"
                      >
                        {CHART_TEMPLATES.map((template) => (
                          <div key={template.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={template.id} id={`chart-template-${template.id}`} />
                            <Label htmlFor={`chart-template-${template.id}`} className="font-normal">
                              {template.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {selectedChartTemplate === "personalizado" && (
                      <div>
                        <Label>Tipo de gráfico</Label>
                        <Tabs
                          defaultValue="bar"
                          value={chartType}
                          onValueChange={(value) => setChartType(value as any)}
                          className="mt-2"
                        >
                          <TabsList className="grid grid-cols-4">
                            <TabsTrigger value="bar">Barras</TabsTrigger>
                            <TabsTrigger value="line">Líneas</TabsTrigger>
                            <TabsTrigger value="pie">Circular</TabsTrigger>
                            <TabsTrigger value="donut">Dona</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    )}

                    {/* Vista previa de la plantilla */}
                    <div className="border rounded-md p-2 bg-gray-50">
                      <h3 className="text-sm font-medium mb-2">Vista previa:</h3>
                      <div className="h-40 flex items-center justify-center">
                        {selectedChartTemplate !== "personalizado" && (
                          <div className="text-center">
                            <h4 className="text-xs font-medium mb-1">
                              {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.title}
                            </h4>
                            <div className="h-32 flex items-center justify-center">
                              {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.type === "bar" && (
                                <div className="flex items-end h-24 gap-1">
                                  {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.data.map((value, i) => {
                                    const max = Math.max(
                                      ...(CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.data || [1]),
                                    )
                                    const height = (value / max) * 80
                                    return (
                                      <div key={i} className="flex flex-col items-center">
                                        <div
                                          className="w-5 bg-blue-500 rounded-t"
                                          style={{ height: `${height}px` }}
                                        ></div>
                                        <div className="text-[10px] mt-1">
                                          {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.labels[i]}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.type === "pie" && (
                                <div className="w-24 h-24">
                                  <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="#3EBD93" />
                                  </svg>
                                </div>
                              )}

                              {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.type === "donut" && (
                                <div className="w-24 h-24">
                                  <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="#3EBD93" />
                                    <circle cx="50" cy="50" r="20" fill="white" />
                                  </svg>
                                </div>
                              )}

                              {CHART_TEMPLATES.find((t) => t.id === selectedChartTemplate)?.type === "line" && (
                                <div className="w-32 h-24">
                                  <svg viewBox="0 0 100 60">
                                    <polyline
                                      points="10,40 30,20 50,30 70,10 90,25"
                                      stroke="#3EBD93"
                                      strokeWidth="3"
                                      fill="none"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedChartTemplate === "personalizado" && (
                          <div className="text-center">
                            <h4 className="text-xs font-medium mb-1">Gráfico Personalizado</h4>
                            <div className="h-32 flex items-center justify-center">
                              {chartType === "bar" && (
                                <div className="flex items-end h-24 gap-1">
                                  {[65, 59, 80, 81].map((value, i) => {
                                    const height = (value / 100) * 80
                                    return (
                                      <div key={i} className="flex flex-col items-center">
                                        <div
                                          className="w-5 bg-blue-500 rounded-t"
                                          style={{ height: `${height}px` }}
                                        ></div>
                                        <div className="text-[10px] mt-1">Cat {i + 1}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {chartType === "pie" && (
                                <div className="w-24 h-24">
                                  <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="#3EBD93" />
                                  </svg>
                                </div>
                              )}

                              {chartType === "donut" && (
                                <div className="w-24 h-24">
                                  <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="#3EBD93" />
                                    <circle cx="50" cy="50" r="20" fill="white" />
                                  </svg>
                                </div>
                              )}

                              {chartType === "line" && (
                                <div className="w-32 h-24">
                                  <svg viewBox="0 0 100 60">
                                    <polyline
                                      points="10,40 30,20 50,30 70,10 90,25"
                                      stroke="#3EBD93"
                                      strokeWidth="3"
                                      fill="none"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowChartDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInsertChart}>Insertar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Controles de vista previa y exportación */}
        <div className="flex items-center gap-2">
          {/* Botón de vista previa */}
          <Button variant="outline" size="sm" onClick={toggleViewMode} className="flex items-center gap-1">
            {viewMode === "edit" ? (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Vista previa</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </>
            )}
          </Button>

          {/* Diálogo de exportación */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Exportar documento</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="document-title">Título del documento</Label>
                  <Input
                    id="document-title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Documento sin título"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Formato de exportación</Label>
                  <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="grid grid-cols-3 gap-2">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="pdf" id="format-pdf" />
                      <Label htmlFor="format-pdf" className="font-normal">
                        PDF
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="html" id="format-html" />
                      <Label htmlFor="format-html" className="font-normal">
                        HTML
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="print" id="format-print" />
                      <Label htmlFor="format-print" className="font-normal">
                        Imprimir
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Opciones</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-header"
                        checked={exportOptions.includeHeader}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeHeader: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-header" className="font-normal">
                        Incluir encabezado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-footer"
                        checked={exportOptions.includeFooter}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeFooter: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-footer" className="font-normal">
                        Incluir pie de página
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="page-numbers"
                        checked={exportOptions.pageNumbers}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, pageNumbers: checked as boolean })
                        }
                      />
                      <Label htmlFor="page-numbers" className="font-normal">
                        Mostrar números de página
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="landscape"
                        checked={exportOptions.landscape}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, landscape: checked as boolean })
                        }
                      />
                      <Label htmlFor="landscape" className="font-normal">
                        Orientación horizontal
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDocumentExport}>Exportar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contenido del editor */}
      <div className="relative">
        <div
          ref={editorRef}
          className={`p-3 min-h-[${minHeight}] focus:outline-none ${readOnly ? "cursor-default" : "cursor-text"}`}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: currentFont,
            fontSize: currentFontSize,
            color: currentTextColor,
            backgroundColor: currentBgColor === "transparent" ? "transparent" : currentBgColor,
            textAlign: currentTextAlign,
            lineHeight: currentLineHeight,
            letterSpacing: currentLetterSpacing,
            textIndent: currentTextIndent,
          }}
          onClick={handleEditorClick}
          placeholder={placeholder}
        />
      </div>

      {/* Editor de tabla */}
      <Dialog open={showTableEditor} onOpenChange={setShowTableEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar tabla</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table-name">Nombre de la tabla</Label>
                  <Input
                    id="table-name"
                    value={editingTable.name}
                    onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="table-id">ID de la tabla</Label>
                  <Input id="table-id" value={editingTable.id} disabled />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {editingTable.headers.map((header, index) => (
                        <th key={index} className="border p-2">
                          <Input
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...editingTable.headers]
                              newHeaders[index] = e.target.value
                              setEditingTable({ ...editingTable, headers: newHeaders })
                            }}
                            className="border-none bg-transparent p-0"
                          />
                        </th>
                      ))}
                      <th className="border p-2 w-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const newHeaders = [...editingTable.headers, ""]
                            const newRows = editingTable.rows.map((row) => [...row, ""])
                            setEditingTable({
                              ...editingTable,
                              headers: newHeaders,
                              rows: newRows,
                            })
                          }}
                        >
                          +
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingTable.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border p-2">
                            <Input
                              value={cell}
                              onChange={(e) => {
                                const newRows = [...editingTable.rows]
                                newRows[rowIndex][cellIndex] = e.target.value
                                setEditingTable({ ...editingTable, rows: newRows })
                              }}
                              className="border-none bg-transparent p-0"
                            />
                          </td>
                        ))}
                        <td className="border p-2 w-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => {
                              const newRows = [...editingTable.rows]
                              newRows.splice(rowIndex, 1)
                              setEditingTable({ ...editingTable, rows: newRows })
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  const newRows = [...editingTable.rows, Array(editingTable.headers.length).fill("")]
                  setEditingTable({ ...editingTable, rows: newRows })
                }}
              >
                Añadir fila
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableEditor(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTable}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor de gráfico */}
      <Dialog open={showChartEditor} onOpenChange={setShowChartEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar gráfico</DialogTitle>
          </DialogHeader>
          {editingChart && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chart-name">Nombre del gráfico</Label>
                  <Input
                    id="chart-name"
                    value={editingChart.name}
                    onChange={(e) => setEditingChart({ ...editingChart, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="chart-id">ID del gráfico</Label>
                  <Input id="chart-id" value={editingChart.id} disabled />
                </div>
              </div>
              <div>
                <Label htmlFor="chart-title">Título</Label>
                <Input
                  id="chart-title"
                  value={editingChart.title}
                  onChange={(e) => setEditingChart({ ...editingChart, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo de gráfico</Label>
                <Tabs
                  value={editingChart.type}
                  onValueChange={(value) => setEditingChart({ ...editingChart, type: value as any })}
                  className="mt-2"
                >
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="bar">Barras</TabsTrigger>
                    <TabsTrigger value="line">Líneas</TabsTrigger>
                    <TabsTrigger value="pie">Circular</TabsTrigger>
                    <TabsTrigger value="donut">Dona</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <Label>Datos</Label>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Etiqueta</th>
                        <th className="border p-2">Valor</th>
                        <th className="border p-2 w-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditingChart({
                                ...editingChart,
                                labels: [...editingChart.labels, ""],
                                data: [...editingChart.data, 0],
                              })
                            }}
                          >
                            +
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingChart.labels.map((label, index) => (
                        <tr key={index}>
                          <td className="border p-2">
                            <Input
                              value={label}
                              onChange={(e) => {
                                const newLabels = [...editingChart.labels]
                                newLabels[index] = e.target.value
                                setEditingChart({ ...editingChart, labels: newLabels })
                              }}
                              className="border-none bg-transparent p-0"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              type="number"
                              value={editingChart.data[index]}
                              onChange={(e) => {
                                const newData = [...editingChart.data]
                                newData[index] = Number(e.target.value)
                                setEditingChart({ ...editingChart, data: newData })
                              }}
                              className="border-none bg-transparent p-0"
                            />
                          </td>
                          <td className="border p-2 w-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => {
                                const newLabels = [...editingChart.labels]
                                const newData = [...editingChart.data]
                                newLabels.splice(index, 1)
                                newData.splice(index, 1)
                                setEditingChart({
                                  ...editingChart,
                                  labels: newLabels,
                                  data: newData,
                                })
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <Label>Colores</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {editingChart.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            editingChart.backgroundColor?.[index] || defaultColors[index % defaultColors.length],
                        }}
                      ></div>
                      <span className="text-sm">{label}</span>
                      <Input
                        type="color"
                        value={editingChart.backgroundColor?.[index] || defaultColors[index % defaultColors.length]}
                        onChange={(e) => {
                          const newBackgroundColors = [
                            ...(editingChart.backgroundColor ||
                              editingChart.data.map((_, i) => defaultColors[i % defaultColors.length])),
                          ]
                          newBackgroundColors[index] = e.target.value
                          setEditingChart({
                            ...editingChart,
                            backgroundColor: newBackgroundColors,
                          })
                        }}
                        className="w-16 h-8 p-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="show-axes"
                  checked={editingChart.showAxes !== false}
                  onCheckedChange={(checked) => setEditingChart({ ...editingChart, showAxes: checked as boolean })}
                />
                <Label htmlFor="show-axes" className="font-normal">
                  Mostrar ejes con valores
                </Label>
              </div>
              {/* Vista previa del gráfico */}
              <Card>
                <CardHeader>
                  <CardTitle>Vista previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-md p-4">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h3 className="font-medium mb-2">{editingChart.title}</h3>
                        {editingChart.type === "bar" && (
                          <div className="flex items-end justify-center h-32 gap-2">
                            {editingChart.data.map((value, index) => {
                              const height = Math.max(10, (value / Math.max(...editingChart.data)) * 100)
                              return (
                                <div key={index} className="flex flex-col items-center">
                                  <div
                                    className="w-8 rounded-t"
                                    style={{
                                      height: `${height}px`,
                                      backgroundColor:
                                        editingChart.backgroundColor?.[index] ||
                                        defaultColors[index % defaultColors.length],
                                    }}
                                  ></div>
                                  <div className="text-xs mt-1">{editingChart.labels[index]}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChartEditor(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveChart}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estilos adicionales para el editor */}
      <style jsx global>{`
        [contenteditable=true]:empty:before {
          content: attr(placeholder);
          color: #aaa;
          font-style: italic;
        }
        
        [contenteditable=true]:focus {
          outline: none;
        }
        
        .task-list input[type="checkbox"] {
          margin-right: 8px;
        }
        
        .chart-marker, .table-marker {
          margin: 10px 0;
          padding: 10px;
          border: 1px dashed #ccc;
          border-radius: 4px;
          background-color: #f9f9f9;
          cursor: default;
        }
        
        .chart-placeholder, .table-placeholder {
          text-align: center;
          color: #666;
          font-style: italic;
        }
        
        /* Estilos para el cursor */
        [contenteditable=true] {
          caret-color: #3EBD93;
          cursor: text;
        }
        
        /* Estilos para la selección de texto */
        [contenteditable=true]::selection {
          background-color: rgba(62, 189, 147, 0.3);
        }
      `}</style>
    </div>
  )
}
