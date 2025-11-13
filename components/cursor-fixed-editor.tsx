"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { SimpleRichTextEditor } from "./simple-rich-text-editor"
import { Button } from "@/components/ui/button"

interface CursorFixedEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function CursorFixedEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: CursorFixedEditorProps) {
  const [content, setContent] = useState(initialContent || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)
  const selectionStateRef = useRef<{ start: number; end: number } | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Función para normalizar el texto (eliminar caracteres de control y forzar LTR)
  const normalizeText = useCallback((text: string): string => {
    // Eliminar caracteres de control bidireccionales
    return text.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
  }, [])

  // Función para guardar el estado de selección actual
  const saveSelectionState = useCallback(() => {
    if (!window.getSelection) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    selectionStateRef.current = {
      start: range.startOffset,
      end: range.endOffset,
    }

    if (debugMode) {
      console.log("Guardando selección:", selectionStateRef.current)
    }
  }, [debugMode])

  // Función para restaurar el estado de selección
  const restoreSelectionState = useCallback(() => {
    if (!selectionStateRef.current || !window.getSelection) return

    const editableElements = editorRef.current?.querySelectorAll('[contenteditable="true"]')
    if (!editableElements || editableElements.length === 0) return

    const editable = editableElements[0] as HTMLElement

    // Crear un nuevo rango
    const selection = window.getSelection()
    if (!selection) return

    // Intentar restaurar la selección
    try {
      // Primero, intentar encontrar el nodo de texto correcto
      const textNode = null
      let offset = 0

      // Función recursiva para encontrar el nodo de texto correcto
      const findTextNode = (node: Node, targetOffset: number): { node: Node | null; offset: number } => {
        if (node.nodeType === Node.TEXT_NODE) {
          const length = node.textContent?.length || 0
          if (offset + length >= targetOffset) {
            return { node, offset: targetOffset - offset }
          }
          offset += length
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            const result = findTextNode(node.childNodes[i], targetOffset)
            if (result.node) return result
          }
        }
        return { node: null, offset: 0 }
      }

      // Buscar el nodo para la posición de inicio
      const startResult = findTextNode(editable, selectionStateRef.current.start)

      if (startResult.node) {
        const range = document.createRange()
        range.setStart(startResult.node, startResult.offset)

        // Si es una selección (no solo cursor), establecer el final también
        if (selectionStateRef.current.end !== selectionStateRef.current.start) {
          const endResult = findTextNode(editable, selectionStateRef.current.end)
          if (endResult.node) {
            range.setEnd(endResult.node, endResult.offset)
          }
        } else {
          range.collapse(true) // Colapsar a un cursor
        }

        selection.removeAllRanges()
        selection.addRange(range)

        if (debugMode) {
          console.log("Selección restaurada:", {
            start: selectionStateRef.current.start,
            end: selectionStateRef.current.end,
          })
        }
      }
    } catch (error) {
      console.error("Error al restaurar la selección:", error)
    }
  }, [debugMode])

  // Manejar cambios en el contenido
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (isProcessingRef.current) return

      // Guardar el estado de selección antes de procesar
      saveSelectionState()

      isProcessingRef.current = true

      // Normalizar el contenido
      const normalized = normalizeText(newContent)
      setContent(normalized)

      // Notificar al componente padre
      if (onChange) {
        onChange(normalized)
      }

      isProcessingRef.current = false

      // Restaurar el estado de selección después de procesar
      setTimeout(() => {
        restoreSelectionState()
      }, 0)
    },
    [normalizeText, onChange, saveSelectionState, restoreSelectionState],
  )

  // Aplicar estilos LTR al editor
  useEffect(() => {
    if (!editorRef.current) return

    const applyLTRStyles = () => {
      if (!editorRef.current) return

      // Aplicar estilos LTR a todos los elementos editables
      const editableElements = editorRef.current.querySelectorAll('[contenteditable="true"]')
      editableElements.forEach((el) => {
        const element = el as HTMLElement
        element.style.direction = "ltr"
        element.style.textAlign = "left"
        element.setAttribute("dir", "ltr")
        element.style.unicodeBidi = "plaintext"

        // Aplicar estilos a todos los elementos dentro del editable
        const children = element.querySelectorAll("*")
        children.forEach((child) => {
          const childElement = child as HTMLElement
          childElement.style.direction = "ltr"
          childElement.style.textAlign = "left"
          childElement.setAttribute("dir", "ltr")
        })
      })
    }

    // Aplicar estilos inicialmente
    applyLTRStyles()

    // Configurar un observador de mutaciones para aplicar estilos cuando cambie el DOM
    const observer = new MutationObserver(() => {
      if (!isProcessingRef.current) {
        applyLTRStyles()
      }
    })

    observer.observe(editorRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Interceptar eventos de teclado para mantener la dirección LTR
  useEffect(() => {
    if (!editorRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Guardar el estado de selección antes de cualquier cambio
      saveSelectionState()

      // No interferir con teclas de control
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Aplicar estilos LTR después de cada pulsación de tecla
      setTimeout(() => {
        if (!isProcessingRef.current) {
          const editableElements = editorRef.current?.querySelectorAll('[contenteditable="true"]')
          editableElements?.forEach((el) => {
            const element = el as HTMLElement
            element.style.direction = "ltr"
            element.setAttribute("dir", "ltr")
          })

          // Restaurar el estado de selección
          restoreSelectionState()
        }
      }, 0)
    }

    // Interceptar eventos de clic para corregir la posición del cursor
    const handleClick = () => {
      setTimeout(() => {
        // Guardar la nueva posición del cursor después del clic
        saveSelectionState()
      }, 0)
    }

    // Añadir listeners
    editorRef.current.addEventListener("keydown", handleKeyDown)
    editorRef.current.addEventListener("click", handleClick)

    return () => {
      editorRef.current?.removeEventListener("keydown", handleKeyDown)
      editorRef.current?.removeEventListener("click", handleClick)
    }
  }, [saveSelectionState, restoreSelectionState])

  // Función para forzar LTR y limpiar el contenido
  const forceLTR = useCallback(() => {
    if (!editorRef.current) return

    // Guardar el estado de selección
    saveSelectionState()

    isProcessingRef.current = true

    // Aplicar estilos LTR a todos los elementos
    const editableElements = editorRef.current.querySelectorAll('[contenteditable="true"]')
    editableElements.forEach((el) => {
      const element = el as HTMLElement

      // Limpiar caracteres de control bidireccionales
      const cleanHTML = element.innerHTML.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
      element.innerHTML = cleanHTML

      // Aplicar estilos LTR
      element.style.direction = "ltr"
      element.style.textAlign = "left"
      element.setAttribute("dir", "ltr")
      element.style.unicodeBidi = "plaintext"

      // Aplicar estilos a todos los elementos dentro del editable
      const children = element.querySelectorAll("*")
      children.forEach((child) => {
        const childElement = child as HTMLElement
        childElement.style.direction = "ltr"
        childElement.style.textAlign = "left"
        childElement.setAttribute("dir", "ltr")
      })

      // Actualizar el estado
      setContent(cleanHTML)
      if (onChange) {
        onChange(cleanHTML)
      }
    })

    isProcessingRef.current = false

    // Restaurar el estado de selección
    setTimeout(() => {
      restoreSelectionState()
    }, 0)
  }, [saveSelectionState, restoreSelectionState, onChange])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Barra de herramientas */}
      <div className="bg-gray-50 border-b p-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={forceLTR}>
          Forzar dirección izquierda a derecha
        </Button>

        <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)}>
          {debugMode ? "Desactivar modo debug" : "Activar modo debug"}
        </Button>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="cursor-fixed-editor" dir="ltr" style={{ direction: "ltr" }}>
        <SimpleRichTextEditor
          initialContent={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          minHeight={minHeight}
          reportId={reportId}
          sectionId={sectionId}
          readOnly={readOnly}
        />
      </div>

      {/* Estilos globales para forzar LTR */}
      <style jsx global>{`
        .cursor-fixed-editor [contenteditable="true"],
        .cursor-fixed-editor [contenteditable="true"] * {
          direction: ltr !important;
          text-align: left !important;
        }
        
        .cursor-fixed-editor [contenteditable="true"] {
          unicode-bidi: plaintext !important;
        }
        
        .cursor-fixed-editor [contenteditable="true"] * {
          unicode-bidi: isolate !important;
        }
      `}</style>
    </div>
  )
}
