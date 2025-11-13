"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { SimpleRichTextEditor } from "./simple-rich-text-editor"

interface HybridEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function HybridEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: HybridEditorProps) {
  // Estado para el contenido
  const [content, setContent] = useState(initialContent || "")

  // Referencias
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef(false)

  // Función para normalizar el texto
  const normalizeText = useCallback((text: string): string => {
    // Eliminar caracteres de control bidireccionales
    return text.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
  }, [])

  // Función para manejar cambios en el contenido
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (processingRef.current) return

      processingRef.current = true

      // Normalizar el contenido
      const normalized = normalizeText(newContent)
      setContent(normalized)

      // Notificar al componente padre
      if (onChange) {
        onChange(normalized)
      }

      processingRef.current = false
    },
    [normalizeText, onChange],
  )

  // Efecto para aplicar estilos LTR
  useEffect(() => {
    if (!editorWrapperRef.current) return

    // Función para aplicar estilos LTR a todos los elementos
    const applyLTRStyles = () => {
      const wrapper = editorWrapperRef.current
      if (!wrapper) return

      // Seleccionar todos los elementos editables dentro del wrapper
      const editableElements = wrapper.querySelectorAll('[contenteditable="true"]')

      editableElements.forEach((el) => {
        const element = el as HTMLElement

        // Aplicar estilos LTR
        element.style.direction = "ltr"
        element.style.textAlign = "left"
        element.setAttribute("dir", "ltr")
        element.style.unicodeBidi = "plaintext"

        // Aplicar estilos a todos los elementos hijos
        const children = element.querySelectorAll("*")
        children.forEach((child) => {
          const childElement = child as HTMLElement
          childElement.style.direction = "ltr"
          childElement.style.textAlign = "left"
          childElement.setAttribute("dir", "ltr")
          childElement.style.unicodeBidi = "isolate"
        })
      })
    }

    // Aplicar estilos inicialmente
    applyLTRStyles()

    // Configurar un observador de mutaciones para aplicar estilos cuando cambie el DOM
    const observer = new MutationObserver(() => {
      if (!processingRef.current) {
        applyLTRStyles()
      }
    })

    observer.observe(editorWrapperRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Efecto para interceptar eventos de teclado
  useEffect(() => {
    if (!editorWrapperRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // No interferir con teclas de control
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Aplicar estilos LTR después de cada pulsación de tecla
      setTimeout(() => {
        if (!processingRef.current) {
          const editableElements = editorWrapperRef.current?.querySelectorAll('[contenteditable="true"]')

          editableElements?.forEach((el) => {
            const element = el as HTMLElement
            element.style.direction = "ltr"
            element.setAttribute("dir", "ltr")
          })
        }
      }, 0)
    }

    // Añadir listener para eventos de teclado
    editorWrapperRef.current.addEventListener("keydown", handleKeyDown)

    return () => {
      editorWrapperRef.current?.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div ref={editorWrapperRef} className="hybrid-editor-wrapper" dir="ltr" style={{ direction: "ltr" }}>
      <SimpleRichTextEditor
        initialContent={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        minHeight={minHeight}
        reportId={reportId}
        sectionId={sectionId}
        readOnly={readOnly}
      />

      {/* Estilos globales para forzar LTR */}
      <style jsx global>{`
        .hybrid-editor-wrapper [contenteditable="true"],
        .hybrid-editor-wrapper [contenteditable="true"] * {
          direction: ltr !important;
          text-align: left !important;
        }
        
        .hybrid-editor-wrapper [contenteditable="true"] {
          unicode-bidi: plaintext !important;
        }
        
        .hybrid-editor-wrapper [contenteditable="true"] * {
          unicode-bidi: isolate !important;
        }
      `}</style>
    </div>
  )
}
