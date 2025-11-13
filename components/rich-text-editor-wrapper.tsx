"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Cargar TinyMCE dinámicamente para evitar problemas de SSR
const DynamicTinyMCEEditor = dynamic(() => import("./tinymce-editor").then((mod) => mod.TinyMCEEditor), { ssr: false })

interface RichTextEditorWrapperProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: RichTextEditorWrapperProps) {
  // Estado para el contenido
  const [content, setContent] = useState(initialContent || "")

  // Efecto para notificar al componente padre cuando cambia el contenido
  useEffect(() => {
    onChange(content)
  }, [content, onChange])

  return (
    <DynamicTinyMCEEditor
      initialContent={initialContent}
      onChange={setContent}
      placeholder={placeholder}
      minHeight={minHeight}
    />
  )
}
