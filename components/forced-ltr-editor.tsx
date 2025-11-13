"use client"

import type React from "react"

import { useRef, useEffect, useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"

interface ForcedLTREditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function ForcedLTREditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: ForcedLTREditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  // Inicializar el editor cuando se monta el componente
  useEffect(() => {
    if (editorRef.current) {
      // Establecer el contenido inicial
      editorRef.current.innerHTML = initialContent || ""

      // Aplicar configuración LTR
      forceLTR()
    }
  }, [initialContent])

  // Función para forzar LTR en todo el contenido del editor
  const forceLTR = () => {
    if (!editorRef.current) return

    // Aplicar dirección LTR al editor principal
    editorRef.current.dir = "ltr"
    editorRef.current.style.direction = "ltr"
    editorRef.current.style.textAlign = "left"

    // Aplicar dirección LTR a todos los elementos dentro del editor
    const allElements = editorRef.current.querySelectorAll("*")
    allElements.forEach((el) => {
      const element = el as HTMLElement
      element.dir = "ltr"
      element.style.direction = "ltr"
      element.style.textAlign = "left"
      element.style.unicodeBidi = "isolate"
    })
  }

  // Función para manejar cambios en el contenido
  const handleInput = () => {
    if (editorRef.current && !isComposing) {
      // Obtener el contenido actualizado
      const content = editorRef.current.innerHTML

      // Notificar al componente padre
      onChange(content)

      // Forzar LTR después de cada cambio
      forceLTR()
    }
  }

  // Función para manejar eventos de teclado
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // No interferir con eventos de composición (IME)
    if (isComposing) return

    // No interferir con teclas de control
    if (e.ctrlKey || e.metaKey) return

    // Forzar LTR después de cada pulsación de tecla
    setTimeout(forceLTR, 0)
  }

  // Función para preservar la posición del cursor
  const preserveCursorPosition = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      // Crear un marcador temporal
      const marker = document.createElement("span")
      marker.id = "cursor-position-marker"

      // Insertar el marcador en la posición actual del cursor
      range.insertNode(marker)

      // Forzar LTR
      forceLTR()

      // Restaurar la posición del cursor
      if (marker.parentNode) {
        range.setStartAfter(marker)
        range.setEndAfter(marker)
        marker.parentNode.removeChild(marker)

        // Actualizar la selección
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  // Función para manejar el pegado de texto
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    // Obtener texto plano del portapapeles
    const text = e.clipboardData.getData("text/plain")

    // Insertar el texto en la posición actual del cursor
    document.execCommand("insertText", false, text)

    // Forzar LTR después del pegado
    setTimeout(forceLTR, 0)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Barra de herramientas básica */}
      <div className="bg-gray-50 border-b p-2 flex gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => document.execCommand("bold")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-bold h-4 w-4"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => document.execCommand("italic")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-italic h-4 w-4"
          >
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => document.execCommand("underline")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-underline h-4 w-4"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 ml-2"
          onClick={forceLTR}
          title="Forzar dirección izquierda a derecha"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-align-left h-4 w-4"
          >
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="15" y1="12" x2="3" y2="12" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </Button>
      </div>

      {/* Editor de texto */}
      <div
        ref={editorRef}
        className="p-4 outline-none min-h-[200px]"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => {
          setIsComposing(false)
          handleInput()
        }}
        onPaste={handlePaste}
        onKeyUp={preserveCursorPosition}
        onClick={preserveCursorPosition}
        dir="ltr"
        style={{
          direction: "ltr",
          textAlign: "left",
          minHeight,
          unicodeBidi: "isolate",
        }}
      />

      {/* Estilos CSS para forzar LTR */}
      <style jsx global>{`
        [contenteditable="true"],
        [contenteditable="true"] *,
        [contenteditable="true"] *::before,
        [contenteditable="true"] *::after {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
        }
      `}</style>
    </div>
  )
}
