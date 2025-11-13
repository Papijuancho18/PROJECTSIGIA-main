"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TemplateCreator } from "./template-creator"
import {
  Search,
  Plus,
  Edit,
  Copy,
  Share2,
  Trash2,
  MoreVertical,
  FileDown,
  Star,
  StarOff,
  CheckCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileIcon as FilePdf,
  ArrowUpDown,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Plantillas de ejemplo para demostración
const exampleUserTemplates = [
  {
    id: "user-template-1",
    name: "Mi Plantilla Académica",
    description: "Plantilla personalizada para informes académicos",
    category: "académico",
    thumbnail: "/academic-custom-template.png",
    format: "pdf",
    styles: {
      fontFamily: "Times New Roman",
      primaryColor: "#2563EB",
      secondaryColor: "#60A5FA",
      headerStyle: "numbered",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait",
    },
  },
  {
    id: "user-template-2",
    name: "Reporte Ejecutivo Personal",
    description: "Mi versión personalizada para reportes ejecutivos",
    category: "ejecutivo",
    thumbnail: "/placeholder.svg?height=300&width=400&query=executive%20custom%20template",
    format: "word",
    styles: {
      fontFamily: "Calibri",
      primaryColor: "#059669",
      secondaryColor: "#34D399",
      headerStyle: "centered",
      includePageNumbers: true,
      includeTableOfContents: false,
      orientation: "portrait",
    },
  },
  {
    id: "user-template-3",
    name: "Análisis Estadístico",
    description: "Plantilla para informes estadísticos con gráficos",
    category: "estadístico",
    thumbnail: "/placeholder.svg?height=300&width=400&query=statistical%20custom%20template",
    format: "excel",
    styles: {
      fontFamily: "Arial",
      primaryColor: "#7C3AED",
      secondaryColor: "#A78BFA",
      headerStyle: "boxed",
      includePageNumbers: true,
      includeTableOfContents: false,
      orientation: "landscape",
    },
  },
]

// Plantillas compartidas de ejemplo
const exampleSharedTemplates = [
  {
    id: "shared-template-1",
    name: "Plantilla Departamental",
    description: "Plantilla oficial del departamento de Ciencias",
    category: "académico",
    thumbnail: "/placeholder.svg?height=300&width=400&query=department%20template",
    format: "pdf",
    styles: {
      fontFamily: "Arial",
      primaryColor: "#1D4ED8",
      secondaryColor: "#3B82F6",
      headerStyle: "left-aligned",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait",
    },
  },
  {
    id: "shared-template-2",
    name: "Plantilla Institucional",
    description: "Plantilla oficial de la institución para reportes formales",
    category: "institucional",
    thumbnail: "/placeholder.svg?height=300&width=400&query=institutional%20template",
    format: "pdf",
    styles: {
      fontFamily: "Times New Roman",
      primaryColor: "#9D174D",
      secondaryColor: "#EC4899",
      headerStyle: "centered",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait",
    },
  },
]

interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut" | "scatter" | "combo"
  title: string
  labels?: string[]
  datasets?: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
    type?: "bar" | "line"
    yAxisID?: string
  }[]
  pieData?: number[]
  doughnutData?: number[]
  scatterData?: { x: number; y: number; label: string }[]
  comboSeries?: {
    name: string
    type: "bar" | "line"
    data: number[]
    color: string
  }[]
}

interface Template {
  id: string
  name: string
  description: string
  type: "chart" | "table"
  chartData?: ChartData
  tableData?: any // Replace 'any' with a more specific type if needed
}

