"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WordLikeEditor } from "./word-like-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Info,
  ChevronDown,
  ChevronUp,
  Save,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Accessibility,
  Code,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  validateContent,
  validateSection,
  createValidationRules,
  type ValidationRule,
  type ValidationResult,
} from "@/utils/content-validation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Definir los tipos para las secciones de la plantilla
interface TemplatePlaceholder {
  id: string
  type: "chart" | "text" | "table"
  label: string
  description: string
  required: boolean
  content?: string
  validationRules?: ValidationRule[]
  validationResult?: ValidationResult
}

interface TemplateSection {
  id: string
  title: string
  content: string
  editable: boolean
  placeholders?: TemplatePlaceholder[]
  validationRules?: ValidationRule[]
  validationResult?: ValidationResult
}

interface TemplateWithPlaceholdersProps {
  templateId: string
  templateName: string
  sections: TemplateSection[]
  onSave: (templateId: string, sections: TemplateSection[]) => void
}

export function TemplateWithPlaceholders({
  templateId,
  templateName,
  sections: initialSections,
  onSave,
}: TemplateWithPlaceholdersProps) {
  const [sections, setSections] = useState<TemplateSection[]>(() => {
    // Inicializar las reglas de validación para cada sección y placeholder
    return initialSections.map((section) => {
      // Crear reglas de validación para la sección si es editable
      const sectionWithValidation = {
        ...section,
        validationRules: section.editable ? createValidationRules("text", { minLength: 50 }) : undefined,
      }

      // Crear reglas de validación para cada placeholder
      if (sectionWithValidation.placeholders) {
        sectionWithValidation.placeholders = sectionWithValidation.placeholders.map((placeholder) => {
          let validationOptions

          switch (placeholder.type) {
            case "text":
              validationOptions = {
                minLength: 100,
                maxLength: 2000,
                keywords: ["análisis", "datos", "conclusión"],
              }
              break
            case "chart":
              validationOptions = {
                requiredExplanation: true,
              }
              break
            case "table":
              validationOptions = {
                minRows: 3,
                minCols: 3,
                requiresHeader: true,
              }
              break
          }

          return {
            ...placeholder,
            validationRules: createValidationRules(placeholder.type, validationOptions),
          }
        })
      }

      return sectionWithValidation
    })
  })

  const [activeSection, setActiveSection] = useState<string | null>(
    initialSections.length > 0 ? initialSections[0].id : null,
  )
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [validationResults, setValidationResults] = useState<{
    valid: boolean
    totalErrors: number
    totalWarnings: number
    totalInfo: number
    accessibilityScore: number
  }>({ valid: false, totalErrors: 0, totalWarnings: 0, totalInfo: 0, accessibilityScore: 100 })
  const [selectedIssue, setSelectedIssue] = useState<{
    message: string
    code?: string
    severity: "error" | "warning" | "info"
  } | null>(null)
  const firstRender = useRef(true)

  // Inicializar las secciones expandidas
  useEffect(() => {
    if (firstRender.current) {
      const expanded: Record<string, boolean> = {}
      initialSections.forEach((section) => {
        expanded[section.id] = true
      })
      setExpandedSections(expanded)
      firstRender.current = false

      // Validar todas las secciones al inicio
      validateAllSections()
    }
  }, [initialSections])

  // Función para validar todas las secciones
  const validateAllSections = () => {
    let totalErrors = 0
    let totalWarnings = 0
    let totalInfo = 0
    let isValid = true
    let lowestAccessibilityScore = 100

    const validatedSections = sections.map((section) => {
      const validationResult = validateSection(section)

      totalErrors += validationResult.errors.length
      totalWarnings += validationResult.warnings.length
      totalInfo += validationResult.info.length

      if (validationResult.accessibilityScore !== undefined) {
        lowestAccessibilityScore = Math.min(lowestAccessibilityScore, validationResult.accessibilityScore)
      }

      if (!validationResult.valid) {
        isValid = false
      }

      return {
        ...section,
        validationResult,
        placeholders: section.placeholders?.map((placeholder) => {
          if (placeholder.validationRules) {
            const placeholderValidation = validateContent(placeholder.content || "", placeholder.validationRules)
            return {
              ...placeholder,
              validationResult: placeholderValidation,
            }
          }
          return placeholder
        }),
      }
    })

    setSections(validatedSections)
    setValidationResults({
      valid: isValid,
      totalErrors,
      totalWarnings,
      totalInfo,
      accessibilityScore: lowestAccessibilityScore,
    })

    return isValid
  }

  // Función para actualizar el contenido de una sección
  const updateSectionContent = (sectionId: string, content: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          // Validar el nuevo contenido
          const validationResult = section.validationRules
            ? validateContent(content, section.validationRules)
            : undefined

          return {
            ...section,
            content,
            validationResult,
          }
        }
        return section
      }),
    )

    // Configurar autoguardado
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      handleSave()
    }, 2000)

    setAutoSaveTimer(timer)
  }

  // Función para actualizar el contenido de un placeholder
  const updatePlaceholderContent = (sectionId: string, placeholderId: string, content: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId && section.placeholders) {
          return {
            ...section,
            placeholders: section.placeholders.map((placeholder) => {
              if (placeholder.id === placeholderId) {
                // Validar el nuevo contenido
                const validationResult = placeholder.validationRules
                  ? validateContent(content, placeholder.validationRules)
                  : undefined

                return {
                  ...placeholder,
                  content,
                  validationResult,
                }
              }
              return placeholder
            }),
          }
        }
        return section
      }),
    )

    // Configurar autoguardado
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      handleSave()
    }, 2000)

    setAutoSaveTimer(timer)
  }

  // Función para guardar la plantilla
  const handleSave = async () => {
    // Validar todas las secciones antes de guardar
    const isValid = validateAllSections()

    setIsSaving(true)
    try {
      await onSave(templateId, sections)
    } catch (error) {
      console.error("Error al guardar la plantilla:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Función para alternar la expansión de una sección
  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Renderizar indicador de estado de validación
  const renderValidationStatus = (validationResult?: ValidationResult) => {
    if (!validationResult) return null

    return (
      <div className="flex items-center gap-2">
        {/* Indicador de accesibilidad */}
        {validationResult.accessibilityScore !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Accessibility
                    className={`h-4 w-4 ${getAccessibilityScoreColor(validationResult.accessibilityScore)} mr-1`}
                  />
                  <span className={`text-xs ${getAccessibilityScoreColor(validationResult.accessibilityScore)}`}>
                    {validationResult.accessibilityScore}%
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Puntuación de accesibilidad: {validationResult.accessibilityScore}%</p>
                <p className="text-xs mt-1">{getAccessibilityScoreDescription(validationResult.accessibilityScore)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Indicador de errores */}
        {validationResult.errors.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">{validationResult.errors.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="text-xs space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-red-500 cursor-pointer hover:underline"
                      onClick={() => setSelectedIssue(error)}
                    >
                      {error.message}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Indicador de advertencias */}
        {validationResult.warnings.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-xs text-amber-500">{validationResult.warnings.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="text-xs space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-amber-500 cursor-pointer hover:underline"
                      onClick={() => setSelectedIssue(warning)}
                    >
                      {warning.message}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Indicador de validez */}
        {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500">Válido</span>
          </div>
        )}
      </div>
    )
  }

  // Función para obtener el color según la puntuación de accesibilidad
  const getAccessibilityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  // Función para obtener la descripción según la puntuación de accesibilidad
  const getAccessibilityScoreDescription = (score: number) => {
    if (score >= 90) return "Excelente accesibilidad"
    if (score >= 80) return "Buena accesibilidad"
    if (score >= 70) return "Accesibilidad aceptable"
    if (score >= 50) return "Accesibilidad deficiente"
    return "Accesibilidad crítica - Requiere correcciones urgentes"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{templateName}</h1>
          <p className="text-gray-500">Complete las secciones requeridas para finalizar el informe</p>
        </div>
        <div className="space-x-2 flex items-center">
          {/* Resumen de validación */}
          <div className="flex items-center gap-3 mr-4 bg-gray-100 p-2 rounded-md">
            {/* Puntuación de accesibilidad */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 border-${
                      validationResults.accessibilityScore >= 90
                        ? "green"
                        : validationResults.accessibilityScore >= 70
                          ? "amber"
                          : "red"
                    }-500 text-${
                      validationResults.accessibilityScore >= 90
                        ? "green"
                        : validationResults.accessibilityScore >= 70
                          ? "amber"
                          : "red"
                    }-700`}
                  >
                    <Accessibility className="h-3 w-3" />
                    {validationResults.accessibilityScore}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-2">
                    <p>Puntuación de accesibilidad: {validationResults.accessibilityScore}%</p>
                    <Progress value={validationResults.accessibilityScore} className="h-2" />
                    <p className="text-xs">{getAccessibilityScoreDescription(validationResults.accessibilityScore)}</p>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Ver detalles de accesibilidad
                      </Button>
                    </DialogTrigger>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {validationResults.totalErrors > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {validationResults.totalErrors} errores
              </Badge>
            )}

            {validationResults.totalWarnings > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                {validationResults.totalWarnings} advertencias
              </Badge>
            )}

            {validationResults.totalErrors === 0 && validationResults.totalWarnings === 0 && (
              <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Contenido válido
              </Badge>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || validationResults.totalErrors > 0}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Diálogo para mostrar detalles de accesibilidad */}
      <Dialog>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Análisis de Accesibilidad
            </DialogTitle>
            <DialogDescription>Evaluación de accesibilidad según estándares WCAG 2.1</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Puntuación global: {validationResults.accessibilityScore}%</h3>
                <p className="text-sm text-gray-500">
                  {getAccessibilityScoreDescription(validationResults.accessibilityScore)}
                </p>
              </div>
              <div className="w-32">
                <Progress
                  value={validationResults.accessibilityScore}
                  className={`h-3 ${
                    validationResults.accessibilityScore >= 90
                      ? "bg-green-100"
                      : validationResults.accessibilityScore >= 70
                        ? "bg-amber-100"
                        : "bg-red-100"
                  }`}
                />
              </div>
            </div>

            <Tabs defaultValue="issues">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="issues">Problemas detectados</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                <TabsTrigger value="resources">Recursos</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-4">
                {sections.flatMap((section) => {
                  const accessibilityIssues = []

                  // Problemas de accesibilidad de la sección
                  if (section.validationResult?.warnings) {
                    const accessWarnings = section.validationResult.warnings.filter((w) =>
                      w.ruleId.startsWith("accessibility-"),
                    )

                    if (accessWarnings.length > 0) {
                      accessibilityIssues.push(
                        <Card key={`section-${section.id}`}>
                          <CardHeader>
                            <CardTitle className="text-base">{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {accessWarnings.map((warning, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm">{warning.message}</p>
                                    {warning.code && (
                                      <div className="mt-1 relative">
                                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-20">
                                          <code>{warning.code}</code>
                                        </pre>
                                        <div className="absolute top-2 right-2">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                  <Code className="h-3 w-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Ver código completo</TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>,
                      )
                    }
                  }

                  // Problemas de accesibilidad de los placeholders
                  if (section.placeholders) {
                    section.placeholders.forEach((placeholder) => {
                      if (placeholder.validationResult?.warnings) {
                        const accessWarnings = placeholder.validationResult.warnings.filter((w) =>
                          w.ruleId.startsWith("accessibility-"),
                        )

                        if (accessWarnings.length > 0) {
                          accessibilityIssues.push(
                            <Card key={`placeholder-${section.id}-${placeholder.id}`}>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  {section.title} - {placeholder.label}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {accessWarnings.map((warning, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm">
                                          {warning.message.replace(`${placeholder.label}: `, "")}
                                        </p>
                                        {warning.code && (
                                          <div className="mt-1 relative">
                                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-20">
                                              <code>{warning.code}</code>
                                            </pre>
                                            <div className="absolute top-2 right-2">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                      <Code className="h-3 w-3" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Ver código completo</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>,
                          )
                        }
                      }
                    })
                  }

                  return accessibilityIssues
                })}

                {sections.every(
                  (section) =>
                    (!section.validationResult?.warnings ||
                      !section.validationResult.warnings.some((w) => w.ruleId.startsWith("accessibility-"))) &&
                    (!section.placeholders ||
                      section.placeholders.every(
                        (p) =>
                          !p.validationResult?.warnings ||
                          !p.validationResult.warnings.some((w) => w.ruleId.startsWith("accessibility-")),
                      )),
                ) && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>¡Excelente!</AlertTitle>
                    <AlertDescription>No se han detectado problemas de accesibilidad en el contenido.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendaciones generales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Imágenes</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Proporcione texto alternativo (alt) descriptivo para todas las imágenes informativas</li>
                        <li>Use alt="" para imágenes decorativas</li>
                        <li>
                          Evite texto en imágenes; si es necesario, asegúrese de que ese texto esté incluido en el alt
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Estructura</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Use encabezados (h1-h6) de forma jerárquica y secuencial</li>
                        <li>Utilice elementos semánticos como main, article, section, etc.</li>
                        <li>Estructure las listas con ul/ol y li</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Enlaces</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Use texto descriptivo para los enlaces (evite "haga clic aquí" o "más")</li>
                        <li>Indique cuando un enlace se abre en una nueva ventana</li>
                        <li>Asegúrese de que los enlaces sean distinguibles del texto normal</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Tablas</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Use caption para describir el propósito de la tabla</li>
                        <li>Utilice th con scope="col" para encabezados de columna</li>
                        <li>Utilice th con scope="row" para encabezados de fila</li>
                        <li>Evite tablas complejas con celdas combinadas</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recursos de accesibilidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="https://www.w3.org/WAI/WCAG21/quickref/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="mr-2">Guía rápida de WCAG 2.1</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5V4ZM7 4.5V4C6.72386 4 6.5 4.22386 6.5 4.5H7ZM7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5H7ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM2.5 5H7V4H2.5V5ZM6.5 4.5V9.5H7.5V4.5H6.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://webaim.org/techniques/tables/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="mr-2">WebAIM: Tablas accesibles</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5V4ZM7 4.5V4C6.72386 4 6.5 4.22386 6.5 4.5H7ZM7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5H7ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM2.5 5H7V4H2.5V5ZM6.5 4.5V9.5H7.5V4.5H6.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://webaim.org/techniques/images/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="mr-2">WebAIM: Imágenes accesibles</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5V4ZM7 4.5V4C6.72386 4 6.5 4.22386 6.5 4.5H7ZM7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5H7ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM2.5 5H7V4H2.5V5ZM6.5 4.5V9.5H7.5V4.5H6.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://webaim.org/techniques/semanticstructure/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="mr-2">WebAIM: Estructura semántica</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5V4ZM7 4.5V4C6.72386 4 6.5 4.22386 6.5 4.5H7ZM7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5H7ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM2.5 5H7V4H2.5V5ZM6.5 4.5V9.5H7.5V4.5H6.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://wave.webaim.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="mr-2">WAVE - Herramienta de evaluación de accesibilidad web</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5V4ZM7 4.5V4C6.72386 4 6.5 4.22386 6.5 4.5H7ZM7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5H7ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM2.5 5H7V4H2.5V5ZM6.5 4.5V9.5H7.5V4.5H6.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline">Cerrar</Button>
            <Button>Aplicar correcciones automáticas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar detalles de un problema */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedIssue.severity === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                {selectedIssue.severity === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {selectedIssue.severity === "info" && <Info className="h-5 w-5 text-blue-500" />}
                Detalle del problema
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p>{selectedIssue.message}</p>

              {selectedIssue.code && (
                <div className="relative">
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                    <code>{selectedIssue.code}</code>
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Sugerencia de corrección</h4>
                <p className="text-sm text-blue-700">
                  {selectedIssue.message.includes("Imagen sin texto alternativo") &&
                    'Añada un atributo alt descriptivo a la imagen. Por ejemplo: <img src="grafico.png" alt="Gráfico de rendimiento académico por trimestre">'}
                  {selectedIssue.message.includes("Encabezado vacío") &&
                    "Añada texto descriptivo al encabezado para indicar el propósito de la sección."}
                  {selectedIssue.message.includes("Enlace sin texto") &&
                    "Añada texto descriptivo al enlace que indique su propósito o destino."}
                  {selectedIssue.message.includes("Tabla sin caption") &&
                    "Añada un elemento <caption> que describa el propósito de la tabla. Por ejemplo: <caption>Resultados académicos por asignatura</caption>"}
                  {selectedIssue.message.includes("Encabezados de tabla sin atributo scope") &&
                    'Añada scope="col" a los encabezados de columna y scope="row" a los encabezados de fila.'}
                  {!selectedIssue.message.includes("Imagen sin texto alternativo") &&
                    !selectedIssue.message.includes("Encabezado vacío") &&
                    !selectedIssue.message.includes("Enlace sin texto") &&
                    !selectedIssue.message.includes("Tabla sin caption") &&
                    !selectedIssue.message.includes("Encabezados de tabla sin atributo scope") &&
                    "Revise el código y aplique las correcciones sugeridas según las pautas de accesibilidad WCAG 2.1."}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Cerrar
              </Button>
              <Button>Aplicar corrección</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {validationResults.totalErrors > 0 && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Errores de validación</AlertTitle>
          <AlertDescription>
            <p>Hay {validationResults.totalErrors} errores que deben corregirse antes de guardar:</p>
            <ul className="mt-2 list-disc list-inside">
              {sections.flatMap((section) => {
                const errors = []

                // Errores de la sección
                if (section.validationResult?.errors.length) {
                  errors.push(
                    <li
                      key={`section-${section.id}`}
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        setActiveSection(section.id)
                        setExpandedSections((prev) => ({ ...prev, [section.id]: true }))
                      }}
                    >
                      <strong>{section.title}:</strong>{" "}
                      {section.validationResult.errors.map((e) => e.message).join(", ")}
                    </li>,
                  )
                }

                // Errores de los placeholders
                if (section.placeholders) {
                  section.placeholders.forEach((placeholder) => {
                    if (placeholder.validationResult?.errors.length) {
                      errors.push(
                        <li
                          key={`placeholder-${section.id}-${placeholder.id}`}
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setActiveSection(section.id)
                            setExpandedSections((prev) => ({ ...prev, [section.id]: true }))
                          }}
                        >
                          <strong>
                            {section.title} - {placeholder.label}:
                          </strong>{" "}
                          {placeholder.validationResult.errors.map((e) => e.message).join(", ")}
                        </li>,
                      )
                    }
                  })
                }

                return errors
              })}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => (
          <Collapsible
            key={section.id}
            open={expandedSections[section.id]}
            onOpenChange={() => toggleSectionExpansion(section.id)}
            className="border rounded-lg overflow-hidden"
          >
            <div
              className={`p-4 flex justify-between items-center cursor-pointer ${
                section.validationResult?.errors.length
                  ? "bg-red-50"
                  : section.validationResult?.warnings.length
                    ? "bg-amber-50"
                    : "bg-gray-50"
              }`}
              onClick={() => toggleSectionExpansion(section.id)}
            >
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="ml-3">{renderValidationStatus(section.validationResult)}</div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="p-4">
                {/* Contenido de la sección (no editable) */}
                {!section.editable && (
                  <div
                    className="prose max-w-none mb-4 p-4 bg-gray-50 rounded-md"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}

                {/* Contenido de la sección (editable) */}
                {section.editable && (
                  <div className="mb-4">
                    <WordLikeEditor
                      initialContent={section.content}
                      onChange={(content) => updateSectionContent(section.id, content)}
                      reportId={templateId}
                      sectionId={section.id}
                    />

                    {/* Mostrar errores de validación */}
                    {section.validationResult && section.validationResult.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {section.validationResult.errors.map((error, index) => (
                            <li
                              key={index}
                              className="cursor-pointer hover:underline"
                              onClick={() => setSelectedIssue(error)}
                            >
                              {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mostrar advertencias de validación */}
                    {section.validationResult && section.validationResult.warnings.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm font-medium text-amber-800">Recomendaciones:</p>
                        <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                          {section.validationResult.warnings.map((warning, index) => (
                            <li
                              key={index}
                              className="cursor-pointer hover:underline"
                              onClick={() => setSelectedIssue(warning)}
                            >
                              {warning.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Placeholders para completar */}
                {section.placeholders && section.placeholders.length > 0 && (
                  <div className="space-y-6 mt-4">
                    {section.placeholders.map((placeholder) => (
                      <Card
                        key={placeholder.id}
                        className={
                          placeholder.validationResult?.errors.length
                            ? "border-red-300"
                            : placeholder.validationResult?.warnings.length
                              ? "border-amber-300"
                              : ""
                        }
                      >
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              {placeholder.label}
                              {placeholder.required && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Requerido
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div>{renderValidationStatus(placeholder.validationResult)}</div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 mb-4">{placeholder.description}</p>

                          {placeholder.type === "text" && (
                            <div>
                              <WordLikeEditor
                                initialContent={placeholder.content || ""}
                                onChange={(content) => updatePlaceholderContent(section.id, placeholder.id, content)}
                                reportId={templateId}
                                sectionId={`${section.id}-${placeholder.id}`}
                                placeholder="Escriba aquí la explicación..."
                              />

                              {/* Mostrar errores de validación */}
                              {placeholder.validationResult && placeholder.validationResult.errors.length > 0 && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                    {placeholder.validationResult.errors.map((error, index) => (
                                      <li
                                        key={index}
                                        className="cursor-pointer hover:underline"
                                        onClick={() => setSelectedIssue(error)}
                                      >
                                        {error.message}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Mostrar advertencias de validación */}
                              {placeholder.validationResult && placeholder.validationResult.warnings.length > 0 && (
                                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                  <p className="text-sm font-medium text-amber-800">Recomendaciones:</p>
                                  <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                                    {placeholder.validationResult.warnings.map((warning, index) => (
                                      <li
                                        key={index}
                                        className="cursor-pointer hover:underline"
                                        onClick={() => setSelectedIssue(warning)}
                                      >
                                        {warning.message}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {placeholder.type === "chart" && (
                            <div className="space-y-4">
                              <div
                                className={`p-4 rounded-md text-center ${
                                  placeholder.validationResult?.errors.length ? "bg-red-50" : "bg-gray-100"
                                }`}
                              >
                                <p className="text-gray-500 mb-2">Inserte un gráfico aquí</p>
                                <WordLikeEditor
                                  initialContent={placeholder.content || ""}
                                  onChange={(content) => updatePlaceholderContent(section.id, placeholder.id, content)}
                                  reportId={templateId}
                                  sectionId={`${section.id}-${placeholder.id}`}
                                  placeholder="Utilice el botón de gráfico en la barra de herramientas para insertar un gráfico..."
                                />

                                {/* Mostrar errores de validación */}
                                {placeholder.validationResult && placeholder.validationResult.errors.length > 0 && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                      {placeholder.validationResult.errors.map((error, index) => (
                                        <li
                                          key={index}
                                          className="cursor-pointer hover:underline"
                                          onClick={() => setSelectedIssue(error)}
                                        >
                                          {error.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Mostrar advertencias de validación */}
                                {placeholder.validationResult && placeholder.validationResult.warnings.length > 0 && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                    <p className="text-sm font-medium text-amber-800">Recomendaciones:</p>
                                    <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                                      {placeholder.validationResult.warnings.map((warning, index) => (
                                        <li
                                          key={index}
                                          className="cursor-pointer hover:underline"
                                          onClick={() => setSelectedIssue(warning)}
                                        >
                                          {warning.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {placeholder.type === "table" && (
                            <div className="space-y-4">
                              <div
                                className={`p-4 rounded-md text-center ${
                                  placeholder.validationResult?.errors.length ? "bg-red-50" : "bg-gray-100"
                                }`}
                              >
                                <p className="text-gray-500 mb-2">Inserte una tabla aquí</p>
                                <WordLikeEditor
                                  initialContent={placeholder.content || ""}
                                  onChange={(content) => updatePlaceholderContent(section.id, placeholder.id, content)}
                                  reportId={templateId}
                                  sectionId={`${section.id}-${placeholder.id}`}
                                  placeholder="Utilice el botón de tabla en la barra de herramientas para insertar una tabla..."
                                />

                                {/* Mostrar errores de validación */}
                                {placeholder.validationResult && placeholder.validationResult.errors.length > 0 && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                      {placeholder.validationResult.errors.map((error, index) => (
                                        <li
                                          key={index}
                                          className="cursor-pointer hover:underline"
                                          onClick={() => setSelectedIssue(error)}
                                        >
                                          {error.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Mostrar advertencias de validación */}
                                {placeholder.validationResult && placeholder.validationResult.warnings.length > 0 && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                    <p className="text-sm font-medium text-amber-800">Recomendaciones:</p>
                                    <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                                      {placeholder.validationResult.warnings.map((warning, index) => (
                                        <li
                                          key={index}
                                          className="cursor-pointer hover:underline"
                                          onClick={() => setSelectedIssue(warning)}
                                        >
                                          {warning.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
