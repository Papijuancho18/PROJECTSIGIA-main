"use client"

import { useCallback } from "react"
import { useGlobalElements } from "@/contexts/global-elements-context"

// Hook personalizado para facilitar el uso del registro global
export const useGlobalElementsManager = () => {
  const {
    elements,
    registerElement,
    updateElement,
    getElement,
    removeElement,
    getElementsByReportAndSection,
    getElementsByType,
    debug,
    setDebug,
  } = useGlobalElements()

  // Función para registrar un gráfico
  const registerChart = useCallback(
    (chartId: string, chartData: any, reportId?: string, sectionId?: string) => {
      registerElement({
        id: chartId,
        type: "chart",
        content: chartData,
        reportId,
        sectionId,
      })
    },
    [registerElement],
  )

  // Función para registrar una tabla
  const registerTable = useCallback(
    (tableId: string, tableData: any, reportId?: string, sectionId?: string) => {
      registerElement({
        id: tableId,
        type: "table",
        content: tableData,
        reportId,
        sectionId,
      })
    },
    [registerElement],
  )

  // Función para obtener todos los gráficos
  const getAllCharts = useCallback(() => {
    return getElementsByType("chart")
  }, [getElementsByType])

  // Función para obtener todos las tablas
  const getAllTables = useCallback(() => {
    return getElementsByType("table")
  }, [getElementsByType])

  // Función para obtener gráficos por informe y sección
  const getChartsByReportAndSection = useCallback(
    (reportId?: string, sectionId?: string) => {
      return getElementsByReportAndSection(reportId, sectionId).filter((element) => element.type === "chart")
    },
    [getElementsByReportAndSection],
  )

  // Función para obtener tablas por informe y sección
  const getTablesByReportAndSection = useCallback(
    (reportId?: string, sectionId?: string) => {
      return getElementsByReportAndSection(reportId, sectionId).filter((element) => element.type === "table")
    },
    [getElementsByReportAndSection],
  )

  return {
    elements,
    registerElement,
    updateElement,
    getElement,
    removeElement,
    getElementsByReportAndSection,
    getElementsByType,
    debug,
    setDebug,
    registerChart,
    registerTable,
    getAllCharts,
    getAllTables,
    getChartsByReportAndSection,
    getTablesByReportAndSection,
  }
}
