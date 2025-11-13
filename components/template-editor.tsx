"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  FileText,
  BarChart2,
  ClipboardList,
  Award,
  BookOpen,
  Users,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Template } from "./template-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Plantillas predefinidas iniciales
const initialTemplates: Template[] = [
  {
    id: "informe-semestral",
    title: "Informe Semestral",
    description: "Plantilla estándar para informes de fin de semestre académico",
    icon: FileText,
    category: "académico",
    sections: [
      {
        id: "section-1",
        title: "Resumen Ejecutivo",
        level: 1,
        content: "<p>Este informe presenta los resultados y logros alcanzados durante el semestre académico.</p>",
        type: "text",
        required: true,
        subsections: [],
      },
      {
        id: "section-2",
        title: "Indicadores Académicos",
        level: 1,
        content: "",
        type: "table",
        required: true,
        tableData: {
          headers: ["Indicador", "Valor Actual", "Meta", "% Cumplimiento"],
          rows: [
            ["Tasa de Aprobación", "85%", "90%", "94%"],
            ["Promedio General", "4.2/5.0", "4.5/5.0", "93%"],
          ],
        },
        subsections: [],
      },
    ],
  },
  {
    id: "informe-anual",
    title: "Informe Anual",
    description: "Reporte completo de actividades y resultados del año académico",
    icon: BookOpen,
    category: "académico",
    sections: [
      {
        id: "section-1",
        title: "Resumen Ejecutivo",
        level: 1,
        content:
          "<p>El presente informe anual resume las actividades, logros y desafíos enfrentados durante el año académico.</p>",
        type: "text",
        required: true,
        subsections: [],
      },
    ],
  },
]

// Iconos disponibles para las plantillas
const availableIcons = [
  { name: "FileText", icon: FileText },
  { name: "BarChart2", icon: BarChart2 },
  { name: "ClipboardList", icon: ClipboardList },
  { name: "Award", icon: Award },
  { name: "BookOpen", icon: BookOpen },
  { name: "Users", icon: Users },
]

