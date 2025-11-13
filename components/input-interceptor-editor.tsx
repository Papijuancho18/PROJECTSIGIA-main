"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { SimpleRichTextEditor } from "./simple-rich-text-editor"

interface InputInterceptorEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function InputInterceptorEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: InputInterceptorEditorProps) {
  // Estado para el contenido
  const [content, setContent] = useState(initialContent || "")

  // Referencias
  const editorRef = useRef<HTMLDivElement>(null)
  const originalInputHandler = useRef<((this: GlobalEventHandlers, ev: Event) => any) | null>(null)
  const isProcessingRef = useRef(false)

  // Función para normalizar el texto
  const normalizeText = useCallback((text: string): string => {
    // Eliminar caracteres de control bidireccionales
    return text.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
  }, [])

  // Función para manejar cambios en el contenido
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (isProcessingRef.current) return

      isProcessingRef.current = true

      // Normalizar el contenido
      const normalized = normalizeText(newContent)
      setContent(normalized)

      // Notificar al componente padre
      if (onChange) {
        onChange(normalized)
      }

      isProcessingRef.current = false
    },
    [normalizeText, onChange],
  )

  // Efecto para interceptar eventos de entrada
  useEffect(() => {
    if (!editorRef.current) return

    // Función para encontrar elementos editables
    const findEditableElements = () => {
      if (!editorRef.current) return []

      return Array.from(editorRef.current.querySelectorAll('[contenteditable="true"]'))
    }

    // Función para interceptar eventos de entrada
    const interceptInput = () => {
      const editableElements = findEditableElements()

      editableElements.forEach((el) => {
        const element = el as HTMLElement

        // Guardar el manejador original
        if (!originalInputHandler.current) {
          originalInputHandler.current = element.oninput
        }

        // Reemplazar el manejador de eventos input
        element.oninput = (e) => {
          if (isProcessingRef.current) return

          // Aplicar estilos LTR
          element.style.direction = "ltr"
          element.style.textAlign = "left"
          element.setAttribute("dir", "ltr")

          // Llamar al manejador original si existe
          if (originalInputHandler.current) {
            originalInputHandler.current.call(element, e)
          }
        }

        // Interceptar eventos de pegado
        element.onpaste = (e) => {
          e.preventDefault()

          // Obtener texto plano del portapapeles
          const text = e.clipboardData?.getData("text/plain") || ""

          // Normalizar el texto
          const normalized = normalizeText(text)

          // Insertar el texto normalizado
          document.execCommand("insertText", false, normalized)
        }

        // Interceptar eventos de teclado
        element.onkeydown = (e) => {
          // No interferir con teclas de control
          if (e.ctrlKey || e.metaKey || e.altKey) return

          // Aplicar estilos LTR después de cada pulsación de tecla
          setTimeout(() => {
            element.style.direction = "ltr"
            element.style.textAlign = "left"
            element.setAttribute("dir", "ltr")
          }, 0)
        }
      })
    }

    // Interceptar inicialmente
    interceptInput()

    // Configurar un observador de mutaciones para interceptar cuando se añadan nuevos elementos
    const observer = new MutationObserver(() => {
      if (!isProcessingRef.current) {
        interceptInput()
      }
    })

    observer.observe(editorRef.current, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [normalizeText])

  return (
    <div ref={editorRef} className="interceptor-editor-wrapper" dir="ltr" style={{ direction: "ltr" }}>
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
        .interceptor-editor-wrapper [contenteditable="true"],
        .interceptor-editor-wrapper [contenteditable="true"] * {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  )
}
