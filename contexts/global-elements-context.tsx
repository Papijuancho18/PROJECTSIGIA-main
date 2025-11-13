"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Tipos para los elementos
export type ElementType = "chart" | "table"

export interface GlobalElement {
  id: string
  type: ElementType
  content: any // El contenido real del elemento (datos del gráfico o tabla)
  reportId?: string // ID opcional del informe al que pertenece
  sectionId?: string // ID opcional de la sección a la que pertenece
}

// Interfaz del contexto
interface GlobalElementsContextType {
  elements: Record<string, GlobalElement>
  registerElement: (element: GlobalElement) => void
  updateElement: (id: string, updates: Partial<GlobalElement>) => void
  getElement: (id: string) => GlobalElement | undefined
  removeElement: (id: string) => void
  getElementsByReportAndSection: (reportId?: string, sectionId?: string) => GlobalElement[]
  getElementsByType: (type: ElementType) => GlobalElement[]
  debug: boolean
  setDebug: (value: boolean) => void
}

// Crear el contexto
const GlobalElementsContext = createContext<GlobalElementsContextType | undefined>(undefined)

// Proveedor del contexto
export const GlobalElementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<Record<string, GlobalElement>>({})
  const [debug, setDebug] = useState(false)

  // Registrar un nuevo elemento
  const registerElement = useCallback(
    (element: GlobalElement) => {
      if (debug) {
        console.log("Registrando elemento:", element)
      }
      setElements((prev) => ({
        ...prev,
        [element.id]: element,
      }))
    },
    [debug],
  )

  // Actualizar un elemento existente
  const updateElement = useCallback(
    (id: string, updates: Partial<GlobalElement>) => {
      setElements((prev) => {
        if (!prev[id]) {
          if (debug) {
            console.warn(`Intento de actualizar elemento inexistente: ${id}`)
          }
          return prev
        }

        if (debug) {
          console.log(`Actualizando elemento ${id}:`, updates)
        }

        return {
          ...prev,
          [id]: {
            ...prev[id],
            ...updates,
          },
        }
      })
    },
    [debug],
  )

  // Obtener un elemento por ID
  const getElement = useCallback(
    (id: string) => {
      return elements[id]
    },
    [elements],
  )

  // Eliminar un elemento
  const removeElement = useCallback(
    (id: string) => {
      if (debug) {
        console.log(`Eliminando elemento: ${id}`)
      }

      setElements((prev) => {
        const newElements = { ...prev }
        delete newElements[id]
        return newElements
      })
    },
    [debug],
  )

  // Obtener elementos por reporte y sección
  const getElementsByReportAndSection = useCallback(
    (reportId?: string, sectionId?: string) => {
      return Object.values(elements).filter((element) => {
        if (reportId && element.reportId !== reportId) return false
        if (sectionId && element.sectionId !== sectionId) return false
        return true
      })
    },
    [elements],
  )

  // Obtener elementos por tipo
  const getElementsByType = useCallback(
    (type: ElementType) => {
      return Object.values(elements).filter((element) => element.type === type)
    },
    [elements],
  )

  const value = {
    elements,
    registerElement,
    updateElement,
    getElement,
    removeElement,
    getElementsByReportAndSection,
    getElementsByType,
    debug,
    setDebug,
  }

  return <GlobalElementsContext.Provider value={value}>{children}</GlobalElementsContext.Provider>
}

// Hook personalizado para usar el contexto
export const useGlobalElements = () => {
  const context = useContext(GlobalElementsContext)
  if (context === undefined) {
    throw new Error("useGlobalElements debe ser usado dentro de un GlobalElementsProvider")
  }
  return context
}