export function TemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [sections, setSections] = useState<any[]>([])
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    title: "",
    description: "",
    category: "académico",
    icon: FileText,
    sections: [],
  })

  // Función para seleccionar una plantilla para editar
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setSections([...template.sections])
    setActiveTab("editor")
  }

  // Función para crear una nueva plantilla
  const handleCreateTemplate = () => {
    const templateId = `template-${Date.now()}`
    const template: Template = {
      id: templateId,
      title: newTemplate.title || "Nueva Plantilla",
      description: newTemplate.description || "Descripción de la plantilla",
      icon: newTemplate.icon || FileText,
      category: (newTemplate.category as "académico" | "administrativo" | "evaluación") || "académico",
      sections: [],
    }

    setTemplates([...templates, template])
    setSelectedTemplate(template)
    setSections([])
    setActiveTab("editor")
    setShowNewTemplateDialog(false)
    setNewTemplate({
      title: "",
      description: "",
      category: "académico",
      icon: FileText,
      sections: [],
    })
  }

  // Función para eliminar una plantilla
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((template) => template.id !== templateId))
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
      setSections([])
      setActiveTab("templates")
    }
  }

  // Función para guardar los cambios en la plantilla
  const handleSaveTemplate = () => {
    if (!selectedTemplate) return

    const updatedTemplate = {
      ...selectedTemplate,
      sections: sections,
    }

    setTemplates(templates.map((template) => (template.id === selectedTemplate.id ? updatedTemplate : template)))

    setActiveTab("templates")
    setSelectedTemplate(null)
  }

  // Funciones para manejar el drag and drop de secciones
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSections(items)
  }

  // Función para añadir una sección
  const addSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}-${Date.now()}`,
      title: "Nueva Sección",
      level: 1,
      content: "<p>Contenido de la sección...</p>",
      type: "text",
      required: false,
      subsections: [],
    }
    setSections([...sections, newSection])
  }

  // Función para añadir una sección de tabla
  const addTableSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}-${Date.now()}`,
      title: "Nueva Tabla",
      level: 1,
      content: "",
      type: "table",
      required: false,
      tableData: {
        headers: ["Columna 1", "Columna 2", "Columna 3"],
        rows: [
          ["Dato 1", "Dato 2", "Dato 3"],
          ["Dato 4", "Dato 5", "Dato 6"],
        ],
      },
      subsections: [],
    }
    setSections([...sections, newSection])
  }

  // Función para añadir una sección de gráfico
  const addChartSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}-${Date.now()}`,
      title: "Nuevo Gráfico",
      level: 1,
      content: "<p>Descripción del gráfico...</p>",
      type: "chart",
      chartType: "bar",
      required: false,
      subsections: [],
    }
    setSections([...sections, newSection])
  }

  // Función para eliminar una sección
  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id))
  }

  // Función para actualizar el título de una sección
  const updateSectionTitle = (id: string, title: string) => {
    setSections(sections.map((section) => (section.id === id ? { ...section, title } : section)))
  }

  // Función para actualizar el contenido de una sección
  const updateSectionContent = (id: string, content: string) => {
    setSections(sections.map((section) => (section.id === id ? { ...section, content } : section)))
  }

  // Función para actualizar si una sección es requerida
  const toggleRequired = (id: string) => {
    setSections(sections.map((section) => (section.id === id ? { ...section, required: !section.required } : section)))
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedTemplate}>
            Editor de Plantilla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Plantillas</CardTitle>
                <CardDescription>Administre las plantillas disponibles para los informes</CardDescription>
              </div>
              <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                    <DialogDescription>Complete la información básica para crear una nueva plantilla</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={newTemplate.title || ""}
                        onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                        placeholder="Título de la plantilla"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newTemplate.description || ""}
                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        placeholder="Breve descripción de la plantilla"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newTemplate.category || "académico"}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value as any })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="académico">Académico</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                          <SelectItem value="evaluación">Evaluación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icono</Label>
                      <Select
                        value={
                          newTemplate.icon ? availableIcons.find((i) => i.icon === newTemplate.icon)?.name : "FileText"
                        }
                        onValueChange={(value) => {
                          const selectedIcon = availableIcons.find((i) => i.name === value)?.icon
                          setNewTemplate({ ...newTemplate, icon: selectedIcon })
                        }}
                      >
                        <SelectTrigger id="icon">
                          <SelectValue placeholder="Seleccione un icono" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center gap-2">
                                <icon.icon className="h-4 w-4" />
                                {icon.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate}>Crear Plantilla</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="mt-2">{template.description}</CardDescription>
                        <div className="mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{template.category}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="text-sm text-gray-500">{template.sections.length} secciones</div>
                      </CardContent>
                      <div className="p-3 pt-0">
                        <Button variant="outline" className="w-full" onClick={() => handleSelectTemplate(template)}>
                          Editar Plantilla
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          {selectedTemplate && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Editor de Plantilla: {selectedTemplate.title}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("templates")}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Plantilla
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={addSection}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Sección de Texto
                      </Button>
                      <Button onClick={addTableSection}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Tabla
                      </Button>
                      <Button onClick={addChartSection}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Gráfico
                      </Button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="sections">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {sections.map((section, index) => (
                              <Draggable key={section.id} draggableId={section.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="border rounded-lg p-4 bg-white"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div {...provided.dragHandleProps} className="cursor-move">
                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                      </div>

                                      <div className="flex-1">
                                        <Input
                                          value={section.title}
                                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                          className="font-medium mb-2"
                                          placeholder="Título de la sección"
                                        />

                                        {section.type === "text" && (
                                          <Textarea
                                            value={section.content}
                                            onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                            className="min-h-[100px]"
                                            placeholder="Contenido predeterminado de la sección..."
                                          />
                                        )}

                                        {section.type === "table" && (
                                          <div className="border rounded p-2 bg-gray-50">
                                            <p className="text-sm text-gray-500 mb-2">
                                              Tabla: {section.tableData.headers.join(", ")}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                              {section.tableData.rows.length} filas de datos predefinidos
                                            </p>
                                          </div>
                                        )}

                                        {section.type === "chart" && (
                                          <div className="border rounded p-2 bg-gray-50">
                                            <p className="text-sm text-gray-500 mb-2">
                                              Gráfico tipo: {section.chartType}
                                            </p>
                                            <Textarea
                                              value={section.content}
                                              onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                              className="min-h-[60px]"
                                              placeholder="Descripción del gráfico..."
                                            />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={section.required}
                                            onChange={() => toggleRequired(section.id)}
                                            className="rounded border-gray-300"
                                          />
                                          Obligatorio
                                        </label>

                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeSection(section.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Eliminar</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa de la Plantilla</CardTitle>
                  <CardDescription>Así se verá la estructura del informe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-bold">Tabla de Contenido</h3>
                      <ul className="mt-2 space-y-1">
                        {sections.map((section, index) => (
                          <li key={section.id} className="flex items-center gap-2">
                            <span className="text-gray-500">{index + 1}.</span>
                            <span>{section.title}</span>
                            {section.required && <span className="text-xs text-gray-500">(Obligatorio)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {sections.map((section, index) => (
                      <div key={section.id} className="space-y-2">
                        <h3 className="text-lg font-bold">
                          {index + 1}. {section.title}
                        </h3>
                        {section.type === "text" && (
                          <div className="border border-dashed rounded-lg p-4 bg-gray-50">
                            <div dangerouslySetInnerHTML={{ __html: section.content }} />
                          </div>
                        )}
                        {section.type === "table" && (
                          <div className="border border-dashed rounded-lg p-4 bg-gray-50">
                            <p className="text-gray-400 mb-2">Tabla: {section.tableData.headers.join(" | ")}</p>
                            <div className="text-gray-400 text-center">Contenido de la tabla</div>
                          </div>
                        )}
                        {section.type === "chart" && (
                          <div className="border border-dashed rounded-lg p-4 bg-gray-50">
                            <p className="text-gray-400 mb-2">Gráfico tipo: {section.chartType}</p>
                            <div className="text-gray-400 text-center">Visualización del gráfico</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
