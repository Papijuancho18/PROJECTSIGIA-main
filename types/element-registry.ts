/**
 * Types of elements that can be stored in the registry
 */
export type ElementType = "table" | "chart"

/**
 * Base interface for all registry elements
 */
interface BaseElement {
  id: string
  title?: string
  createdAt?: number
  updatedAt?: number
}

/**
 * Data structure for table elements
 */
export interface TableData extends BaseElement {
  columns: string[]
  rows: any[][]
  caption?: string
  style?: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Data structure for chart elements
 */
export interface ChartData extends BaseElement {
  type: "bar" | "line" | "pie" | "scatter" | "area" | "radar" | "custom"
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      [key: string]: any
    }[]
  }
  options?: Record<string, any>
  width?: number
  height?: number
  metadata?: Record<string, any>
}

/**
 * Interface for the element registry
 */
export interface ElementRegistry {
  tables: Record<string, TableData>
  charts: Record<string, ChartData>
}
