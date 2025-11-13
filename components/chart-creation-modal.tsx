"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react"
import EnhancedChartPreview from "./enhanced-chart-preview"

interface ChartCreationModalProps {
  onCreateChart: (chartData: any) => void
}

export function ChartCreationModal({ onCreateChart }: ChartCreationModalProps) {
  const [chartType, setChartType] = useState("bar")
  const [chartTitle, setChartTitle] = useState("Mi Gráfico")
  const [labels, setLabels] = useState("Enero,Febrero,Marzo,Abril")
  const [dataValues, setDataValues] = useState("65,59,80,81")
  const [dataLabel, setDataLabel] = useState("Datos")

  // Plantillas predefinidas de gráficos
  const chartTemplates = [
    {
      id: "academic-performance",
      name: "Rendimiento Académico",
      description: "Comparativa de indicadores académicos por periodo",
      category: "académico",
      icon: <BarChart3 className="h-5 w-5" />,
      chartData: {
        title: "Indicadores Académicos por Periodo",
        type: "bar",
        labels: ["2021-1", "2021-2", "2022-1", "2022-2", "2023-1"],
        datasets: [
          {
            label: "Tasa de Aprobación (%)",
            data: [75, 78, 80, 82, 85],
            backgroundColor: "#3EBD93",
            borderColor: "#35A883",
          },
          {
            label: "Satisfacción Estudiantil",
            data: [82, 85, 83, 87, 90],
            backgroundColor: "#334E68",
            borderColor: "#2A3F55",
          },
        ],
      },
    },
    {
      id: "grade-distribution",
      name: "Distribución de Calificaciones",
      description: "Distribución porcentual de calificaciones por rango",
      category: "evaluación",
      icon: <PieChart className="h-5 w-5" />,
      chartData: {
        title: "Distribución de Calificaciones",
        type: "pie",
        labels: ["Excelente (9-10)", "Bueno (8-8.9)", "Regular (7-7.9)", "Insuficiente (<7)"],
        datasets: [
          {
            label: "Porcentaje",
            data: [25, 40, 25, 10],
            backgroundColor: ["#3EBD93", "#334E68", "#FFCA3A", "#E63946"],
            borderColor: ["#35A883", "#2A3F55", "#F5C033", "#D33240"],
          },
        ],
      },
    },
    {
      id: "research-trend",
      name: "Tendencia de Investigación",
      description: "Evolución de publicaciones científicas por año",
      category: "investigación",
      icon: <LineChart className="h-5 w-5" />,
      chartData: {
        title: "Publicaciones Científicas por Año",
        type: "line",
        labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
        datasets: [
          {
            label: "Artículos Publicados",
            data: [12, 15, 18, 25, 32, 40],
            backgroundColor: "#3EBD93",
            borderColor: "#35A883",
            tension: 0.4,
          },
        ],
      },
    },
    {
      id: "enrollment-growth",
      name: "Crecimiento de Matrícula",
      description: "Evolución del número de estudiantes matriculados",
      category: "administrativo",
      icon: <TrendingUp className="h-5 w-5" />,
      chartData: {
        title: "Crecimiento de Matrícula por Programa",
        type: "bar",
        labels: ["Ingeniería", "Medicina", "Administración", "Derecho", "Psicología"],
        datasets: [
          {
            label: "2022",
            data: [450, 320, 280, 200, 150],
            backgroundColor: "#334E68",
            borderColor: "#2A3F55",
          },
          {
            label: "2023",
            data: [480, 340, 300, 220, 170],
            backgroundColor: "#3EBD93",
            borderColor: "#35A883",
          },
        ],
      },
    },
  ]

  const createCustomChart = () => {
    const labelsArray = labels.split(",").map((l) => l.trim())
    const dataArray = dataValues.split(",").map((v) => Number.parseFloat(v.trim()) || 0)

    const chartData = {
      title: chartTitle,
      type: chartType,
      labels: labelsArray,
      datasets: [
        {
          label: dataLabel,
          data: dataArray,
          backgroundColor: chartType === "pie" ? ["#3EBD93", "#334E68", "#FFCA3A", "#E63946", "#8B5CF6"] : "#3EBD93",
          borderColor: chartType === "pie" ? ["#35A883", "#2A3F55", "#F5C033", "#D33240", "#7C3AED"] : "#35A883",
          tension: chartType === "line" ? 0.4 : undefined,
        },
      ],
    }

    onCreateChart(chartData)
  }

  const createFromTemplate = (template: (typeof chartTemplates)[0]) => {
    onCreateChart(template.chartData)
  }

  // Generar vista previa del gráfico personalizado
  const previewData = {
    title: chartTitle,
    type: chartType,
    labels: labels.split(",").map((l) => l.trim()),
    datasets: [
      {
        label: dataLabel,
        data: dataValues.split(",").map((v) => Number.parseFloat(v.trim()) || 0),
        backgroundColor: chartType === "pie" ? ["#3EBD93", "#334E68", "#FFCA3A", "#E63946", "#8B5CF6"] : "#3EBD93",
        borderColor: chartType === "pie" ? ["#35A883", "#2A3F55", "#F5C033", "#D33240", "#7C3AED"] : "#35A883",
        tension: chartType === "line" ? 0.4 : undefined,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="custom">Gráfico Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {chartTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 h-[250px] bg-gray-50 border rounded-lg overflow-hidden flex items-center justify-center">
                    <EnhancedChartPreview chartData={template.chartData} width={400} height={220} interactive={false} />
                  </div>
                  <Button onClick={() => createFromTemplate(template)} className="w-full">
                    Usar Esta Plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Gráfico Personalizado</CardTitle>
              <CardDescription>Define los datos y configuración de tu gráfico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chart-title">Título del Gráfico</Label>
                    <Input
                      id="chart-title"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      placeholder="Título del gráfico"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chart-type">Tipo de Gráfico</Label>
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Barras</SelectItem>
                        <SelectItem value="line">Líneas</SelectItem>
                        <SelectItem value="pie">Circular</SelectItem>
                        <SelectItem value="doughnut">Dona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-label">Etiqueta de Datos</Label>
                    <Input
                      id="data-label"
                      value={dataLabel}
                      onChange={(e) => setDataLabel(e.target.value)}
                      placeholder="Nombre del conjunto de datos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labels">Etiquetas (separadas por comas)</Label>
                    <Textarea
                      id="labels"
                      value={labels}
                      onChange={(e) => setLabels(e.target.value)}
                      placeholder="Enero,Febrero,Marzo,Abril"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-values">Valores (separados por comas)</Label>
                    <Textarea
                      id="data-values"
                      value={dataValues}
                      onChange={(e) => setDataValues(e.target.value)}
                      placeholder="65,59,80,81"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 h-[350px] flex items-center justify-center">
                    <EnhancedChartPreview chartData={previewData} width={350} height={300} interactive={false} />
                  </div>
                </div>
              </div>

              <Button onClick={createCustomChart} className="w-full">
                Crear Gráfico Personalizado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
