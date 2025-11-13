"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface CustomCursorEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function CustomCursorEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: CustomCursorEditorProps) {
  // Estado para el contenido HTML
  const [html, setHtml] = useState(initialContent || "")

  // Estado para la posición del cursor
  const [cursorPosition, setCursorPosition] = useState(0)

  // Estado para el historial (deshacer/rehacer)
  const [history, setHistory] = useState<string[]>([initialContent || ""])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Referencias a elementos DOM
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Estado para el parpadeo del cursor
  const [cursorVisible, setCursorVisible] = useState(true)

  // Estado para el foco
  const [isFocused, setIsFocused] = useState(false)

  // Función para actualizar el contenido y notificar al componente padre
  const updateContent = useCallback(
    (newHtml: string) => {
      setHtml(newHtml)
      onChange(newHtml)

      // Actualizar historial
      if (newHtml !== history[historyIndex]) {
        const newHistory = [...history.slice(0, historyIndex + 1), newHtml]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
    },
    [history, historyIndex, onChange],
  )

  // Función para insertar texto en la posición del cursor
  const insertTextAtCursor = useCallback(
    (text: string) => {
      const beforeCursor = html.substring(0, cursorPosition)
      const afterCursor = html.substring(cursorPosition)
      const newHtml = beforeCursor + text + afterCursor

      updateContent(newHtml)
      setCursorPosition(cursorPosition + text.length)
    },
    [html, cursorPosition, updateContent],
  )

  // Función para eliminar texto en la posición del cursor
  const deleteTextAtCursor = useCallback(
    (direction: "backward" | "forward") => {
      if (direction === "backward" && cursorPosition > 0) {
        const beforeCursor = html.substring(0, cursorPosition - 1)
        const afterCursor = html.substring(cursorPosition)
        const newHtml = beforeCursor + afterCursor

        updateContent(newHtml)
        setCursorPosition(cursorPosition - 1)
      } else if (direction === "forward" && cursorPosition < html.length) {
        const beforeCursor = html.substring(0, cursorPosition)
        const afterCursor = html.substring(cursorPosition + 1)
        const newHtml = beforeCursor + afterCursor

        updateContent(newHtml)
      }
    },
    [html, cursorPosition, updateContent],
  )

  // Función para mover el cursor
  const moveCursor = useCallback(
    (direction: "left" | "right" | "up" | "down" | "home" | "end", amount = 1) => {
      if (direction === "left") {
        setCursorPosition(Math.max(0, cursorPosition - amount))
      } else if (direction === "right") {
        setCursorPosition(Math.min(html.length, cursorPosition + amount))
      } else if (direction === "home") {
        // Encontrar el inicio de la línea actual
        const lastNewline = html.lastIndexOf("\n", cursorPosition - 1)
        setCursorPosition(lastNewline === -1 ? 0 : lastNewline + 1)
      } else if (direction === "end") {
        // Encontrar el final de la línea actual
        const nextNewline = html.indexOf("\n", cursorPosition)
        setCursorPosition(nextNewline === -1 ? html.length : nextNewline)
      } else if (direction === "up" || direction === "down") {
        // Esta es una implementación simplificada para mover arriba/abajo
        // En un editor real, necesitaríamos calcular la posición exacta basada en la geometría del texto
        const lines = html.split("\n")
        let currentLine = 0
        let currentPos = 0

        // Encontrar la línea actual y la posición dentro de esa línea
        for (let i = 0; i < lines.length; i++) {
          if (currentPos + lines[i].length >= cursorPosition) {
            currentLine = i
            break
          }
          currentPos += lines[i].length + 1 // +1 para el carácter de nueva línea
        }

        const posInLine = cursorPosition - currentPos

        if (direction === "up" && currentLine > 0) {
          // Mover a la línea anterior
          const targetLine = currentLine - 1
          const targetPos = currentPos - lines[targetLine].length - 1
          const newPos = targetPos + Math.min(posInLine, lines[targetLine].length)
          setCursorPosition(newPos)
        } else if (direction === "down" && currentLine < lines.length - 1) {
          // Mover a la línea siguiente
          const targetLine = currentLine + 1
          const targetPos = currentPos + lines[currentLine].length + 1
          const newPos = targetPos + Math.min(posInLine, lines[targetLine].length)
          setCursorPosition(newPos)
        }
      }
    },
    [html, cursorPosition],
  )

  // Función para deshacer
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const previousContent = history[historyIndex - 1]
      setHtml(previousContent)
      onChange(previousContent)
      setCursorPosition(Math.min(cursorPosition, previousContent.length))
    }
  }, [history, historyIndex, onChange, cursorPosition])

  // Función para rehacer
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const nextContent = history[historyIndex + 1]
      setHtml(nextContent)
      onChange(nextContent)
      setCursorPosition(Math.min(cursorPosition, nextContent.length))
    }
  }, [history, historyIndex, onChange, cursorPosition])

  // Manejar eventos de teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevenir el comportamiento predeterminado para todas las teclas
      e.preventDefault()

      // Manejar teclas de control
      if (e.ctrlKey) {
        if (e.key === "z") {
          undo()
          return
        } else if (e.key === "y" || (e.shiftKey && e.key === "z")) {
          redo()
          return
        }
      }

      // Manejar teclas de navegación
      switch (e.key) {
        case "ArrowLeft":
          moveCursor("left")
          break
        case "ArrowRight":
          moveCursor("right")
          break
        case "ArrowUp":
          moveCursor("up")
          break
        case "ArrowDown":
          moveCursor("down")
          break
        case "Home":
          moveCursor("home")
          break
        case "End":
          moveCursor("end")
          break
        case "Backspace":
          deleteTextAtCursor("backward")
          break
        case "Delete":
          deleteTextAtCursor("forward")
          break
        case "Enter":
          insertTextAtCursor("\n")
          break
        case "Tab":
          insertTextAtCursor("    ") // 4 espacios para simular una tabulación
          break
        default:
          // Insertar caracteres normales
          if (e.key.length === 1) {
            insertTextAtCursor(e.key)
          }
          break
      }
    },
    [moveCursor, deleteTextAtCursor, insertTextAtCursor, undo, redo],
  )

  // Manejar eventos de pegado
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData("text/plain")
      insertTextAtCursor(text)
    },
    [insertTextAtCursor],
  )

  // Manejar clics para posicionar el cursor
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editorRef.current) return

      // Obtener la posición del clic relativa al editor
      const rect = editorRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Aquí necesitaríamos una función para convertir coordenadas (x, y) a una posición en el texto
      // Esta es una implementación simplificada que solo funciona para texto plano
      // En un editor real, necesitaríamos una implementación más sofisticada

      // Por ahora, simplemente movemos el cursor al final
      setCursorPosition(html.length)

      // Enfocar el textarea oculto para capturar eventos de teclado
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    },
    [html],
  )

  // Efecto para el parpadeo del cursor
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFocused) {
        setCursorVisible((prev) => !prev)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isFocused])

  // Efecto para posicionar visualmente el cursor
  useEffect(() => {
    if (!editorRef.current || !cursorRef.current) return

    // Crear un elemento temporal para medir la posición del cursor
    const temp = document.createElement("span")
    temp.innerHTML = html.substring(0, cursorPosition)
    temp.style.whiteSpace = "pre-wrap"
    temp.style.position = "absolute"
    temp.style.visibility = "hidden"

    editorRef.current.appendChild(temp)

    // Obtener la posición del cursor
    const rect = temp.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()

    // Posicionar el cursor visual
    cursorRef.current.style.left = `${rect.width}px`
    cursorRef.current.style.top = `${rect.height - editorRect.top}px`

    // Limpiar
    editorRef.current.removeChild(temp)
  }, [html, cursorPosition])

  // Renderizar el contenido con formato HTML
  const renderContent = () => {
    if (!html) {
      return <div className="text-gray-400">{placeholder}</div>
    }

    // Dividir el contenido en la posición del cursor
    const beforeCursor = html.substring(0, cursorPosition)
    const afterCursor = html.substring(cursorPosition)

    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: beforeCursor }} />
        <div
          ref={cursorRef}
          className={`absolute w-0.5 h-5 bg-black ${cursorVisible && isFocused ? "opacity-100" : "opacity-0"}`}
          style={{ transition: "opacity 0.1s" }}
        ></div>
        <span dangerouslySetInnerHTML={{ __html: afterCursor }} />
      </>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden w-full">
      {/* Barra de herramientas básica */}
      <div className="bg-gray-50 border-b p-2 flex gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={undo} disabled={historyIndex <= 0}>
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
            className="lucide lucide-undo h-4 w-4"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={redo}
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
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </Button>
      </div>

      {/* Editor con cursor personalizado */}
      <div className="relative p-4 min-h-[200px] outline-none" style={{ minHeight }} onClick={handleClick}>
        {/* Textarea oculto para capturar eventos de teclado */}
        <textarea
          ref={textareaRef}
          className="absolute opacity-0 h-0 w-0 overflow-hidden"
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value=""
          onChange={() => {}} // Necesario para React, pero no hacemos nada aquí
        />

        {/* Contenido visible con cursor personalizado */}
        <div ref={editorRef} className="whitespace-pre-wrap" style={{ direction: "ltr", textAlign: "left" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
