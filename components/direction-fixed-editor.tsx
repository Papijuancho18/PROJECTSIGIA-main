"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface DirectionFixedEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function DirectionFixedEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: DirectionFixedEditorProps) {
  // Limpiar el contenido inicial de caracteres de control de dirección
  const cleanInitialContent = initialContent ? initialContent.replace(/[\u200E\u200F\u061C\u2066-\u2069]/g, "") : ""

  const [content, setContent] = useState(cleanInitialContent)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Función para limpiar el texto de caracteres de control de dirección
  const cleanText = useCallback((text: string) => {
    return text.replace(/[\u200E\u200F\u061C\u2066-\u2069]/g, "")
  }, [])

  // Función para manejar cambios en el contenido
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Obtener el valor actual del textarea
      const newValue = e.target.value

      // Limpiar el texto de caracteres de control de dirección
      const cleanedValue = cleanText(newValue)

      // Actualizar el estado y notificar al componente padre
      setContent(cleanedValue)
      onChange(cleanedValue)
    },
    [onChange, cleanText],
  )

  // Efecto para aplicar estilos y atributos al montar el componente
  useEffect(() => {
    if (editorRef.current) {
      // Aplicar atributos y estilos para forzar LTR
      editorRef.current.dir = "ltr"
      editorRef.current.style.direction = "ltr"
      editorRef.current.style.textAlign = "left"

      // Forzar la posición del cursor al final del texto
      editorRef.current.selectionStart = editorRef.current.value.length
      editorRef.current.selectionEnd = editorRef.current.value.length
    }
  }, [])

  // Función para forzar LTR y reposicionar el cursor
  const forceLTR = useCallback(() => {
    if (editorRef.current) {
      // Guardar la posición actual del cursor
      const cursorPos = editorRef.current.selectionStart

      // Limpiar el texto de caracteres de control de dirección
      const cleanedValue = cleanText(editorRef.current.value)

      // Actualizar el valor
      editorRef.current.value = cleanedValue
      setContent(cleanedValue)
      onChange(cleanedValue)

      // Restaurar la posición del cursor
      editorRef.current.selectionStart = cursorPos
      editorRef.current.selectionEnd = cursorPos

      // Aplicar atributos y estilos para forzar LTR
      editorRef.current.dir = "ltr"
      editorRef.current.style.direction = "ltr"
      editorRef.current.style.textAlign = "left"
    }
  }, [onChange, cleanText])

  // Función para manejar eventos de teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Forzar LTR después de cada pulsación de tecla
      setTimeout(forceLTR, 0)
    },
    [forceLTR],
  )

  // Función para manejar eventos de pegado
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Prevenir el comportamiento predeterminado
      e.preventDefault()

      // Obtener el texto del portapapeles
      const pastedText = e.clipboardData.getData("text/plain")

      // Limpiar el texto pegado
      const cleanedPaste = cleanText(pastedText)

      // Obtener la posición actual del cursor
      const cursorPos = e.currentTarget.selectionStart

      // Insertar el texto limpio en la posición del cursor
      const newValue = content.substring(0, cursorPos) + cleanedPaste + content.substring(e.currentTarget.selectionEnd)

      // Actualizar el contenido
      setContent(newValue)
      onChange(newValue)

      // Actualizar la posición del cursor después del texto pegado
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPos + cleanedPaste.length
          editorRef.current.selectionEnd = cursorPos + cleanedPaste.length
        }
      }, 0)
    },
    [content, onChange, cleanText],
  )

  return (
    <div className="border rounded-lg overflow-hidden w-full">
      {/* Barra de herramientas */}
      <div className="bg-gray-50 border-b p-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={forceLTR}>
          Forzar dirección izquierda a derecha
        </Button>
      </div>

      {/* Editor */}
      <textarea
        ref={editorRef}
        className="w-full p-4 outline-none resize-none"
        style={{
          minHeight,
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "isolate",
          fontFamily: "Arial, sans-serif",
        }}
        dir="ltr"
        placeholder={placeholder}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={forceLTR}
        onBlur={forceLTR}
      />

      {/* Estilos globales para forzar LTR */}
      <style jsx global>{`
        textarea {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
        }
      `}</style>
    </div>
  )
}
