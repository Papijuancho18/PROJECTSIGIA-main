"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StaffSidebar } from "@/components/staff-sidebar"
import { UserProfile } from "@/components/user-profile"
import { ReportEditor } from "@/components/report-editor"
import { TemplateEditor } from "@/components/template-editor"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GlobalElementsProvider } from "@/contexts/global-elements-context"
import { AvailableTemplatesSelector } from "@/components/available-templates-selector"
import { toast } from "@/components/ui/use-toast"
import { TemplateContentDebugger } from "@/components/template-content-debugger"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FileText, Edit } from "lucide-react"

// Definir la interfaz para el tipo de informe
interface Section {
  id: string
  title: string
  content: string
  type?: "text" | "table" | "chart" | "image"
  data?: any
  subsections?: Section[]
  parentId?: string | null
}

interface Report {
  id: string
  title: string
  sections: Section[]
  lastEdited?: string
  createdAt?: string
  status?: "borrador" | "finalizado"
  author?: string
  department?: string
}

// Clave para almacenar los reportes
const REPORTS_STORAGE_KEY = "saved_reports"

// Función para obtener fecha actual de forma consistente
const getCurrentDate = () => {
  return new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Datos por defecto estáticos para evitar problemas de hidratación
const getDefaultReports = (): Report[] => [
  {
    id: "123",
    title: "Informe Semestral 2023-2",
    author: "Dr. María González",
    department: "Facultad de Ciencias",
    sections: [
      {
        id: "section-1",
        title: "Resumen Ejecutivo",
        content: "Este informe presenta los resultados del semestre 2023-2...",
        type: "text",
        subsections: [
          {
            id: "subsection-1-1",
            title: "Objetivos",
            content: "Los objetivos principales del semestre fueron...",
            parentId: "section-1",
          },
          {
            id: "subsection-1-2",
            title: "Metodología",
            content: "La metodología aplicada consistió en...",
            parentId: "section-1",
          },
        ],
      },
    ],
    lastEdited: "15/04/2023",
    createdAt: "10/04/2023",
    status: "borrador",
  },
]

export default function StaffDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("create")
  const [currentReport, setCurrentReport] = useState<Report | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [exportHistory, setExportHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Estado para los reportes guardados
  const [savedReports, setSavedReports] = useState<Report[]>(getDefaultReports())

  // Efecto para manejar la hidratación
  useEffect(() => {
    setIsHydrated(true)

    // Cargar reportes del localStorage solo después de la hidratación
    const storedReports = localStorage.getItem(REPORTS_STORAGE_KEY)
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports)
        setSavedReports(parsedReports)
      } catch (error) {
        console.error("Error loading saved reports:", error)
        setSavedReports(getDefaultReports())
      }
    }
  }, [])

  // Guardar reportes en localStorage cada vez que cambien (solo después de hidratación)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(savedReports))
    }
  }, [savedReports, isHydrated])

  const handleCreateBlankReport = () => {
    console.log("🎯 Creating new report - showing admin templates")
    setShowTemplateSelector(true)
  }

  const handleSelectTemplate = (template: any) => {
    console.log("🎯 Admin template selected for editing:", template)

    // Verificar que la plantilla tenga secciones
    let templateSections = []

    if (template.sections && Array.isArray(template.sections)) {
      templateSections = JSON.parse(JSON.stringify(template.sections))
      console.log("📋 Using admin template sections:", templateSections.length)
    } else if (template.content) {
      try {
        const parsedContent = typeof template.content === "string" ? JSON.parse(template.content) : template.content
        if (Array.isArray(parsedContent)) {
          templateSections = JSON.parse(JSON.stringify(parsedContent))
          console.log("📋 Using admin template content field:", templateSections.length)
        }
      } catch (e) {
        console.error("Error parsing admin template content:", e)
      }
    }

    // Si no hay secciones, crear una sección por defecto
    if (templateSections.length === 0) {
      templateSections = [
        {
          id: `section-${Date.now()}`,
          title: "Introducción",
          content: "Comience escribiendo su informe aquí...",
          type: "text",
          subsections: [],
        },
      ]
      console.log("📋 Created default section for admin template")
    }

    // Convertir las secciones al formato esperado por ReportEditor
    const convertedSections = templateSections.map((section, index) => {
      const convertedSection = {
        id: section.id || `section-${Date.now()}-${index}`,
        title: section.title || "Sin título",
        content: "", // Inicializar contenido vacío para que el usuario pueda editarlo
        type: section.type || "text",
        subsections: [],
        parentId: null,
      }

      // Convertir elementos a contenido inicial si existen
      if (section.elements && Array.isArray(section.elements)) {
        let initialContent = ""

        section.elements.forEach((element) => {
          switch (element.type) {
            case "text":
              if (element.content?.text) {
                initialContent += element.content.text + "\n\n"
              }
              break
            case "heading1":
              if (element.content?.text) {
                initialContent += `# ${element.content.text}\n\n`
              }
              break
            case "heading2":
              if (element.content?.text) {
                initialContent += `## ${element.content.text}\n\n`
              }
              break
            case "list":
              if (element.content?.items && Array.isArray(element.content.items)) {
                element.content.items.forEach((item) => {
                  initialContent += `• ${item}\n`
                })
                initialContent += "\n"
              }
              break
            case "chart":
              if (element.content?.title) {
                initialContent += `[Gráfico: ${element.content.title}]\n\n`
              }
              break
            case "table":
              if (element.content?.title) {
                initialContent += `[Tabla: ${element.content.title}]\n\n`
              }
              break
          }
        })

        convertedSection.content = initialContent.trim() || "Escriba aquí el contenido de esta sección..."
      } else {
        convertedSection.content = "Escriba aquí el contenido de esta sección..."
      }

      // Convertir subsecciones si existen
      if (section.subsections && Array.isArray(section.subsections)) {
        convertedSection.subsections = section.subsections.map((subsection, subIndex) => {
          const convertedSubsection = {
            id: subsection.id || `subsection-${Date.now()}-${index}-${subIndex}`,
            title: subsection.title || "Sin título",
            content: "Escriba aquí el contenido de esta subsección...",
            parentId: convertedSection.id,
          }

          // Convertir elementos de subsección
          if (subsection.elements && Array.isArray(subsection.elements)) {
            let subContent = ""
            subsection.elements.forEach((element) => {
              switch (element.type) {
                case "text":
                  if (element.content?.text) {
                    subContent += element.content.text + "\n\n"
                  }
                  break
                case "list":
                  if (element.content?.items && Array.isArray(element.content.items)) {
                    element.content.items.forEach((item) => {
                      subContent += `• ${item}\n`
                    })
                    subContent += "\n"
                  }
                  break
              }
            })
            convertedSubsection.content = subContent.trim() || "Escriba aquí el contenido de esta subsección..."
          }

          return convertedSubsection
        })
      }

      return convertedSection
    })

    const currentDate = getCurrentDate()
    const newReport: Report = {
      id: Date.now().toString(),
      title: `${template.title || template.name} - Copia Editable`,
      sections: convertedSections,
      lastEdited: currentDate,
      createdAt: currentDate,
      status: "borrador",
      author: "Usuario Actual",
      department: "Departamento Actual",
    }

    console.log("📝 New editable report created from admin template:", newReport.sections)
    setCurrentReport(newReport)
    setActiveTab("editor")
    setIsEditing(true)
    setShowTemplateSelector(false)

    // Mostrar mensaje de éxito
    if (isHydrated) {
      toast({
        title: "Plantilla cargada",
        description: `Plantilla "${template.name}" lista para editar. Todos los contenidos son modificables.`,
        duration: 4000,
      })
    }
  }

  const handleEditReport = (reportId: string) => {
    const reportToEdit = savedReports.find((report) => report.id === reportId)
    if (reportToEdit) {
      setCurrentReport(reportToEdit)
      setActiveTab("editor")
      setIsEditing(true)
    }
  }

  const handleSaveReport = (reportData: any) => {
    if (!currentReport) return

    // Solo guardar si estamos en modo edición
    if (isEditing) {
      // Actualizar la fecha de edición
      const updatedReport = {
        ...currentReport,
        sections: reportData.sections || currentReport.sections,
        lastEdited: getCurrentDate(),
      }

      // Actualizar el informe en la lista de informes guardados
      setSavedReports((prevReports) => {
        const updatedReports = prevReports.map((report) => (report.id === updatedReport.id ? updatedReport : report))

        // Si es un nuevo informe, agregarlo a la lista
        if (!prevReports.some((report) => report.id === updatedReport.id)) {
          updatedReports.push(updatedReport)
        }

        return updatedReports
      })

      // Actualizar el reporte actual también
      setCurrentReport(updatedReport)

      console.log("Informe guardado con éxito:", updatedReport)
    }
  }

  const handleCancelEdit = () => {
    setCurrentReport(null)
    setActiveTab("create")
    setIsEditing(false)
  }

  const handleManualSave = () => {
    // Mostrar mensaje de éxito
    if (isHydrated) {
      toast({
        title: "Informe guardado",
        description: "El informe se ha guardado correctamente",
        duration: 3000,
      })
    }
    setCurrentReport(null)
    setActiveTab("create")
    setIsEditing(false)
  }

  // Función para manejar la navegación desde el sidebar
  const handleNavigate = (tab: string) => {
    // Si es export, navegar a la página específica
    if (tab === "export") {
      router.push("/staff/export")
      return
    }

    // Si estamos en el editor y tratamos de navegar a otra pestaña, primero cancelamos la edición
    if (currentReport && tab !== "editor") {
      setCurrentReport(null)
      setIsEditing(false)
    }
    setActiveTab(tab)
  }

  // Función para eliminar un informe
  const handleDeleteReport = (reportId: string) => {
    setSavedReports((prevReports) => prevReports.filter((report) => report.id !== reportId))

    if (isHydrated) {
      toast({
        title: "Informe eliminado",
        description: "El informe ha sido eliminado correctamente",
        duration: 3000,
      })
    }
  }

  // Mostrar un loading state hasta que se complete la hidratación
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <GlobalElementsProvider>
      <div className="min-h-screen flex">
        <StaffSidebar activeItem={activeTab} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Panel de Personal Administrativo</h1>
            <p className="text-gray-500">Cree y edite informes de gestión académica</p>
          </div>

          {activeTab === "profile" && <UserProfile role="Personal Administrativo" />}

          {activeTab === "create" && !currentReport && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-medium mb-4">Crear Nuevo Informe</h2>
                <p className="text-gray-600 mb-4">
                  Selecciona una plantilla creada por el administrador como punto de partida. Podrás editarla
                  completamente para crear tu informe personalizado.
                </p>
                <div className="flex items-center gap-4">
                  <Button onClick={handleCreateBlankReport} className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Seleccionar Plantilla
                  </Button>
                  <div className="text-sm text-gray-500">✓ Plantillas totalmente editables</div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-medium mb-4">Mis Informes</h2>
                <div className="grid gap-4">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded p-4 flex justify-between items-center hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <p>Creado: {report.createdAt}</p>
                          <p>Última edición: {report.lastEdited}</p>
                          <p>
                            Estado:{" "}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                report.status === "borrador"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {report.status === "borrador" ? "Borrador" : "Finalizado"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleEditReport(report.id)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Continuar edición
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar informe?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El informe "{report.title}" será eliminado
                                permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReport(report.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}

                  {savedReports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tienes informes guardados</p>
                      <p className="text-sm">Crea tu primer informe seleccionando una plantilla</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "editor" && currentReport && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">{currentReport.title}</h2>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button onClick={handleManualSave}>Guardar y Salir</Button>
                </div>
              </div>

              <ReportEditor
                initialSections={currentReport.sections}
                onSave={handleSaveReport}
                reportId={currentReport.id}
              />
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-blue-50">
                <h2 className="text-xl font-medium mb-2">Gestión de Plantillas</h2>
                <p className="text-gray-600">
                  Cree y edite plantillas personalizadas para sus informes. Las plantillas que cree aquí estarán
                  disponibles para todos los usuarios de su departamento.
                </p>
              </div>

              <TemplateEditor />
            </div>
          )}

          <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Seleccionar Plantilla de Administrador</DialogTitle>
              <DialogDescription>
                Selecciona una plantilla creada por el administrador. Podrás editarla completamente para crear tu
                informe personalizado.
              </DialogDescription>
              <AvailableTemplatesSelector
                onSelectTemplate={handleSelectTemplate}
                onCancel={() => setShowTemplateSelector(false)}
              />
            </DialogContent>
          </Dialog>

          <TemplateContentDebugger
            template={
              currentReport
                ? {
                    name: currentReport.title,
                    sections: currentReport.sections,
                  }
                : undefined
            }
            sections={currentReport?.sections}
          />
        </main>
      </div>
    </GlobalElementsProvider>
  )
}
