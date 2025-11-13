"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function ApiConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTests = async () => {
    setTesting(true)
    const testResults: any = {
      connection: null,
      auth: null,
      templates: null,
      saveTest: null,
      user: null,
    }

    try {
      // Test 1: Conexión básica
      console.log("🔍 Testing basic connection...")
      testResults.connection = await apiService.testConnection()

      // Test 2: Usuario actual
      console.log("🔍 Testing current user...")
      try {
        const user = apiService.getCurrentUser()
        testResults.user = user ? { status: "success", data: user } : { status: "error", message: "No user found" }
      } catch (error) {
        testResults.user = { status: "error", message: error instanceof Error ? error.message : "Unknown error" }
      }

      // Test 3: Obtener plantillas
      console.log("🔍 Testing templates endpoint...")
      try {
        const templatesResponse = await apiService.getTemplates({ enhanced: true, limit: 1 })
        testResults.templates = {
          status: "success",
          message: `Found ${templatesResponse.count} templates`,
          data: templatesResponse,
        }
      } catch (error) {
        testResults.templates = {
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 4: Test de guardado (solo si hay plantillas)
      if (testResults.templates?.status === "success" && testResults.templates.data?.results?.length > 0) {
        console.log("🔍 Testing save functionality...")
        try {
          const firstTemplate = testResults.templates.data.results[0]
          const testTemplate = {
            ...firstTemplate,
            description: `Test save at ${new Date().toISOString()}`,
          }

          await apiService.saveEnhancedTemplate(firstTemplate.id, testTemplate)
          testResults.saveTest = { status: "success", message: "Save test successful" }
        } catch (error) {
          testResults.saveTest = {
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          }
        }
      } else {
        testResults.saveTest = { status: "skipped", message: "No templates available for save test" }
      }
    } catch (error) {
      console.error("❌ Test error:", error)
    }

    setResults(testResults)
    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "auth_required":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "skipped":
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "auth_required":
        return <Badge className="bg-yellow-100 text-yellow-800">Auth Requerida</Badge>
      case "skipped":
        return <Badge variant="secondary">Omitido</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Diagnóstico de Conexión API
        </CardTitle>
        <CardDescription>Verifica la conexión entre el frontend y el backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Ejecutando pruebas...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Ejecutar Diagnóstico
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados del Diagnóstico</h3>

            {/* Test de conexión */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.connection?.status)}
                  <span className="font-medium">Conexión Básica</span>
                </div>
                {getStatusBadge(results.connection?.status)}
              </div>
              <p className="text-sm text-gray-600">{results.connection?.message}</p>
            </div>

            {/* Test de usuario */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.user?.status)}
                  <span className="font-medium">Usuario Actual</span>
                </div>
                {getStatusBadge(results.user?.status)}
              </div>
              <p className="text-sm text-gray-600">
                {results.user?.data
                  ? `Usuario: ${results.user.data.username} (${results.user.data.role})`
                  : results.user?.message}
              </p>
            </div>

            {/* Test de plantillas */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.templates?.status)}
                  <span className="font-medium">Endpoint de Plantillas</span>
                </div>
                {getStatusBadge(results.templates?.status)}
              </div>
              <p className="text-sm text-gray-600">{results.templates?.message}</p>
              {results.templates?.data && (
                <div className="mt-2 text-xs text-gray-500">
                  <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.templates.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Test de guardado */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.saveTest?.status)}
                  <span className="font-medium">Test de Guardado</span>
                </div>
                {getStatusBadge(results.saveTest?.status)}
              </div>
              <p className="text-sm text-gray-600">{results.saveTest?.message}</p>
            </div>

            {/* Información del entorno */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Información del Entorno</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}
                </p>
                <p>
                  <strong>Entorno:</strong> {process.env.NODE_ENV}
                </p>
                <p>
                  <strong>Token presente:</strong> {apiService.isAuthenticated() ? "Sí" : "No"}
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
