"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { WordLikeEditor } from "@/components/word-like-editor"
import { CollaborationToolbar } from "@/components/collaboration-toolbar"
import { useCollaboration } from "@/contexts/collaboration-context"
import { UserCursors } from "@/components/user-cursors"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface CollaborativeEditorProps {
  documentId: string
  documentTitle?: string
  initialContent?: string
  onChange?: (content: string) => void
  onSave?: () => void
  readOnly?: boolean
  minHeight?: string
  reportId?: string
  sectionId?: string
}

export function CollaborativeEditor({
  documentId,
  documentTitle,
  initialContent = "",
  onChange,
  onSave,
  readOnly = false,
  minHeight = "300px",
  reportId,
  sectionId,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingChartId, setEditingChartId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const {
    isConnected,
    currentUser,
    broadcastChange,
    lockElement,
    unlockElement,
    updateCursorPosition,
    isElementLocked,
    canEditElement,
    getElementLock,
  } = useCollaboration()

  // Manejar cambios en el contenido
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      onChange?.(newContent)

      // Si estamos en modo colaborativo, enviar el cambio
      if (isConnected && currentUser) {
        broadcastChange({
          type: "replace",
          path: documentId,
          content: newContent,
        })
      }
    },
    [isConnected, currentUser, documentId, onChange, broadcastChange],
  )

  // Manejar edición de tabla
  const handleEditTable = useCallback(
    (tableId: string) => {
      // Verificar si podemos editar esta tabla
      if (isElementLocked(tableId) && !canEditElement(tableId)) {
        const lockOwner = getElementLock(tableId)
        alert(`Esta tabla está siendo editada por ${lockOwner?.name || "otro usuario"}`)
        return
      }

      // Intentar bloquear la tabla
      if (lockElement(tableId)) {
        setEditingTableId(tableId)
      }
    },
    [isElementLocked, canEditElement, getElementLock, lockElement],
  )

  // Manejar edición de gráfico
  const handleEditChart = useCallback(
    (chartId: string) => {
      // Verificar si podemos editar este gráfico
      if (isElementLocked(chartId) && !canEditElement(chartId)) {
        const lockOwner = getElementLock(chartId)
        alert(`Este gráfico está siendo editado por ${lockOwner?.name || "otro usuario"}`)
        return
      }

      // Intentar bloquear el gráfico
      if (lockElement(chartId)) {
        setEditingChartId(chartId)
      }
    },
    [isElementLocked, canEditElement, getElementLock, lockElement],
  )

  // Manejar actualización de tabla
  const handleUpdateTable = useCallback(
    (tableId: string, newContent: string) => {
      // Actualizar el contenido
      const updatedContent = content.replace(
        /\|(.+)\|[\r\n]+\|([\s-:|]+)\|[\r\n]+((?:\|.+\|[\r\n]+)+)/g,
        (match, p1, p2, p3, offset, string) => {
          // Solo reemplazar la tabla con el ID correcto
          if (match.includes(tableId)) {
            return newContent
          }
          return match
        },
      )

      // Actualizar estado local
      setContent(updatedContent)
      onChange?.(updatedContent)

      // Enviar cambio a otros usuarios
      if (isConnected && currentUser) {
        broadcastChange({
          type: "table",
          path: tableId,
          content: newContent,
        })
      }

      // Desbloquear la tabla
      unlockElement(tableId)
      setEditingTableId(null)
    },
    [content, onChange, isConnected, currentUser, broadcastChange, unlockElement],
  )

  // Manejar actualización de gráfico
  const handleUpdateChart = useCallback(
    (chartId: string, newContent: string) => {
      // Actualizar el contenido
      const chartRegex = new RegExp(`\\[GRÁFICO:${chartId}:[^:]+:[^:]+\\]`, "g")
      const updatedContent = content.replace(chartRegex, newContent.trim())

      // Actualizar estado local
      setContent(updatedContent)
      onChange?.(updatedContent)

      // Enviar cambio a otros usuarios
      if (isConnected && currentUser) {
        broadcastChange({
          type: "chart",
          path: chartId,
          content: newContent,
        })
      }

      // Desbloquear el gráfico
      unlockElement(chartId)
      setEditingChartId(null)
    },
    [content, onChange, isConnected, currentUser, broadcastChange, unlockElement],
  )

  // Manejar cambios en la posición del cursor
  const handleCursorChange = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (isConnected && currentUser) {
        updateCursorPosition(position, selection)
      }
    },
    [isConnected, currentUser, updateCursorPosition],
  )

  // Limpiar bloqueos al desmontar
  useEffect(() => {
    return () => {
      if (editingTableId) {
        unlockElement(editingTableId)
      }
      if (editingChartId) {
        unlockElement(editingChartId)
      }
    }
  }, [editingTableId, editingChartId, unlockElement])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Barra de colaboración */}
      <CollaborationToolbar documentId={documentId} documentTitle={documentTitle} onSave={onSave} />

      {/* Alertas de colaboración */}
      {isConnected && (
        <div className="p-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center text-sm text-blue-700">
            <span className="font-medium mr-1">Modo colaborativo:</span>
            <span>Estás editando como {currentUser?.name}</span>
          </div>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentUser?.color || "#2196F3" }}></div>
        </div>
      )}

      {/* Alertas de elementos bloqueados */}
      {(editingTableId || editingChartId) && (
        <Alert variant="default" className="m-2 bg-yellow-50 border-yellow-200 text-yellow-800">
          <Lock className="h-4 w-4" />
          <AlertTitle>Elemento bloqueado para edición</AlertTitle>
          <AlertDescription>
            Estás editando un {editingTableId ? "tabla" : "gráfico"}. Otros usuarios no podrán modificarlo hasta que
            termines.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor con cursores de usuarios */}
      <div className="relative" ref={editorRef}>
        <WordLikeEditor
          initialContent={content}
          onChange={handleContentChange}
          onEditTable={handleEditTable}
          onEditChart={handleEditChart}
          onUpdateTable={handleUpdateTable}
          onUpdateChart={handleUpdateChart}
          onCursorChange={handleCursorChange}
          placeholder="Escriba aquí..."
          minHeight={minHeight}
          reportId={reportId}
          sectionId={sectionId}
          readOnly={readOnly}
          collaborative={isConnected}
        />

        {/* Cursores de otros usuarios */}
        {isConnected && <UserCursors containerRef={editorRef} />}
      </div>
    </div>
  )
}
