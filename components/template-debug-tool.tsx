"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TemplateDebugToolProps {
  templateId: string
  templateName: string
}

export function TemplateDebugTool({ templateId, templateName }: TemplateDebugToolProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copyResult, setCopyResult] = useState<any>(null)

  const runFullDebug = async () => {
    try {
      setLoading(true)
      console.log(`🔍 Running full debug for template ${templateId}`)

      const response = await fetch(`/api/templates/${templateId}/full-debug/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setDebugInfo(data)
      console.log("🔍 Debug info received:", data)
    } catch (error) {
      console.error("❌ Error running debug:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testPersonalCopy = async () => {
    try {
      setLoading(true)
      console.log(`🔄 Testing personal copy for template ${templateId}`)

      const response = await fetch(`/api/templates/${templateId}/create-personal-copy/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setCopyResult(data)
      console.log("🔄 Copy result:", data)
    } catch (error) {
      console.error("❌ Error testing copy:", error)
      setCopyResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Herramienta de Diagnóstico - {templateName}</CardTitle>
        <div className="flex gap-2">
          <Button onClick={runFullDebug} disabled={loading}>
            {loading ? "Analizando..." : "Ejecutar Diagnóstico Completo"}
          </Button>
          <Button onClick={testPersonalCopy} disabled={loading} variant="outline">
            {loading ? "Probando..." : "Probar Copia Personal"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información de Debug */}
        {debugInfo && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Diagnóstico</h3>

            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información Básica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>ID: {debugInfo.basic_info?.id}</div>
                  <div>Nombre: {debugInfo.basic_info?.name}</div>
                  <div>Categoría: {debugInfo.basic_info?.category}</div>
                  <div>
                    Creado por: {debugInfo.basic_info?.created_by} ({debugInfo.basic_info?.created_by_role})
                  </div>
                  <div>Público: {debugInfo.basic_info?.is_public ? "Sí" : "No"}</div>
                  <div>Activo: {debugInfo.basic_info?.is_active ? "Sí" : "No"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Campo Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campo Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Existe: {debugInfo.content_field?.exists ? "Sí" : "No"}</div>
                  <div>Tipo: {debugInfo.content_field?.type}</div>
                  <div>Longitud: {debugInfo.content_field?.length} caracteres</div>
                  <div>Parseado exitosamente: {debugInfo.content_field?.parsed_successfully ? "Sí" : "No"}</div>
                  {debugInfo.content_field?.sections_count && (
                    <div>Secciones en content: {debugInfo.content_field.sections_count}</div>
                  )}

                  {debugInfo.content_field?.sections && (
                    <div className="mt-4">
                      <h4 className="font-medium">Secciones en Content:</h4>
                      {debugInfo.content_field.sections.map((section: any, index: number) => (
                        <div key={index} className="ml-4 p-2 border rounded mt-2">
                          <div>Título: {section.title}</div>
                          <div>Elementos: {section.elements_count}</div>
                          <div>Subsecciones: {section.subsections_count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Secciones de Base de Datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Secciones en Base de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Cantidad: {debugInfo.database_sections?.count}</div>

                  {debugInfo.database_sections?.sections && debugInfo.database_sections.sections.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">Secciones:</h4>
                      {debugInfo.database_sections.sections.map((section: any, index: number) => (
                        <div key={index} className="ml-4 p-2 border rounded mt-2">
                          <div>Título: {section.title}</div>
                          <div>Elementos: {section.elements_count}</div>
                          <div>Subsecciones: {section.subsections_count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Salida del Serializer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Salida del Serializer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Éxito: {debugInfo.serializer_output?.success ? "Sí" : "No"}</div>
                  {debugInfo.serializer_output?.success && (
                    <div>Secciones serializadas: {debugInfo.serializer_output.sections_count}</div>
                  )}
                  {debugInfo.serializer_output?.error && (
                    <div className="text-red-600">Error: {debugInfo.serializer_output.error}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultado de Copia */}
        {copyResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultado de Copia Personal</h3>

            <Card>
              <CardContent className="pt-6">
                {copyResult.error ? (
                  <div className="text-red-600">Error: {copyResult.error}</div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div>Mensaje: {copyResult.message}</div>
                    {copyResult.debug_info && (
                      <div className="mt-4">
                        <h4 className="font-medium">Información de Debug:</h4>
                        <div>Elementos originales: {copyResult.debug_info.original_elements}</div>
                        <div>Elementos copiados: {copyResult.debug_info.copy_elements}</div>
                        <div>
                          Copia exitosa: {copyResult.debug_info.content_copied_successfully ? "Sí" : "No"}
                          {copyResult.debug_info.content_copied_successfully ? (
                            <Badge className="ml-2" variant="default">
                              ✓
                            </Badge>
                          ) : (
                            <Badge className="ml-2" variant="destructive">
                              ✗
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {copyResult.template && (
                      <div className="mt-4">
                        <h4 className="font-medium">Plantilla Copiada:</h4>
                        <div>ID: {copyResult.template.id}</div>
                        <div>Nombre: {copyResult.template.name}</div>
                        <div>Secciones: {copyResult.template.sections?.length || 0}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
