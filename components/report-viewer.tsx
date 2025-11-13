"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import EnhancedChartPreview from "./enhanced-chart-preview";

export default function ReportViewer({ reportData }: { reportData: any }) {
  const [activeTab, setActiveTab] = useState("resumen");
  const [mainChartData, setMainChartData] = useState<any>(null);
  const [comparisonChartData, setComparisonChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportData) return;

    try {
      setLoading(true);
      setError(null);

      // Datos para gráfico principal
      const chartBase = {
        labels: reportData.labels || ["Enero", "Febrero", "Marzo", "Abril"],
        datasets: [
          {
            label: "2023",
            data: reportData.data2023 || [45, 60, 70, 50],
            backgroundColor: "#334E68",
          },
          {
            label: "2024",
            data: reportData.data2024 || [50, 65, 80, 55],
            backgroundColor: "#3EBD93",
          },
        ],
      };

      setMainChartData(chartBase);

      // Datos para gráfico comparativo
      const comparisonBase = {
        labels: ["Ingeniería", "Medicina", "Administración", "Derecho", "Psicología"],
        datasets: [
          {
            label: "2023",
            data: [450, 320, 280, 200, 150],
            backgroundColor: "#334E68",
          },
          {
            label: "2024",
            data: [480, 340, 300, 220, 170],
            backgroundColor: "#3EBD93",
          },
        ],
      };

      setComparisonChartData(comparisonBase);
    } catch (err: any) {
      console.error("Error al preparar los datos:", err);
      setError("Error al procesar los datos del reporte.");
    } finally {
      setLoading(false);
    }
  }, [reportData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando visualización...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!reportData) {
    return (
      <Alert>
        <AlertDescription>No hay datos disponibles para mostrar el reporte.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>{reportData.title || "Visualizador de Reporte"}</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="comparacion">Comparación</TabsTrigger>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Crecimiento General</h3>
            {mainChartData ? (
              <EnhancedChartPreview chartData={mainChartData} height={300} /> // ✅ corregido
            ) : (
              <p>No hay datos del gráfico principal disponibles.</p>
            )}
          </TabsContent>

          <TabsContent value="comparacion" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Comparativo por Programa</h3>
            {comparisonChartData ? (
              <EnhancedChartPreview chartData={comparisonChartData} height={300} /> // ✅ corregido
            ) : (
              <p>No hay datos comparativos disponibles.</p>
            )}
          </TabsContent>

          <TabsContent value="detalles" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Detalles del Reporte</h3>
            {reportData.sections && reportData.sections.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {reportData.sections.map((section: any, index: number) => (
                  <li key={index}>
                    <strong>{section.title}:</strong> {section.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay secciones detalladas en este reporte.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
