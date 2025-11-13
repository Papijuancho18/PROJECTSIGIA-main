"use client"

import { useEffect, useState, useRef, type RefObject } from "react"
import { useCollaboration } from "@/contexts/collaboration-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserCursorsProps {
  containerRef: RefObject<HTMLDivElement>
}

interface CursorPosition {
  top: number
  left: number
  height: number
}

export function UserCursors({ containerRef }: UserCursorsProps) {
  const { getActiveUsers, currentUser } = useCollaboration()
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
  const [selections, setSelections] = useState<Record<string, { start: CursorPosition; end: CursorPosition }>>({})
  const animationFrameRef = useRef<number | null>(null)

  // Calcular posiciones de cursores
  useEffect(() => {
    if (!containerRef.current) return

    const updateCursorPositions = () => {
      const container = containerRef.current
      if (!container) return

      const activeUsers = getActiveUsers().filter((user) => user.id !== currentUser?.id && user.cursor)
      const textareas = container.querySelectorAll("textarea")
      const textarea = textareas[0]

      if (!textarea) return

      // Obtener dimensiones y posición del textarea
      const textareaRect = textarea.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const lineHeight = Number.parseInt(window.getComputedStyle(textarea).lineHeight) || 20
      const fontSize = Number.parseInt(window.getComputedStyle(textarea).fontSize) || 16

      // Calcular posiciones para cada usuario
      const newCursors: Record<string, CursorPosition> = {}
      const newSelections: Record<string, { start: CursorPosition; end: CursorPosition }> = {}

      activeUsers.forEach((user) => {
        if (!user.cursor) return

        // Crear un elemento temporal para calcular la posición del cursor
        const tempDiv = document.createElement("div")
        tempDiv.style.position = "absolute"
        tempDiv.style.visibility = "hidden"
        tempDiv.style.whiteSpace = "pre-wrap"
        tempDiv.style.wordWrap = "break-word"
        tempDiv.style.width = `${textarea.clientWidth}px`
        tempDiv.style.font = window.getComputedStyle(textarea).font

        // Obtener el texto hasta la posición del cursor
        const textUntilCursor = textarea.value.substring(0, user.cursor.position)
        tempDiv.textContent = textUntilCursor

        document.body.appendChild(tempDiv)

        // Calcular posición
        const lines = textUntilCursor.split("\n")
        const lastLine = lines[lines.length - 1]

        // Altura basada en el número de líneas
        const top = (lines.length - 1) * lineHeight

        // Posición horizontal basada en el ancho del último carácter
        tempDiv.textContent = lastLine
        const left = tempDiv.clientWidth

        document.body.removeChild(tempDiv)

        // Guardar posición del cursor
        newCursors[user.id] = {
          top: top,
          left: left,
          height: lineHeight,
        }

        // Si hay selección, calcular también esas posiciones
        if (user.cursor.selection) {
          const { start, end } = user.cursor.selection

          // Calcular posición de inicio
          tempDiv.textContent = textarea.value.substring(0, start)
          document.body.appendChild(tempDiv)
          const startLines = tempDiv.textContent.split("\n")
          const startTop = (startLines.length - 1) * lineHeight
          tempDiv.textContent = startLines[startLines.length - 1]
          const startLeft = tempDiv.clientWidth
          document.body.removeChild(tempDiv)

          // Calcular posición de fin
          tempDiv.textContent = textarea.value.substring(0, end)
          document.body.appendChild(tempDiv)
          const endLines = tempDiv.textContent.split("\n")
          const endTop = (endLines.length - 1) * lineHeight
          tempDiv.textContent = endLines[endLines.length - 1]
          const endLeft = tempDiv.clientWidth
          document.body.removeChild(tempDiv)

          // Guardar posiciones de selección
          newSelections[user.id] = {
            start: { top: startTop, left: startLeft, height: lineHeight },
            end: { top: endTop, left: endLeft, height: lineHeight },
          }
        }
      })

      setCursors(newCursors)
      setSelections(newSelections)
    }

    // Actualizar posiciones periódicamente
    const updatePositions = () => {
      updateCursorPositions()
      animationFrameRef.current = requestAnimationFrame(updatePositions)
    }

    updatePositions()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [containerRef, getActiveUsers, currentUser])

  // Renderizar cursores y selecciones
  return (
    <>
      {/* Cursores de otros usuarios */}
      {Object.entries(cursors).map(([userId, position]) => {
        const user = getActiveUsers().find((u) => u.id === userId)
        if (!user) return null

        return (
          <TooltipProvider key={userId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute w-[2px] animate-pulse"
                  style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    height: `${position.height}px`,
                    backgroundColor: user.color,
                    zIndex: 10,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 transform -translate-y-full px-1 py-0.5 text-xs text-white rounded"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.split(" ")[0]}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name} está editando</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {/* Selecciones de otros usuarios */}
      {Object.entries(selections).map(([userId, selection]) => {
        const user = getActiveUsers().find((u) => u.id === userId)
        if (!user) return null

        // Si la selección está en la misma línea
        if (selection.start.top === selection.end.top) {
          return (
            <div
              key={`selection-${userId}`}
              className="absolute opacity-30"
              style={{
                top: `${selection.start.top}px`,
                left: `${selection.start.left}px`,
                height: `${selection.start.height}px`,
                width: `${selection.end.left - selection.start.left}px`,
                backgroundColor: user.color,
                zIndex: 5,
              }}
            />
          )
        }

        // Si la selección abarca múltiples líneas
        return (
          <div key={`selection-${userId}`}>
            {/* Primera línea */}
            <div
              className="absolute opacity-30"
              style={{
                top: `${selection.start.top}px`,
                left: `${selection.start.left}px`,
                height: `${selection.start.height}px`,
                right: 0,
                backgroundColor: user.color,
                zIndex: 5,
              }}
            />

            {/* Líneas intermedias (si hay más de una línea de diferencia) */}
            {selection.end.top - selection.start.top > selection.start.height && (
              <div
                className="absolute opacity-30"
                style={{
                  top: `${selection.start.top + selection.start.height}px`,
                  left: 0,
                  height: `${selection.end.top - selection.start.top - selection.start.height}px`,
                  right: 0,
                  backgroundColor: user.color,
                  zIndex: 5,
                }}
              />
            )}

            {/* Última línea */}
            <div
              className="absolute opacity-30"
              style={{
                top: `${selection.end.top}px`,
                left: 0,
                height: `${selection.end.height}px`,
                width: `${selection.end.left}px`,
                backgroundColor: user.color,
                zIndex: 5,
              }}
            />
          </div>
        )
      })}
    </>
  )
}
