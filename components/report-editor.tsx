"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { WordLikeEditor } from "./word-like-editor"
import { GlobalElementsDebugger } from "./global-elements-debugger"
import { useGlobalElementsManager } from "@/hooks/use-global-elements"
import { Save, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Tipos para las secciones del reporte
type SectionType = "text" | "chart" | "table"

interface Section {
  id: string
  title: string
  content: string
  subsections?: Section[]
  parentId?: string | null
}

interface ReportEditorProps {
  initialSections?: Section[]
  initialContent?: string
  onSave?: (content: any) => void
  reportId: string
  readOnly?: boolean
  report?: any // Agregar el objeto completo del reporte
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  initialSections = [],
  initialContent = "",
  onSave,
  reportId,
  readOnly = false,
  report,
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections || [])
  const [activeSection, setActiveSection] = useState<string | null>(
    initialSections && initialSections.length > 0 ? initialSections[0].id : null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [actualReportId, setActualReportId] = useState<number | null>(null)
  const { setDebug } = useGlobalElementsManager()
  const { toast } = useToast()

  // Activar el modo de depuración al iniciar
  useEffect(() => {
    setDebug(true)
  }, [setDebug])

  // Función para establecer la sección activa por ID
  const setActiveSectionById = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
  }, [])

  // Función para actualizar el contenido de una sección o subsección
  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    console.log("📝 ReportEditor: Updating section content:", { sectionId, contentLength: content.length })

    setSections((prevSections) => {
      // Verificar si es una sección principal
      const sectionIndex = prevSections.findIndex((section) => section.id === sectionId)

      if (sectionIndex !== -1) {
        // Es una sección principal
        const updatedSections = [...prevSections]
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          content,
        }
        setHasUnsavedChanges(true)
        console.log("📝 ReportEditor: Section updated, marking as unsaved")
        return updatedSections
      } else {
        // Buscar en subsecciones
        const updated = prevSections.map((section) => {
          if (section.subsections) {
            const subsectionIndex = section.subsections.findIndex((sub) => sub.id === sectionId)
            if (subsectionIndex !== -1) {
              // Es una subsección
              const updatedSubsections = [...section.subsections]
              updatedSubsections[subsectionIndex] = {
                ...updatedSubsections[subsectionIndex],
                content,
              }
              setHasUnsavedChanges(true)
              console.log("📝 ReportEditor: Subsection updated, marking as unsaved")
              return {
                ...section,
                subsections: updatedSubsections,
              }
            }
          }
          return section
        })
        return updated
      }
    })
  }, [])

  // Función para agregar una nueva sección
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: `Nueva Sección ${sections ? sections.length + 1 : 1}`,
      content: "",
    }

    setSections((prevSections) => [...(prevSections || []), newSection])
    setActiveSection(newSection.id)
    setHasUnsavedChanges(true)
  }, [sections])

  // Función para eliminar una sección
  const deleteSection = useCallback(
    (sectionId: string) => {
      setSections((prevSections) => {
        const filteredSections = prevSections.filter((section) => section.id !== sectionId)

        // Si eliminamos la sección activa, activar otra
        if (activeSection === sectionId && filteredSections.length > 0) {
          setActiveSection(filteredSections[0].id)
        } else if (filteredSections.length === 0) {
          setActiveSection(null)
        }

        setHasUnsavedChanges(true)
        return filteredSections
      })
    },
    [activeSection],
  )

  // Función para iniciar la edición del título
  const startEditingTitle = useCallback((section: Section) => {
    setIsEditing(true)
    setEditTitle(section.title)
  }, [])

  // Función para guardar el título editado
  const saveTitle = useCallback(
    (sectionId: string) => {
      setSections((prevSections) =>
        prevSections.map((section) => (section.id === sectionId ? { ...section, title: editTitle } : section)),
      )
      setIsEditing(false)
      setHasUnsavedChanges(true)
    },
    [editTitle],
  )

  // Función para guardar todas las secciones (solo manual por ahora)
  const handleSave = useCallback(async () => {
    if (!reportId || reportId === "undefined") {
      toast({
        title: "Error",
        description: "ID de reporte inválido",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Por ahora, solo guardamos localmente hasta que se arregle el backend
      console.log("🔄 Guardando reporte localmente:", {
        reportIdOriginal: reportId,
        actualReportId: actualReportId,
        sectionsCount: sections.length,
      })

      // Simular guardado exitoso
      setHasUnsavedChanges(false)

      toast({
        title: "Éxito",
        description: "Cambios guardados localmente (pendiente de sincronización con servidor)",
      })

      // Llamar al callback si existe
      if (onSave) {
        onSave({
          sections: sections,
          content: content,
          reportId: actualReportId || reportId,
        })
      }
    } catch (error) {
      console.error("❌ Error al guardar el reporte:", error)
      toast({
        title: "Error",
        description: "Error al guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [sections, content, onSave, reportId, actualReportId, toast])

  // Función para agregar una subsección
  const addSubsection = useCallback((parentSectionId: string) => {
    const newSubsection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: `Nueva Subsección`,
      content: "",
      parentId: parentSectionId,
    }

    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === parentSectionId) {
          return {
            ...section,
            subsections: [...(section.subsections || []), newSubsection],
          }
        }
        return section
      })
    })

    setActiveSection(newSubsection.id)
    setHasUnsavedChanges(true)
  }, [])

  // Función para eliminar una subsección
  const deleteSubsection = useCallback(
    (parentId: string, subsectionId: string) => {
      setSections((prevSections) => {
        const updated = prevSections.map((section) => {
          if (section.id === parentId && section.subsections) {
            return {
              ...section,
              subsections: section.subsections.filter((sub) => sub.id !== subsectionId),
            }
          }
          return section
        })

        // Si eliminamos la subsección activa, activar la sección padre
        if (activeSection === subsectionId) {
          setActiveSection(parentId)
        }

        setHasUnsavedChanges(true)
        return updated
      })
    },
    [activeSection],
  )

  // Función para encontrar una sección o subsección por ID
  const findSectionById = useCallback(
    (sectionId: string): Section | null => {
      // Buscar en secciones principales
      const mainSection = sections.find((s) => s.id === sectionId)
      if (mainSection) return mainSection

      // Buscar en subsecciones
      for (const section of sections) {
        if (section.subsections) {
          const subsection = section.subsections.find((sub) => sub.id === sectionId)
          if (subsection) return subsection
        }
      }

      return null
    },
    [sections],
  )

  // Renderizar la sección activa
  const renderActiveSection = useCallback(() => {
    if (!activeSection) return null

    // Buscar la sección activa (puede ser una sección principal o una subsección)
    const section = findSectionById(activeSection)
    if (!section) return null

    const isSubsection = section.parentId !== undefined && section.parentId !== null

    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="mb-4 flex justify-between items-center">
          {isEditing && activeSection === section.id ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border p-2 rounded"
                autoFocus
              />
              <Button onClick={() => saveTitle(section.id)} size="sm">
                Guardar
              </Button>
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              {isSubsection && <span className="text-gray-500 mr-2">↳</span>}
              <h2
                className={`${isSubsection ? "text-lg" : "text-xl"} font-bold cursor-pointer hover:text-blue-600`}
                onClick={() => !readOnly && startEditingTitle(section)}
              >
                {section.title}
              </h2>
            </div>
          )}
        </div>

        <WordLikeEditor
          initialContent={section.content}
          onChange={(content) => updateSectionContent(section.id, content)}
          reportId={reportId}
          sectionId={section.id}
          readOnly={readOnly}
        />
      </div>
    )
  }, [
    activeSection,
    sections,
    isEditing,
    editTitle,
    reportId,
    updateSectionContent,
    saveTitle,
    startEditingTitle,
    findSectionById,
    readOnly,
  ])

  // Efecto para normalizar el template inicial si cambia
  useEffect(() => {
    if (initialSections && initialSections.length > 0 && sections.length === 0) {
      console.log("📋 ReportEditor: Setting initial sections:", initialSections.length)
      const sectionsWithContent = initialSections.map((section) => {
        console.log(`📄 Section: ${section.title}, Content length: ${section.content?.length || 0}`)
        return section
      })
      setSections(sectionsWithContent)
      if (sectionsWithContent.length > 0) {
        setActiveSection(sectionsWithContent[0].id)
      }
    }
  }, [initialSections])

  // Efecto para establecer el ID real del reporte si existe
  useEffect(() => {
    if (report && report.id && typeof report.id === "number") {
      setActualReportId(report.id)
    }
  }, [report])

  // Añadir una sección si no hay ninguna
  useEffect(() => {
    if (sections.length === 0 && !readOnly) {
      addSection()
    }
  }, [sections.length, addSection, readOnly])

  // Agregar después de los otros useEffect
  useEffect(() => {
    console.log("📋 ReportEditor: Sections changed, count:", sections.length)
    if (sections.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [sections])

  // DESHABILITAR AUTO-GUARDADO TEMPORALMENTE
  // useEffect(() => {
  //   if (hasUnsavedChanges && !readOnly) {
  //     const autoSaveTimer = setTimeout(() => {
  //       handleSave()
  //     }, 30000) // 30 segundos

  //     return () => clearTimeout(autoSaveTimer)
  //   }
  // }, [hasUnsavedChanges, handleSave, readOnly])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Editor de Informe</h1>
          {hasUnsavedChanges && !readOnly && (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Cambios sin guardar</span>
            </div>
          )}
          {actualReportId && <div className="text-sm text-gray-500">ID: {actualReportId}</div>}
        </div>
        <div className="space-x-2">
          {!readOnly && (
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Barra lateral con lista de secciones */}
        <div className="w-64 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Secciones</h2>
          {!readOnly && (
            <Button onClick={addSection} className="w-full mb-4">
              Añadir sección
            </Button>
          )}
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <div
                  className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                    activeSection === section.id ? "bg-blue-100" : "hover:bg-gray-200"
                  }`}
                >
                  <span className="flex-1 truncate" onClick={() => setActiveSectionById(section.id)}>
                    {section.title}
                  </span>
                  {!readOnly && (
                    <div className="flex items-center">
                      <Button
                        onClick={() => addSubsection(section.id)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-700"
                        title="Agregar subsección"
                      >
                        +
                      </Button>
                      <Button
                        onClick={() => deleteSection(section.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar sección"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                {/* Subsecciones */}
                {section.subsections && section.subsections.length > 0 && (
                  <ul className="pl-4 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <li
                        key={subsection.id}
                        className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                          activeSection === subsection.id ? "bg-blue-100" : "hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className="flex-1 truncate pl-2 border-l-2 border-gray-300"
                          onClick={() => setActiveSectionById(subsection.id)}
                        >
                          {subsection.title}
                        </span>
                        {!readOnly && (
                          <Button
                            onClick={() => deleteSubsection(section.id, subsection.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar subsección"
                          >
                            ×
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contenido de la sección activa */}
        <div className="flex-1">
          {activeSection ? (
            renderActiveSection()
          ) : (
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-center py-10">
                {readOnly
                  ? "No hay secciones disponibles para mostrar."
                  : "Selecciona una sección o crea una nueva para comenzar a editar."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Depurador de elementos globales */}
      <GlobalElementsDebugger />
    </div>
  )
}
