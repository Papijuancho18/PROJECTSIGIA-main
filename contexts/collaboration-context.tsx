"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useGlobalElements } from "./global-elements-context"
import { nanoid } from "nanoid"

// Tipos para la colaboración
export interface User {
  id: string
  name: string
  color: string
  avatar?: string
  isActive: boolean
  lastActive: Date
  cursor?: {
    position: number
    selection?: {
      start: number
      end: number
    }
  }
}

export interface Change {
  id: string
  userId: string
  timestamp: Date
  type: "insert" | "delete" | "replace" | "table" | "chart"
  path: string // Puede ser un ID de documento, tabla o gráfico
  content: any
  position?: number
  length?: number
}

export interface CollaborationState {
  documentId?: string
  users: Record<string, User>
  changes: Change[]
  activeUsers: string[]
  lockedElements: Record<string, string> // elementId -> userId
}

interface CollaborationContextType {
  state: CollaborationState
  currentUser: User | null
  isConnected: boolean
  connectToDocument: (documentId: string, userName: string) => void
  disconnectFromDocument: () => void
  broadcastChange: (change: Omit<Change, "id" | "userId" | "timestamp">) => void
  lockElement: (elementId: string) => boolean
  unlockElement: (elementId: string) => void
  updateCursorPosition: (position: number, selection?: { start: number; end: number }) => void
  getActiveUsers: () => User[]
  getElementLock: (elementId: string) => User | null
  isElementLocked: (elementId: string) => boolean
  canEditElement: (elementId: string) => boolean
}

// Colores para usuarios
const USER_COLORS = [
  "#F44336", // Rojo
  "#2196F3", // Azul
  "#4CAF50", // Verde
  "#FF9800", // Naranja
  "#9C27B0", // Púrpura
  "#00BCD4", // Cian
  "#FFEB3B", // Amarillo
  "#795548", // Marrón
  "#607D8B", // Gris azulado
  "#E91E63", // Rosa
]

// Crear el contexto
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