const predefinedTemplates = [
  {
    id: "bar-sales",
    name: "Ventas por Producto (Barras)",
    description: "Gráfico de barras para mostrar las ventas de diferentes productos",
    type: "chart" as const,
    chartData: {
      type: "bar",
      title: "Ventas Trimestrales",
      labels: ["Producto A", "Producto B", "Producto C"],
      datasets: [
        {
          label: "Q1",
          data: [65, 59, 80],
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
        {
          label: "Q2",
          data: [81, 56, 55],
          backgroundColor: ["rgba(54, 162, 235, 0.2)"],
          borderColor: ["rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    },
  },
  {
    id: "line-revenue",
    name: "Ingresos Mensuales (Línea)",
    description: "Gráfico de línea para mostrar la evolución de los ingresos mensuales",
    type: "chart" as const,
    chartData: {
      type: "line",
      title: "Ingresos Mensuales 2024",
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
      datasets: [
        {
          label: "Ingresos",
          data: [65, 59, 80, 81, 56, 55],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
  },
  {
    id: "pie-market-share",
    name: "Cuota de Mercado (Torta)",
    description: "Gráfico de torta para mostrar la cuota de mercado de diferentes empresas",
    type: "chart" as const,
    chartData: {
      type: "pie",
      title: "Cuota de Mercado",
      labels: ["Empresa A", "Empresa B", "Empresa C"],
      pieData: [30, 40, 30],
    },
  },
  {
    id: "doughnut-customer-segments",
    name: "Segmentos de Clientes (Dona)",
    description: "Gráfico de dona para mostrar la distribución de los segmentos de clientes",
    type: "chart" as const,
    chartData: {
      type: "doughnut",
      title: "Segmentos de Clientes",
      labels: ["Jóvenes", "Adultos", "Mayores"],
      doughnutData: [25, 35, 40],
    },
  },
  {
    id: "scatter-performance",
    name: "Análisis de Rendimiento (Dispersión)",
    description: "Gráfico de dispersión para analizar la relación entre variables",
    type: "chart" as const,
    chartData: {
      type: "scatter",
      title: "Relación Horas de Estudio vs Calificaciones",
      scatterData: [
        { x: 2, y: 65, label: "Estudiante A" },
        { x: 4, y: 75, label: "Estudiante B" },
        { x: 6, y: 85, label: "Estudiante C" },
        { x: 8, y: 90, label: "Estudiante D" },
        { x: 3, y: 70, label: "Estudiante E" },
        { x: 7, y: 88, label: "Estudiante F" },
      ],
    },
  },
  {
    id: "combo-academic-trends",
    name: "Tendencias Académicas (Combinado)",
    description: "Gráfico combinado con barras y líneas para mostrar múltiples métricas",
    type: "chart" as const,
    chartData: {
      type: "combo",
      title: "Rendimiento Académico por Trimestre",
      labels: ["T1", "T2", "T3", "T4"],
      comboSeries: [
        {
          name: "Estudiantes Aprobados",
          type: "bar" as const,
          data: [85, 90, 88, 92],
          color: "#3b82f6",
        },
        {
          name: "Promedio General",
          type: "line" as const,
          data: [7.5, 8.0, 7.8, 8.2],
          color: "#ef4444",
        },
        {
          name: "Asistencia (%)",
          type: "line" as const,
          data: [95, 93, 96, 94],
          color: "#10b981",
        },
      ],
    },
  },
]

interface TemplateManagerProps {
  onSelectTemplate?: (template: any) => void
  selectable?: boolean
}

export function TemplateManager({ onSelectTemplate, selectable = false }: TemplateManagerProps) {
  const [userTemplates, setUserTemplates] = useState<any[]>(exampleUserTemplates)
  const [sharedTemplates, setSharedTemplates] = useState<any[]>(exampleSharedTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("my-templates")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null)
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>(["user-template-1"])
  const [actionStatus, setActionStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
    action?: string
  }>({ status: "idle" })

  const router = useRouter()

  // Filtrar plantillas según la búsqueda
  const filteredUserTemplates = userTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredSharedTemplates = sharedTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Obtener el icono según el formato
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "word":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "html":
        return <FileDown className="h-5 w-5 text-purple-500" />
      default:
        return <FileDown className="h-5 w-5" />
    }
  }

  // Manejar la creación de una nueva plantilla
  const handleCreateTemplate = async (template: any) => {
    // Simulación de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Añadir la nueva plantilla
    setUserTemplates((prev) => [...prev, template])
    setShowCreateDialog(false)
    setActionStatus({
      status: "success",
      message: "Plantilla creada exitosamente",
      action: "create",
    })

    // Resetear después de 3 segundos
    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  // Manejar la actualización de una plantilla existente
  const handleUpdateTemplate = async (updatedTemplate: any) => {
    // Simulación de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Actualizar la plantilla
    setUserTemplates((prev) =>
      prev.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template)),
    )
    setEditingTemplate(null)
    setActionStatus({
      status: "success",
      message: "Plantilla actualizada exitosamente",
      action: "update",
    })

    // Resetear después de 3 segundos
    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  // Manejar la eliminación de una plantilla
  const handleDeleteTemplate = async (templateId: string) => {
    // Simulación de eliminación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Eliminar la plantilla
    setUserTemplates((prev) => prev.filter((template) => template.id !== templateId))
    setActionStatus({
      status: "success",
      message: "Plantilla eliminada exitosamente",
      action: "delete",
    })

    // Resetear después de 3 segundos
    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  // Manejar la duplicación de una plantilla
  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate: any = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copia)`,
    }
    setUserTemplates((prev) => [...prev, duplicatedTemplate])
    setActionStatus({
      status: "success",
      message: "Plantilla duplicada exitosamente",
      action: "duplicate",
    })

    // Resetear después de 3 segundos
    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  // Manejar favoritos
  const handleToggleFavorite = (templateId: string) => {
    setFavoriteTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId],
    )
  }

  // Renderizar una tarjeta de plantilla
  const renderTemplateCard = (template: any, isShared = false) => (
    <Card
      key={template.id}
      className={`overflow-hidden hover:shadow-md transition-all ${
        selectable ? "cursor-pointer hover:border-primary/50" : ""
      }`}
      onClick={() => selectable && onSelectTemplate && onSelectTemplate(template)}
    >
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={template.thumbnail || "/placeholder.svg"}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-white text-primary border border-primary/20">
            <div className="flex items-center gap-1">
              {getFormatIcon(template.format)}
              <span>{template.format.toUpperCase()}</span>
            </div>
          </Badge>
        </div>
        {favoriteTemplates.includes(template.id) && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-400 text-amber-950 border-none">
              <Star className="h-3 w-3 mr-1 fill-amber-950" />
              Favorita
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-base">{template.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Badge variant="outline" className="capitalize border-primary/20 text-primary">
          {template.category}
        </Badge>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleFavorite(template.id)
            }}
          >
            {favoriteTemplates.includes(template.id) ? (
              <StarOff className="h-4 w-4 text-amber-500" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            <span className="sr-only">Favorito</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isShared && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTemplate(template)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicateTemplate(template)
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </DropdownMenuItem>
              {!isShared && (
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTemplate(template.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <>
      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestor de Plantillas</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Administre sus plantillas personalizadas para exportación de reportes
              </CardDescription>
            </div>
            <Button variant="secondary" className="gap-1" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
              Nueva Plantilla
            </Button>
            <Button variant="outline" className="gap-1" onClick={() => router.push("/templates/transfer")}>
              <ArrowUpDown className="h-4 w-4" />
              Transferir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Alertas de estado */}
          {actionStatus.status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Operación exitosa</AlertTitle>
              <AlertDescription>{actionStatus.message}</AlertDescription>
            </Alert>
          )}

          {actionStatus.status === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{actionStatus.message}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="my-templates">Mis Plantillas</TabsTrigger>
              <TabsTrigger value="shared-templates">Plantillas Compartidas</TabsTrigger>
            </TabsList>

            <TabsContent value="my-templates" className="mt-0">
              {filteredUserTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileDown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay plantillas personalizadas</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? "No se encontraron plantillas que coincidan con su búsqueda."
                      : "Cree su primera plantilla personalizada para comenzar."}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>Crear nueva plantilla</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUserTemplates.map((template) => renderTemplateCard(template))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared-templates" className="mt-0">
              {filteredSharedTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay plantillas compartidas</h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? "No se encontraron plantillas compartidas que coincidan con su búsqueda."
                      : "No hay plantillas compartidas disponibles en este momento."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSharedTemplates.map((template) => renderTemplateCard(template, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo para crear nueva plantilla */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          <TemplateCreator onSave={handleCreateTemplate} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar plantilla */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          {editingTemplate && (
            <TemplateCreator
              initialTemplate={editingTemplate}
              isEditing={true}
              onSave={handleUpdateTemplate}
              onCancel={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
