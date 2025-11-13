"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { SimpleRichTextEditor } from "./simple-rich-text-editor"

interface NormalizedTextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function NormalizedTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: NormalizedTextEditorProps) {
  const [normalizedContent, setNormalizedContent] = useState(initialContent)
  const editorRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  // Función para normalizar el texto (eliminar caracteres de control y forzar LTR)
  const normalizeText = useCallback((text: string): string => {
    // Eliminar caracteres de control bidireccionales
    const cleanText = text.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")

    // Envolver el contenido en un span con dirección forzada si no está ya envuelto
    if (!cleanText.includes('dir="ltr"') && !cleanText.includes("unicode-bidi: isolate")) {
      // Buscar todos los elementos de nivel de bloque y aplicar dirección LTR
      const wrappedText = cleanText.replace(
        /(<(?:p|div|h[1-6]|li|td|th|blockquote)(?:\s+[^>]*)?>)(.*?)(<\/(?:p|div|h[1-6]|li|td|th|blockquote)>)/gi,
        '$1<span style="direction: ltr; unicode-bidi: isolate; display: inline-block; width: 100%;">$2</span>$3',
      )

      return wrappedText
    }

    return cleanText
  }, [])

  // Manejar cambios en el contenido
  const handleContentChange = useCallback(
    (content: string) => {
      if (isProcessingRef.current) return

      isProcessingRef.current = true

      // Normalizar el contenido
      const normalized = normalizeText(content)
      setNormalizedContent(normalized)

      // Notificar al componente padre
      if (onChange) {
        onChange(normalized)
      }

      isProcessingRef.current = false
    },
    [normalizeText, onChange],
  )

  // Normalizar el contenido inicial
  useEffect(() => {
    if (initialContent) {
      const normalized = normalizeText(initialContent)
      setNormalizedContent(normalized)
    }
  }, [initialContent, normalizeText])

  // Aplicar estilos LTR al editor
  useEffect(() => {
    if (editorRef.current) {
      const applyLTRStyles = () => {
        const editor = editorRef.current
        if (!editor) return

        // Aplicar estilos LTR al editor
        editor.style.direction = "ltr"
        editor.style.textAlign = "left"
        editor.setAttribute("dir", "ltr")

        // Aplicar estilos LTR a todos los elementos dentro del editor
        const allElements = editor.querySelectorAll("*")
        allElements.forEach((el) => {
          const element = el as HTMLElement
          element.style.direction = "ltr"
          element.style.textAlign = "left"
          element.setAttribute("dir", "ltr")
          element.style.unicodeBidi = "isolate"
        })
      }

      // Aplicar estilos inicialmente
      applyLTRStyles()

      // Configurar un observador de mutaciones para aplicar estilos cuando cambie el DOM
      const observer = new MutationObserver(applyLTRStyles)
      if (editorRef.current) {
        observer.observe(editorRef.current, { childList: true, subtree: true, attributes: true })
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <div ref={editorRef} className="ltr-editor-wrapper" dir="ltr" style={{ direction: "ltr" }}>
      <SimpleRichTextEditor
        initialContent={normalizedContent}
        onChange={handleContentChange}
        placeholder={placeholder}
        minHeight={minHeight}
        reportId={reportId}
        sectionId={sectionId}
        readOnly={readOnly}
      />

      {/* Estilos globales para forzar LTR */}
      <style jsx global>{`
        .ltr-editor-wrapper,
        .ltr-editor-wrapper * {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
        }
        
        .ltr-editor-wrapper [contenteditable="true"] {
          unicode-bidi: plaintext !important;
        }
      `}</style>
    </div>
  )
}
