"use client"

import { useRef, useEffect } from "react"

interface BasicTextareaEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function BasicTextareaEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: BasicTextareaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Aplicar estilos agresivos para forzar LTR
  useEffect(() => {
    if (textareaRef.current) {
      // Forzar dirección LTR
      textareaRef.current.dir = "ltr"
      textareaRef.current.style.direction = "ltr"
      textareaRef.current.style.textAlign = "left"

      // Aplicar estilos adicionales para forzar LTR
      textareaRef.current.style.unicodeBidi = "plaintext"
      textareaRef.current.style.writingMode = "horizontal-tb"

      // Establecer el contenido inicial
      textareaRef.current.value = initialContent || ""
    }
  }, [initialContent])

  return (
    <div className="border rounded-lg overflow-hidden w-full">
      <textarea
        ref={textareaRef}
        className="w-full p-4 outline-none resize-none"
        style={{
          minHeight,
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "plaintext",
          writingMode: "horizontal-tb",
        }}
        placeholder={placeholder}
        defaultValue={initialContent}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
      />
    </div>
  )
}
