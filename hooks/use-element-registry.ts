"use client"

import { useState, useRef, useCallback } from "react"
import type { ElementType, TableData, ChartData } from "@/types/element-registry"

/**
 * Custom hook that provides a centralized registry for managing elements like tables and charts
 */
export function useElementRegistry() {
  // Main registry state
  const [registry, setRegistry] = useState<{
    tables: Record<string, TableData>
    charts: Record<string, ChartData>
  }>({
    tables: {},
    charts: {},
  })

  // Cache for rendered HTML to improve performance
  const renderedCache = useRef<Record<string, string>>({})

  /**
   * Registers a new element in the registry or updates an existing one
   * @returns The ID of the registered element
   */
  const registerElement = useCallback((type: ElementType, element: TableData | ChartData): string => {
    const id = element.id || `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    // Ensure the element has an ID
    const elementWithId = { ...element, id }

    setRegistry((prev) => {
      if (type === "table") {
        return {
          ...prev,
          tables: {
            ...prev.tables,
            [id]: elementWithId as TableData,
          },
        }
      } else {
        return {
          ...prev,
          charts: {
            ...prev.charts,
            [id]: elementWithId as ChartData,
          },
        }
      }
    })

    return id
  }, [])

  /**
   * Retrieves an element by its ID
   * @returns The element or null if not found
   */
  const getElementById = useCallback(
    (type: ElementType, id: string): TableData | ChartData | null => {
      if (type === "table") {
        return registry.tables[id] || null
      } else {
        return registry.charts[id] || null
      }
    },
    [registry],
  )

  /**
   * Removes an element from the registry
   */
  const removeElement = useCallback((type: ElementType, id: string): void => {
    setRegistry((prev) => {
      if (type === "table") {
        const { [id]: _, ...restTables } = prev.tables
        return {
          ...prev,
          tables: restTables,
        }
      } else {
        const { [id]: _, ...restCharts } = prev.charts
        return {
          ...prev,
          charts: restCharts,
        }
      }
    })

    // Also clear the cache for this element
    const cacheKey = `${type}-${id}`
    if (renderedCache.current[cacheKey]) {
      delete renderedCache.current[cacheKey]
    }
  }, [])

  /**
   * Updates the cached HTML for an element
   */
  const updateCache = useCallback((type: ElementType, id: string, html: string): void => {
    const cacheKey = `${type}-${id}`
    renderedCache.current[cacheKey] = html
  }, [])

  /**
   * Gets the cached HTML for an element
   * @returns The cached HTML or null if not found
   */
  const getCachedHTML = useCallback((type: ElementType, id: string): string | null => {
    const cacheKey = `${type}-${id}`
    return renderedCache.current[cacheKey] || null
  }, [])

  /**
   * Imports elements from a section
   */
  const importFromSection = useCallback(
    (section: any): void => {
      if (!section || !section._extractedElements) return

      const { tables = [], charts = [] } = section._extractedElements

      // Register all tables from the section
      tables.forEach((table: TableData) => {
        registerElement("table", table)
      })

      // Register all charts from the section
      charts.forEach((chart: ChartData) => {
        registerElement("chart", chart)
      })
    },
    [registerElement],
  )

  /**
   * Exports the registry as a serialized string
   */
  const exportRegistry = useCallback((): string => {
    return JSON.stringify(registry)
  }, [registry])

  /**
   * Imports a serialized registry
   */
  const importRegistry = useCallback((serializedRegistry: string): void => {
    try {
      const parsed = JSON.parse(serializedRegistry)
      setRegistry(parsed)

      // Clear the cache when importing a new registry
      renderedCache.current = {}
    } catch (error) {
      console.error("Failed to import registry:", error)
    }
  }, [])

  /**
   * Gets statistics about the registry
   */
  const getStats = useCallback(() => {
    return {
      tables: Object.keys(registry.tables).length,
      charts: Object.keys(registry.charts).length,
      cacheSize: Object.keys(renderedCache.current).length,
    }
  }, [registry])

  return {
    registry,
    registerElement,
    getElementById,
    removeElement,
    updateCache,
    getCachedHTML,
    importFromSection,
    exportRegistry,
    importRegistry,
    getStats,
  }
}
