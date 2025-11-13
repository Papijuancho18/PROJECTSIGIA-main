"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportEditor } from "@/components/report-editor"
import { StaffSidebar } from "@/components/staff-sidebar"

export default function EditReportPage({ params }) {
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const mockReport = {
      id: params.id,
      title: "Informe de Rendimiento Académico",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "section-1",
          title: "Resumen Ejecutivo",
          level: 1,
          content: "Este informe presenta los resultados de la gestión académica...",
          type: "text",
          subsections: [],
        },
        {
          id: "section-2",
          title: "Indicadores Clave",
          level: 1,
          content: "",
          type: "table",
          tableData: {
            headers: ["Indicador", "Valor Actual", "Meta", "% Cumplimiento"],
            rows: [
              ["Tasa de Graduación", "85%", "90%", "94%"],
              ["Satisfacción Estudiantil", "4.2/5.0", "4.5/5.0", "93%"],
              ["Publicaciones Académicas", "45", "50", "90%"],
            ],
          },
          subsections: [
            {
              id: "section-2-1",
              title: "Análisis de Indicadores",
              level: 2,
              content: "El análisis de los indicadores muestra una tendencia positiva...",
              type: "text",
              subsections: [],
            },
          ],
        },
        {
          id: "section-3",
          title: "Evolución de Indicadores",
          level: 1,
          content: "",
          type: "chart",
          chartType: "bar",
          chartData: {
            id: "chart-1",
            title: "Evolución de Indicadores",
            type: "bar",
            labels: ["2021", "2022", "2023", "2024"],
            datasets: [
              {
                label: "Tasa de Graduación",
                data: [75, 78, 82, 85],
                backgroundColor: "#3EBD93",
                borderColor: "#35A883",
              },
              {
                label: "Satisfacción",
                data: [3.8, 4.0, 4.1, 4.2],
                backgroundColor: "#334E68",
                borderColor: "#2A3F55",
              },
            ],
          },
          subsections: [],
        },
      ],
    }

    setReport(mockReport)
    setLoading(false)
  }, [params.id])

  const handleSave = (updatedSections) => {
    console.log("Guardando informe:", updatedSections)
    // Aquí iría la lógica para guardar el informe
    router.push("/staff/reports")
  }

  const handleCancel = () => {
    router.push("/staff/reports")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <StaffSidebar />
        <div className="flex-1 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Cargando informe...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <div className="flex-1 p-8">
        {report ? (
          <ReportEditor report={report} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Error al cargar el informe</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No se pudo cargar el informe solicitado.</p>
              <Button onClick={() => router.push("/staff/reports")} className="mt-4">
                Volver a la lista de informes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