// Proveedor del contexto
export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CollaborationState>({
    users: {},
    changes: [],
    activeUsers: [],
    lockedElements: {},
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { registerElement, updateElement } = useGlobalElements()

  // Simular conexión WebSocket (en una implementación real, esto se conectaría a un servidor)
  const connectToDocument = useCallback(
    (documentId: string, userName: string) => {
      if (isConnected) return

      // Generar ID único para el usuario
      const userId = nanoid()

      // Asignar un color aleatorio
      const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]

      // Crear objeto de usuario
      const user: User = {
        id: userId,
        name: userName,
        color: userColor,
        isActive: true,
        lastActive: new Date(),
      }

      // En una implementación real, aquí se establecería la conexión WebSocket
      console.log(`Conectando al documento ${documentId} como ${userName} (${userId})`)

      // Simular conexión exitosa
      setIsConnected(true)
      setCurrentUser(user)

      // Actualizar estado con el nuevo usuario
      setState((prev) => ({
        ...prev,
        documentId,
        users: {
          ...prev.users,
          [userId]: user,
        },
        activeUsers: [...prev.activeUsers, userId],
      }))

      // Simular recepción de usuarios existentes (en una implementación real, esto vendría del servidor)
      simulateExistingUsers(documentId, userId)

      // Configurar intervalo para mantener la conexión activa
      const keepAliveInterval = setInterval(() => {
        if (currentUser) {
          setState((prev) => {
            const updatedUsers = { ...prev.users }
            if (updatedUsers[userId]) {
              updatedUsers[userId] = {
                ...updatedUsers[userId],
                lastActive: new Date(),
              }
            }
            return {
              ...prev,
              users: updatedUsers,
            }
          })
        }
      }, 30000) // Cada 30 segundos

      // Limpiar al desconectar
      return () => {
        clearInterval(keepAliveInterval)
        disconnectFromDocument()
      }
    },
    [isConnected, currentUser],
  )

  // Simular usuarios existentes (solo para demostración)
  const simulateExistingUsers = (documentId: string, currentUserId: string) => {
    // Crear algunos usuarios simulados
    const simulatedUsers: Record<string, User> = {
      user1: {
        id: "user1",
        name: "Ana García",
        color: "#2196F3",
        avatar: "/diverse-avatars.png",
        isActive: true,
        lastActive: new Date(),
        cursor: { position: 120 },
      },
      user2: {
        id: "user2",
        name: "Carlos Rodríguez",
        color: "#4CAF50",
        avatar: "/diverse-avatars.png",
        isActive: true,
        lastActive: new Date(),
        cursor: { position: 350 },
      },
    }

    // Actualizar estado con usuarios simulados
    setState((prev) => ({
      ...prev,
      users: {
        ...prev.users,
        ...simulatedUsers,
      },
      activeUsers: [...prev.activeUsers, "user1", "user2"],
    }))
  }

  // Desconectar del documento
  const disconnectFromDocument = useCallback(() => {
    if (!isConnected || !currentUser) return

    console.log(`Desconectando del documento ${state.documentId}`)

    // Actualizar estado para marcar al usuario como inactivo
    setState((prev) => {
      const updatedUsers = { ...prev.users }
      if (updatedUsers[currentUser.id]) {
        updatedUsers[currentUser.id] = {
          ...updatedUsers[currentUser.id],
          isActive: false,
        }
      }

      // Liberar todos los bloqueos del usuario
      const updatedLocks = { ...prev.lockedElements }
      Object.entries(updatedLocks).forEach(([elementId, userId]) => {
        if (userId === currentUser.id) {
          delete updatedLocks[elementId]
        }
      })

      return {
        ...prev,
        users: updatedUsers,
        activeUsers: prev.activeUsers.filter((id) => id !== currentUser.id),
        lockedElements: updatedLocks,
      }
    })

    setIsConnected(false)
    setCurrentUser(null)
  }, [isConnected, currentUser, state.documentId])

  // Enviar cambio a todos los usuarios
  const broadcastChange = useCallback(
    (change: Omit<Change, "id" | "userId" | "timestamp">) => {
      if (!isConnected || !currentUser) return

      // Crear objeto de cambio completo
      const fullChange: Change = {
        ...change,
        id: nanoid(),
        userId: currentUser.id,
        timestamp: new Date(),
      }

      console.log("Enviando cambio:", fullChange)

      // En una implementación real, aquí se enviaría el cambio a través de WebSocket
      // socket.send(JSON.stringify({ type: 'change', data: fullChange }))

      // Actualizar estado local con el nuevo cambio
      setState((prev) => ({
        ...prev,
        changes: [...prev.changes, fullChange],
      }))

      // Si el cambio es para una tabla o gráfico, actualizar el elemento global
      if (change.type === "table" || change.type === "chart") {
        updateElement({
          id: change.path,
          type: change.type,
          content: change.content,
          reportId: state.documentId,
        })
      }
    },
    [isConnected, currentUser, state.documentId, updateElement],
  )

  // Bloquear un elemento para edición
  const lockElement = useCallback(
    (elementId: string) => {
      if (!isConnected || !currentUser) return false

      // Verificar si el elemento ya está bloqueado
      if (state.lockedElements[elementId] && state.lockedElements[elementId] !== currentUser.id) {
        console.log(`No se puede bloquear el elemento ${elementId}, ya está bloqueado por otro usuario`)
        return false
      }

      console.log(`Bloqueando elemento ${elementId} para el usuario ${currentUser.id}`)

      // Actualizar estado con el nuevo bloqueo
      setState((prev) => ({
        ...prev,
        lockedElements: {
          ...prev.lockedElements,
          [elementId]: currentUser.id,
        },
      }))

      // En una implementación real, aquí se enviaría el bloqueo a través de WebSocket
      // socket.send(JSON.stringify({ type: 'lock', data: { elementId, userId: currentUser.id } }))

      return true
    },
    [isConnected, currentUser, state.lockedElements],
  )

  // Desbloquear un elemento
  const unlockElement = useCallback(
    (elementId: string) => {
      if (!isConnected || !currentUser) return

      // Verificar si el usuario actual tiene el bloqueo
      if (state.lockedElements[elementId] !== currentUser.id) {
        console.log(`No se puede desbloquear el elemento ${elementId}, no está bloqueado por el usuario actual`)
        return
      }

      console.log(`Desbloqueando elemento ${elementId}`)

      // Actualizar estado para eliminar el bloqueo
      setState((prev) => {
        const updatedLocks = { ...prev.lockedElements }
        delete updatedLocks[elementId]
        return {
          ...prev,
          lockedElements: updatedLocks,
        }
      })

      // En una implementación real, aquí se enviaría el desbloqueo a través de WebSocket
      // socket.send(JSON.stringify({ type: 'unlock', data: { elementId } }))
    },
    [isConnected, currentUser, state.lockedElements],
  )

  // Actualizar posición del cursor
  const updateCursorPosition = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (!isConnected || !currentUser) return

      // Actualizar estado con la nueva posición del cursor
      setState((prev) => {
        const updatedUsers = { ...prev.users }
        if (updatedUsers[currentUser.id]) {
          updatedUsers[currentUser.id] = {
            ...updatedUsers[currentUser.id],
            cursor: { position, selection },
          }
        }
        return {
          ...prev,
          users: updatedUsers,
        }
      })

      // En una implementación real, aquí se enviaría la posición del cursor a través de WebSocket
      // socket.send(JSON.stringify({ type: 'cursor', data: { position, selection } }))
    },
    [isConnected, currentUser],
  )

  // Obtener usuarios activos
  const getActiveUsers = useCallback(() => {
    return state.activeUsers.map((id) => state.users[id]).filter(Boolean)
  }, [state.activeUsers, state.users])

  // Obtener información del usuario que tiene bloqueado un elemento
  const getElementLock = useCallback(
    (elementId: string) => {
      const userId = state.lockedElements[elementId]
      return userId ? state.users[userId] || null : null
    },
    [state.lockedElements, state.users],
  )

  // Verificar si un elemento está bloqueado
  const isElementLocked = useCallback(
    (elementId: string) => {
      return !!state.lockedElements[elementId]
    },
    [state.lockedElements],
  )

  // Verificar si el usuario actual puede editar un elemento
  const canEditElement = useCallback(
    (elementId: string) => {
      if (!isConnected || !currentUser) return false

      // Si el elemento no está bloqueado, se puede editar
      if (!state.lockedElements[elementId]) return true

      // Si está bloqueado por el usuario actual, se puede editar
      return state.lockedElements[elementId] === currentUser.id
    },
    [isConnected, currentUser, state.lockedElements],
  )

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectFromDocument()
      }
    }
  }, [isConnected, disconnectFromDocument])

  // Valor del contexto
  const value = {
    state,
    currentUser,
    isConnected,
    connectToDocument,
    disconnectFromDocument,
    broadcastChange,
    lockElement,
    unlockElement,
    updateCursorPosition,
    getActiveUsers,
    getElementLock,
    isElementLocked,
    canEditElement,
  }

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>
}

// Hook para usar el contexto
export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error("useCollaboration debe ser usado dentro de un CollaborationProvider")
  }
  return context
}
