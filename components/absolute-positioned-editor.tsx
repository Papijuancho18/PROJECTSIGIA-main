"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface AbsolutePositionedEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function AbsolutePositionedEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: AbsolutePositionedEditorProps) {
  // Convertir el contenido inicial a texto plano
  const plainText = initialContent ? initialContent.replace(/<[^>]*>/g, "") : ""

  // Estado para el texto y la posición del cursor
  const [text, setText] = useState(plainText)
  const [cursorPosition, setCursorPosition] = useState(plainText.length)
  const [isFocused, setIsFocused] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Referencias
  const editorRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // Tamaño de cada carácter (en píxeles)
  const charWidth = 9 // Aproximadamente 9px para fuente monoespaciada
  const charHeight = 18 // Aproximadamente 18px de altura de línea

  // Número de caracteres por línea
  const charsPerLine = 80

  // Función para calcular la posición X,Y del cursor
  const getCursorCoordinates = useCallback(
    (position: number) => {
      const line = Math.floor(position / charsPerLine)
      const column = position % charsPerLine

      return {
        x: column * charWidth,
        y: line * charHeight,
      }
    },
    [charsPerLine, charWidth, charHeight],
  )

  // Función para manejar la entrada de texto
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ignorar teclas de control
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return
      }

      // Manejar teclas especiales
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCursorPosition((prev) => Math.max(0, prev - 1))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setCursorPosition((prev) => Math.min(text.length, prev + 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setCursorPosition((prev) => Math.max(0, prev - charsPerLine))
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setCursorPosition((prev) => Math.min(text.length, prev + charsPerLine))
      } else if (e.key === "Home") {
        e.preventDefault()
        const currentLine = Math.floor(cursorPosition / charsPerLine)
        setCursorPosition(currentLine * charsPerLine)
      } else if (e.key === "End") {
        e.preventDefault()
        const currentLine = Math.floor(cursorPosition / charsPerLine)
        const nextLineStart = (currentLine + 1) * charsPerLine
        setCursorPosition(Math.min(text.length, nextLineStart - 1))
      } else if (e.key === "Backspace") {
        e.preventDefault()
        if (cursorPosition > 0) {
          const newText = text.substring(0, cursorPosition - 1) + text.substring(cursorPosition)
          setText(newText)
          setCursorPosition((prev) => prev - 1)
          onChange(newText)
        }
      } else if (e.key === "Delete") {
        e.preventDefault()
        if (cursorPosition < text.length) {
          const newText = text.substring(0, cursorPosition) + text.substring(cursorPosition + 1)
          setText(newText)
          onChange(newText)
        }
      } else if (e.key === "Enter") {
        e.preventDefault()
        // Insertar múltiples espacios para simular una nueva línea
        const spacesToAdd = charsPerLine - (cursorPosition % charsPerLine)
        const newText = text.substring(0, cursorPosition) + " ".repeat(spacesToAdd) + text.substring(cursorPosition)
        setText(newText)
        setCursorPosition((prev) => prev + spacesToAdd)
        onChange(newText)
      } else if (e.key.length === 1) {
        // Insertar un carácter normal
        e.preventDefault()
        const newText = text.substring(0, cursorPosition) + e.key + text.substring(cursorPosition)
        setText(newText)
        setCursorPosition((prev) => prev + 1)
        onChange(newText)
      }
    },
    [text, cursorPosition, onChange, charsPerLine],
  )

  // Manejar clic en el editor
  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editorRef.current) return

      // Calcular la posición aproximada del cursor basada en el clic
      const rect = editorRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Convertir coordenadas a posición en el texto
      const line = Math.floor(y / charHeight)
      const column = Math.floor(x / charWidth)

      // Calcular la nueva posición del cursor
      const newPosition = Math.min(text.length, line * charsPerLine + column)
      setCursorPosition(Math.max(0, newPosition))

      // Enfocar el input oculto
      hiddenInputRef.current?.focus()
    },
    [text.length, charHeight, charWidth, charsPerLine],
  )

  // Efecto para parpadeo del cursor
  useEffect(() => {
    if (!isFocused) return

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [isFocused])

  // Renderizar caracteres individuales
  const renderCharacters = () => {
    return text.split("").map((char, index) => {
      const { x, y } = getCursorCoordinates(index)

      return (
        <span
          key={index}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "18px",
            whiteSpace: "pre",
          }}
        >
          {char}
        </span>
      )
    })
  }

  // Renderizar cursor
  const renderCursor = () => {
    if (!isFocused || !cursorVisible) return null

    const { x, y } = getCursorCoordinates(cursorPosition)

    return (
      <div
        style={{
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: "2px",
          height: `${charHeight}px`,
          backgroundColor: "#000",
          animation: "blink 1s step-end infinite",
        }}
      />
    )
  }

  // Calcular altura del editor
  const editorHeight = Math.max(
    Number.parseInt(minHeight),
    Math.ceil(text.length / charsPerLine) * charHeight + charHeight,
  )

  return (
    <div className="border rounded-lg overflow-hidden w-full">
      {/* Barra de herramientas básica */}
      <div className="bg-gray-50 border-b p-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            hiddenInputRef.current?.focus()
          }}
        >
          Activar editor
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="relative p-4 bg-white"
        style={{
          minHeight: minHeight,
          height: `${editorHeight}px`,
          fontFamily: "monospace",
          fontSize: "14px",
          lineHeight: "18px",
          cursor: "text",
        }}
        onClick={handleEditorClick}
      >
        {/* Caracteres */}
        {renderCharacters()}

        {/* Cursor */}
        {renderCursor()}

        {/* Placeholder */}
        {text.length === 0 && !isFocused && <div className="absolute top-4 left-4 text-gray-400">{placeholder}</div>}

        {/* Input oculto para capturar eventos de teclado */}
        <input
          ref={hiddenInputRef}
          type="text"
          className="opacity-0 absolute top-0 left-0 w-px h-px"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
