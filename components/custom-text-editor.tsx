"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Undo } from "lucide-react"

interface CustomTextEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function CustomTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: CustomTextEditorProps) {
  // Estado para el texto actual
  const [text, setText] = useState(initialContent || "")

  // Estado para la posición del cursor
  const [cursorPosition, setCursorPosition] = useState(0)

  // Estado para el historial
  const [history, setHistory] = useState<string[]>([initialContent || ""])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Referencia al contenedor del editor
  const editorRef = useRef<HTMLDivElement>(null)

  // Referencia al cursor
  const cursorRef = useRef<HTMLDivElement>(null)

  // Estado para el parpadeo del cursor
  const [cursorVisible, setCursorVisible] = useState(true)

  // Estado para el foco
  const [isFocused, setIsFocused] = useState(false)

  // Función para actualizar el texto
  const updateText = useCallback(
    (newText: string, newCursorPosition: number) => {
      setText(newText)
      setCursorPosition(newCursorPosition)

      // Actualizar el historial
      if (newText !== history[historyIndex]) {
        const newHistory = [...history.slice(0, historyIndex + 1), newText]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        // Notificar al componente padre
        onChange(newText)
      }
    },
    [history, historyIndex, onChange],
  )

  // Función para manejar la entrada de texto
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevenir el comportamiento predeterminado para todas las teclas
      e.preventDefault()

      // Obtener el texto actual y la posición del cursor
      let newText = text
      let newCursorPosition = cursorPosition

