"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Undo } from "lucide-react"

interface UltraLTREditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function UltraLTREditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: UltraLTREditorProps) {
  // Estado para el texto como array de caracteres
  const [characters, setCharacters] = useState<string[]>(initialContent.split(""))

  // Estado para la posición del cursor
  const [cursorPosition, setCursorPosition] = useState(characters.length)

  // Estado para el historial
  const [history, setHistory] = useState<string[][]>([characters])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Referencias
  const editorRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null)

  // Estado para el foco
  const [isFocused, setIsFocused] = useState(false)

  // Función para actualizar el contenido y notificar al componente padre
  const updateContent = useCallback(() => {
    const content = characters.join("")
    onChange(content)
  }, [characters, onChange])

  // Función para actualizar los caracteres y el historial
  const updateCharacters = useCallback(
    (newChars: string[], newCursorPos: number) => {
      setCharacters(newChars)
      setCursorPosition(newCursorPos)

      // Actualizar el historial
      const newHistory = [...history.slice(0, historyIndex + 1), newChars]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)

      // Notificar al componente padre
      const content = newChars.join("")
      onChange(content)
    },
    [history, historyIndex, onChange],
  )

  // Función para manejar la entrada de texto
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const input = e.currentTarget.value

      if (input && input.length > 0) {
        // Obtener el último carácter ingresado
        const char = input[input.length - 1]

        // Insertar el carácter en la posición del cursor
        const newChars = [...characters.slice(0, cursorPosition), char, ...characters.slice(cursorPosition)]

        // Actualizar los caracteres y el cursor
        updateCharacters(newChars, cursorPosition + 1)

        // Limpiar el input oculto
        e.currentTarget.value = ""
      }
    },
    [characters, cursorPosition, updateCharacters],
  )

  // Función para manejar las teclas especiales
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // No procesar teclas modificadoras solas
      if (e.key === "Control" || e.key === "Shift" || e.key === "Alt" || e.key === "Meta") {
        return
      }

      // Manejar teclas especiales
      if (e.key === "Backspace") {
        e.preventDefault()
        if (cursorPosition > 0) {
          const newChars = [...characters.slice(0, cursorPosition - 1), ...characters.slice(cursorPosition)]
          updateCharacters(newChars, cursorPosition - 1)
        }
      } else if (e.key === "Delete") {
        e.preventDefault()
        if (cursorPosition < characters.length) {
          const newChars = [...characters.slice(0, cursorPosition), ...characters.slice(cursorPosition + 1)]
          updateCharacters(newChars, cursorPosition)
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        if (cursorPosition > 0) {
          setCursorPosition(cursorPosition - 1)
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        if (cursorPosition < characters.length) {
          setCursorPosition(cursorPosition + 1)
        }
      } else if (e.key === "Home") {
        e.preventDefault()
        setCursorPosition(0)
      } else if (e.key === "End") {
        e.preventDefault()
        setCursorPosition(characters.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        const newChars = [...characters.slice(0, cursorPosition), "\n", ...characters.slice(cursorPosition)]
        updateCharacters(newChars, cursorPosition + 1)
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        // Deshacer
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setCharacters(history[newIndex])
          setHistoryIndex(newIndex)
          setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
          onChange(history[newIndex].join(""))
        }
      } else if (
        (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault()
        // Rehacer
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          setCharacters(history[newIndex])
          setHistoryIndex(newIndex)
          setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
          onChange(history[newIndex].join(""))
        }
      }
      // Para otras teclas, dejamos que el evento input las maneje
    },
    [characters, cursorPosition, history, historyIndex, updateCharacters, onChange],
  )

  // Función para manejar clics en el editor
  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      // Enfocar el input oculto
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus()
      }

      // Calcular la posición del cursor basada en el clic
      if (editorRef.current) {
        // Esta es una implementación simplificada
        // En un editor real, necesitaríamos calcular la posición exacta
        const rect = editorRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left

        // Encontrar el carácter más cercano al clic
        const charElements = editorRef.current.querySelectorAll(".char")
        let closestIndex = characters.length
        let minDistance = Number.POSITIVE_INFINITY

        charElements.forEach((el, index) => {
          const charRect = el.getBoundingClientRect()
          const charCenter = charRect.left + charRect.width / 2 - rect.left
          const distance = Math.abs(clickX - charCenter)

          if (distance < minDistance) {
            minDistance = distance
            closestIndex = index

            // Si el clic está a la derecha del centro del carácter, incrementar el índice
            if (clickX > charCenter) {
              closestIndex += 1
            }
          }
        })

        setCursorPosition(closestIndex)
      }

      setIsFocused(true)
    },
    [characters.length],
  )

  // Efecto para enfocar el input oculto cuando se monta el componente
  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus()
    }
  }, [])

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
                      setCharacters(history[newIndex])
                      setHistoryIndex(newIndex)
                      setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
                      onChange(history[newIndex].join(""))
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
                      setCharacters(history[newIndex])
                      setHistoryIndex(newIndex)
                      setCursorPosition(Math.min(cursorPosition, history[newIndex].length))
                      onChange(history[newIndex].join(""))
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
        className="relative p-4 outline-none w-full bg-white"
        style={{
          minHeight,
          cursor: "text",
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "isolate",
        }}
        onClick={handleEditorClick}
        ref={editorRef}
      >
        {/* Input oculto para capturar la entrada de texto */}
        <textarea
          ref={hiddenInputRef}
          className="absolute opacity-0 h-0 w-0 overflow-hidden"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          aria-hidden="true"
        />

        {/* Renderizar cada carácter individualmente */}
        <div className="whitespace-pre-wrap">
          {characters.length === 0 && !isFocused ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <>
              {characters.map((char, index) => (
                <React.Fragment key={index}>
                  {/* Renderizar el cursor antes del carácter si es necesario */}
                  {index === cursorPosition && isFocused && (
                    <span
                      className="inline-block w-[2px] h-[1.2em] bg-black animate-blink align-middle"
                      style={{ animation: "blink 1s step-end infinite" }}
                    />
                  )}

                  {/* Renderizar el carácter con estilos forzados LTR */}
                  <span
                    className="char"
                    style={{
                      direction: "ltr",
                      unicodeBidi: "isolate",
                      textAlign: "left",
                      display: char === "\n" ? "block" : "inline",
                    }}
                  >
                    {char === "\n" ? <br /> : char}
                  </span>
                </React.Fragment>
              ))}

              {/* Renderizar el cursor al final si es necesario */}
              {cursorPosition === characters.length && isFocused && (
                <span
                  className="inline-block w-[2px] h-[1.2em] bg-black animate-blink align-middle"
                  style={{ animation: "blink 1s step-end infinite" }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Estilos para la animación del cursor */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
