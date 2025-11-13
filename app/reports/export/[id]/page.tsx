"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportExportSystem } from "@/components/report-export-system"
import { StaffSidebar } from "@/components/staff-sidebar"
import { ArrowLeft } from "lucide-react"

export default function ExportReportPage({ params }) {
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const mockReport = {
      id: params.id,
      title: "Informe de Rendimiento Académico",
      subtitle: "Período 2023-2024",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Dr. Juan Pérez",
      department: "Facultad de Ciencias",
      sections: [
        {
          id: "section-1",
          title: "Resumen Ejecutivo",
          content: "Este informe presenta los resultados de la gestión académica...",
        },
        {
          id: "section-2",
          title: "Indicadores Clave",
          content: "Los indicadores muestran una tendencia positiva en...",
        },
        {
          id: "section-3",
          title: "Análisis de Resultados",
          content: "El análisis de los datos recopilados indica que...",
        },
        {
          id: "section-4",
          title: "Conclusiones y Recomendaciones",
          content: "En base a los resultados obtenidos, se recomienda...",
        },
      ],
    }

    setReport(mockReport)
    setLoading(false)
  }, [params.id])

  const handleBack = () => {
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
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Informes
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">{report?.title}</h1>
          <p className="text-gray-500">Configure las opciones de exportación para este informe</p>
        </div>

        {report ? (
          <ReportExportSystem reportId={params.id} reportData={report} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Error al cargar el informe</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No se pudo cargar el informe solicitado.</p>
              <Button onClick={handleBack} className="mt-4">
                Volver a la lista de informes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