      // Manejar diferentes teclas
      if (e.key.length === 1) {
        // Insertar un carácter
        newText = text.slice(0, cursorPosition) + e.key + text.slice(cursorPosition)
        newCursorPosition = cursorPosition + 1
      } else if (e.key === "Backspace") {
        // Borrar un carácter hacia atrás
        if (cursorPosition > 0) {
          newText = text.slice(0, cursorPosition - 1) + text.slice(cursorPosition)
          newCursorPosition = cursorPosition - 1
        }
      } else if (e.key === "Delete") {
        // Borrar un carácter hacia adelante
        if (cursorPosition < text.length) {
          newText = text.slice(0, cursorPosition) + text.slice(cursorPosition + 1)
        }
      } else if (e.key === "ArrowLeft") {
        // Mover el cursor hacia la izquierda
        if (cursorPosition > 0) {
          newCursorPosition = cursorPosition - 1
        }
      } else if (e.key === "ArrowRight") {
        // Mover el cursor hacia la derecha
        if (cursorPosition < text.length) {
          newCursorPosition = cursorPosition + 1
        }
      } else if (e.key === "Home") {
        // Mover el cursor al inicio
        newCursorPosition = 0
      } else if (e.key === "End") {
        // Mover el cursor al final
        newCursorPosition = text.length
      } else if (e.key === "Enter") {
        // Insertar un salto de línea
        newText = text.slice(0, cursorPosition) + "\n" + text.slice(cursorPosition)
        newCursorPosition = cursorPosition + 1
      } else if (e.key === "z" && e.ctrlKey) {
        // Deshacer
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setText(history[newIndex])
          setHistoryIndex(newIndex)
          newCursorPosition = Math.min(cursorPosition, history[newIndex].length)
          onChange(history[newIndex])
          return
        }
      } else if ((e.key === "y" && e.ctrlKey) || (e.key === "z" && e.ctrlKey && e.shiftKey)) {
        // Rehacer
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          setText(history[newIndex])
          setHistoryIndex(newIndex)
          newCursorPosition = Math.min(cursorPosition, history[newIndex].length)
          onChange(history[newIndex])
          return
        }
      }

      // Actualizar el texto y la posición del cursor
      updateText(newText, newCursorPosition)
    },
    [text, cursorPosition, history, historyIndex, updateText, onChange],
  )

  // Función para manejar el clic en el editor
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Obtener la posición del clic relativa al editor
      if (editorRef.current) {
        const rect = editorRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Calcular la posición del cursor basada en el clic
        // Esta es una implementación simplificada; en un editor real,
        // necesitaríamos calcular la posición exacta basada en el texto
        const textBeforeCursor = text.slice(0, cursorPosition)
        const lines = textBeforeCursor.split("\n")
        const lineHeight = 20 // Altura aproximada de una línea de texto
        const charWidth = 8 // Ancho aproximado de un carácter

        // Calcular la línea en la que se hizo clic
        const clickedLine = Math.floor(y / lineHeight)
        const lineCount = lines.length

        if (clickedLine >= lineCount) {
          // Clic después de la última línea
          setCursorPosition(text.length)
        } else {
          // Calcular la posición del cursor en la línea
          let lineStart = 0
          for (let i = 0; i < clickedLine; i++) {
            lineStart += lines[i].length + 1 // +1 para el carácter de nueva línea
          }

          const clickedChar = Math.floor(x / charWidth)
          const lineLength = lines[clickedLine].length

          if (clickedChar >= lineLength) {
            // Clic después del final de la línea
            setCursorPosition(lineStart + lineLength)
          } else {
            // Clic en la línea
            setCursorPosition(lineStart + clickedChar)
          }
        }
      }

      // Enfocar el editor
      setIsFocused(true)
    },
    [text, cursorPosition],
  )

  // Efecto para el parpadeo del cursor
  useEffect(() => {
    if (isFocused) {
      const interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 500)

      return () => clearInterval(interval)
    } else {
      setCursorVisible(false)
    }
  }, [isFocused])

  // Efecto para posicionar el cursor
  useEffect(() => {
    if (cursorRef.current && editorRef.current) {
      // Calcular la posición del cursor
      const textBeforeCursor = text.slice(0, cursorPosition)
      const lines = textBeforeCursor.split("\n")
      const currentLine = lines.length - 1
      const currentColumn = lines[currentLine].length

      const lineHeight = 20 // Altura aproximada de una línea de texto
      const charWidth = 8 // Ancho aproximado de un carácter

      // Posicionar el cursor
      cursorRef.current.style.top = `${currentLine * lineHeight}px`
      cursorRef.current.style.left = `${currentColumn * charWidth}px`

      // Hacer visible el cursor
      cursorRef.current.style.display = cursorVisible && isFocused ? "block" : "none"

      // Asegurarse de que el cursor esté visible en el editor
      const cursorTop = currentLine * lineHeight
      const cursorLeft = currentColumn * charWidth
      const editorHeight = editorRef.current.clientHeight
      const editorWidth = editorRef.current.clientWidth

      if (cursorTop < editorRef.current.scrollTop) {
        editorRef.current.scrollTop = cursorTop
      } else if (cursorTop + lineHeight > editorRef.current.scrollTop + editorHeight) {
        editorRef.current.scrollTop = cursorTop + lineHeight - editorHeight
      }

      if (cursorLeft < editorRef.current.scrollLeft) {
        editorRef.current.scrollLeft = cursorLeft
      } else if (cursorLeft + charWidth > editorRef.current.scrollLeft + editorWidth) {
        editorRef.current.scrollLeft = cursorLeft + charWidth - editorWidth
      }
    }
  }, [text, cursorPosition, cursorVisible, isFocused])

  // Renderizar el editor
  return (
    <div className="border rounded-lg overflow-hidden w-full">
      {/* Barra de herramientas */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Deshacer/Rehacer */}
        <div className="flex gap-1 mr-2 border-r pr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (historyIndex > 0) {
                      const newIndex = historyIndex - 1
                      setText(history[newIndex])
                      setHistoryIndex(newIndex)
                      setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
                      onChange(history[newIndex])
                    }
                  }}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (historyIndex < history.length - 1) {
                      const newIndex = historyIndex + 1
                      setText(history[newIndex])
                      setHistoryIndex(newIndex)
                      setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
                      onChange(history[newIndex])
                    }
                  }}
                  disabled={historyIndex >= history.length - 1}
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
                    className="lucide lucide-redo h-4 w-4"
                  >
                    <path d="M21 4H3v8" />
                    <path d="m17 8 4 4-4 4" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Otros botones de la barra de herramientas */}
        {/* ... */}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="p-4 outline-none w-full bg-white relative"
        style={{
          minHeight,
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          overflowY: "auto",
          cursor: "text",
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Texto */}
        <div className="whitespace-pre-wrap">{text || <span className="text-gray-400">{placeholder}</span>}</div>

        {/* Cursor */}
        <div
          ref={cursorRef}
          className="absolute w-[2px] h-[20px] bg-black"
          style={{
            display: cursorVisible && isFocused ? "block" : "none",
          }}
        />
      </div>
    </div>
  )
}
