"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface CanvasBasedEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  reportId?: string
  sectionId?: string
}

export const CanvasBasedEditor: React.FC<CanvasBasedEditorProps> = ({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  className = "",
  reportId,
  sectionId,
}) => {
  // Estado para el contenido del editor
  const [content, setContent] = useState(initialContent || "")
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  // Referencias a los elementos DOM
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Constantes para el renderizado
  const fontSize = 16
  const lineHeight = 1.5
  const padding = 10

  // Función para dibujar el texto en el canvas
  const drawText = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurar el estilo del texto
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = "#000000"

    // Dibujar el texto
    const lines = calculateLines(content || placeholder)
    let y = padding + fontSize

    // Si no hay contenido, mostrar el placeholder
    if (!content && placeholder) {
      ctx.fillStyle = "#999999"
      for (const line of lines) {
        ctx.fillText(line, padding, y)
        y += fontSize * lineHeight
      }
    } else {
      // Dibujar el contenido real
      for (const line of lines) {
        ctx.fillText(line, padding, y)
        y += fontSize * lineHeight
      }
    }

    // Dibujar el cursor si está enfocado
    if (isFocused && showCursor) {
      const cursorX = calculateCursorX(cursorPosition)
      const cursorY = calculateCursorY(cursorPosition)
      ctx.fillStyle = "#000000"
      ctx.fillRect(cursorX, cursorY - fontSize, 2, fontSize)
    }
  }

  // Calcular las líneas de texto basadas en el ancho del canvas
  const calculateLines = (text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return [text]

    const ctx = canvas.getContext("2d")
    if (!ctx) return [text]

    const maxWidth = canvas.width - padding * 2
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines.length > 0 ? lines : [""]
  }

  // Calcular la posición X del cursor
  const calculateCursorX = (position: number) => {
    const canvas = canvasRef.current
    if (!canvas) return padding

    const ctx = canvas.getContext("2d")
    if (!ctx) return padding

    const textBeforeCursor = content.substring(0, position)
    const lines = calculateLines(content)
    let currentPos = 0
    let lineIndex = 0

    for (const line of lines) {
      if (currentPos + line.length >= position) {
        const partialLine = textBeforeCursor.substring(currentPos)
        return padding + ctx.measureText(partialLine).width
      }
      currentPos += line.length + 1 // +1 for the space
      lineIndex++
    }

    return padding
  }

  // Calcular la posición Y del cursor
  const calculateCursorY = (position: number) => {
    const lines = calculateLines(content)
    let currentPos = 0
    let lineIndex = 0

    for (const line of lines) {
      if (currentPos + line.length >= position) {
        break
      }
      currentPos += line.length + 1 // +1 for the space
      lineIndex++
    }

    return padding + fontSize + lineIndex * fontSize * lineHeight
  }

  // Manejar cambios en el textarea oculto
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setCursorPosition(e.target.selectionStart || 0)

    if (onChange) {
      onChange(newContent)
    }
  }

  // Manejar clics en el canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Enfocar el textarea oculto
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus()
    }

    // Calcular la posición del cursor basada en el clic
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Encontrar la línea correspondiente
    const lines = calculateLines(content)
    const lineIndex = Math.floor((y - padding) / (fontSize * lineHeight))

    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex]
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Encontrar la posición del carácter más cercana al clic
      let bestPosition = 0
      let bestDistance = Number.MAX_VALUE

      for (let i = 0; i <= line.length; i++) {
        const textWidth = ctx.measureText(line.substring(0, i)).width
        const distance = Math.abs(padding + textWidth - x)

        if (distance < bestDistance) {
          bestDistance = distance
          bestPosition = i
        }
      }

      // Calcular la posición absoluta en el texto completo
      let absolutePosition = 0
      for (let i = 0; i < lineIndex; i++) {
        absolutePosition += lines[i].length + 1 // +1 for the space
      }
      absolutePosition += bestPosition

      // Actualizar la posición del cursor
      setCursorPosition(absolutePosition)

      // Actualizar la selección en el textarea oculto
      if (hiddenInputRef.current) {
        hiddenInputRef.current.setSelectionRange(absolutePosition, absolutePosition)
      }
    }
  }

  // Manejar el redimensionamiento del canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.clientWidth
    canvas.height = Math.max(200, calculateLines(content || placeholder).length * fontSize * lineHeight + padding * 2)

    drawText()
  }

  // Efecto para inicializar y redimensionar el canvas
  useEffect(() => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Efecto para redibujar el texto cuando cambia el contenido o el estado del cursor
  useEffect(() => {
    drawText()
  }, [content, cursorPosition, isFocused, showCursor])

  // Efecto para parpadear el cursor
  useEffect(() => {
    if (!isFocused) return

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [isFocused])

  // Efecto para inicializar con el contenido inicial
  useEffect(() => {
    if (initialContent && initialContent !== content) {
      setContent(initialContent)
    }
  }, [initialContent])

  return (
    <div ref={containerRef} className={`relative border rounded-md ${className}`} style={{ minHeight: "200px" }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={() => setIsFocused(true)}
        className="w-full h-full cursor-text"
      />
      <textarea
        ref={hiddenInputRef}
        value={content}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement
          setCursorPosition(target.selectionStart || 0)
        }}
        className="absolute opacity-0 top-0 left-0 w-full h-full resize-none"
        style={{
          caretColor: "transparent",
          direction: "ltr",
          unicodeBidi: "isolate",
        }}
        dir="ltr"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // Forzar LTR y limpiar cualquier carácter de control
            const cleanedText = content.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "") // Eliminar caracteres de control bidireccionales

            setContent(cleanedText)
            if (onChange) {
              onChange(cleanedText)
            }

            // Enfocar el textarea
            if (hiddenInputRef.current) {
              hiddenInputRef.current.focus()
            }
          }}
        >
          Forzar dirección izquierda a derecha
        </Button>
      </div>
    </div>
  )
}
