"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { RefreshCw, Eye, AlertTriangle, CheckCircle } from "lucide-react"

export function TemplateAvailabilityDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      console.log("🔍 Running template availability diagnostic...")

      // 1. Verificar conexión API
      const connectionTest = await apiService.testConnection()
      console.log("🌐 Connection test:", connectionTest)

      // 2. Obtener todas las plantillas (sin filtros)
      const allTemplatesResponse = await apiService.getTemplates({ enhanced: true })
      console.log("📋 All templates response:", allTemplatesResponse)

      // 3. Obtener plantillas disponibles para reportes
      const availableTemplatesResponse = await apiService.getAvailableTemplatesForReports()
      console.log("📋 Available templates response:", availableTemplatesResponse)

      // 4. Obtener información del usuario actual
      const currentUser = apiService.getCurrentUser()
      console.log("👤 Current user:", currentUser)

      // 5. Analizar cada plantilla individualmente
      const templateAnalysis = []
      if (allTemplatesResponse.results) {
        for (const template of allTemplatesResponse.results) {
          try {
            // Obtener detalles completos de la plantilla
            const templateDetails = await apiService.getTemplate(template.id, true)

            const analysis = {
              id: template.id,
              name: template.name,
              created_by_role: template.created_by_name ? "admin" : "unknown",
              is_public: template.is_public,
              is_active: template.is_active,
              sections_count: template.sections?.length || 0,
              has_elements: false,
              total_elements: 0,
              should_be_available: false,
              error: null,
            }

            // Contar elementos
            if (templateDetails.sections) {
              for (const section of templateDetails.sections) {
                if (section.elements) {
                  analysis.total_elements += section.elements.length
                  if (section.elements.length > 0) {
                    analysis.has_elements = true
                  }
                }
                if (section.subsections) {
                  for (const subsection of section.subsections) {
                    if (subsection.elements) {
                      analysis.total_elements += subsection.elements.length
                      if (subsection.elements.length > 0) {
                        analysis.has_elements = true
                      }
                    }
                  }
                }
              }
            }

            // Determinar si debería estar disponible
            if (currentUser?.role === "staff") {
              analysis.should_be_available =
                (template.created_by_name && template.is_public) || // Plantillas públicas del admin
                template.created_by === currentUser.id // Sus propias plantillas
            } else if (currentUser?.role === "admin") {
              analysis.should_be_available = template.is_active
            } else if (currentUser?.role === "committee") {
              analysis.should_be_available = template.is_public && template.is_active
            }

            templateAnalysis.push(analysis)
          } catch (error) {
            templateAnalysis.push({
              id: template.id,
              name: template.name,
              error: error instanceof Error ? error.message : "Unknown error",
            })
          }
        }
      }

      setDebugInfo({
        connection: connectionTest,
        currentUser,
        allTemplates: {
          count: allTemplatesResponse.count || 0,
          results: allTemplatesResponse.results || [],
        },
        availableTemplates: {
          count: availableTemplatesResponse.count || 0,
          results: availableTemplatesResponse.results || [],
        },
        templateAnalysis,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("❌ Diagnostic error:", error)
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Ejecutando diagnóstico...</p>
        </CardContent>
      </Card>
    )
  }

  if (!debugInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={runDiagnostic}>Ejecutar Diagnóstico</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Diagnóstico de Disponibilidad de Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostic} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar Diagnóstico
          </Button>

          {debugInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Error en el diagnóstico
              </div>
              <p className="text-red-600">{debugInfo.error}</p>
            </div>
          )}

          {/* Información del usuario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Usuario Actual</h3>
            <div className="text-sm text-blue-700">
              <p>
                <strong>Nombre:</strong> {debugInfo.currentUser?.username || "No disponible"}
              </p>
              <p>
                <strong>Rol:</strong> {debugInfo.currentUser?.role || "No disponible"}
              </p>
              <p>
                <strong>ID:</strong> {debugInfo.currentUser?.id || "No disponible"}
              </p>
            </div>
          </div>

          {/* Resumen de plantillas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Todas las Plantillas</h3>
              <p className="text-2xl font-bold text-gray-700">{debugInfo.allTemplates?.count || 0}</p>
              <p className="text-sm text-gray-600">Total en el sistema</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Plantillas Disponibles</h3>
              <p className="text-2xl font-bold text-green-700">{debugInfo.availableTemplates?.count || 0}</p>
              <p className="text-sm text-green-600">Disponibles para reportes</p>
            </div>
          </div>

          {/* Análisis detallado */}
          {debugInfo.templateAnalysis && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Análisis Detallado de Plantillas</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debugInfo.templateAnalysis.map((analysis: any) => (
                  <div key={analysis.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{analysis.name}</h4>
                      <div className="flex items-center gap-2">
                        {analysis.should_be_available ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Debería estar disponible
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            No debería estar disponible
                          </Badge>
                        )}
                      </div>
                    </div>

                    {analysis.error ? (
                      <p className="text-red-600 text-sm">{analysis.error}</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Creador:</span> {analysis.created_by_role}
                        </div>
                        <div>
                          <span className="font-medium">Público:</span> {analysis.is_public ? "Sí" : "No"}
                        </div>
                        <div>
                          <span className="font-medium">Activo:</span> {analysis.is_active ? "Sí" : "No"}
                        </div>
                        <div>
                          <span className="font-medium">Elementos:</span> {analysis.total_elements}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
