"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useElementRegistry } from "@/hooks/use-element-registry"
import type { ElementType, TableData, ChartData } from "@/types/element-registry"

// Definir la interfaz del contexto
interface ElementRegistryContextType {
  registry: {
    tables: Record<string, TableData>
    charts: Record<string, ChartData>
  }
  registerElement: (type: ElementType, element: TableData | ChartData) => string
  getElementById: (type: ElementType, id: string) => TableData | ChartData | null
  removeElement: (type: ElementType, id: string) => void
  updateCache: (type: ElementType, id: string, html: string) => void
  getCachedHTML: (type: ElementType, id: string) => string | null
  importFromSection: (section: any) => void
  exportRegistry: () => string
  importRegistry: (serializedRegistry: string) => void
  getStats: () => { tables: number; charts: number; cacheSize: number }
}

// Crear el contexto
const ElementRegistryContext = createContext<ElementRegistryContextType | undefined>(undefined)

// Proveedor del contexto
export function ElementRegistryProvider({ children }: { children: ReactNode }) {
  const registryUtils = useElementRegistry()

  return <ElementRegistryContext.Provider value={registryUtils}>{children}</ElementRegistryContext.Provider>
}

// Hook para usar el contexto
export function useElementRegistryContext() {
  const context = useContext(ElementRegistryContext)
  if (context === undefined) {
    throw new Error("useElementRegistryContext must be used within an ElementRegistryProvider")
  }
  return context
}

export { useElementRegistry }
