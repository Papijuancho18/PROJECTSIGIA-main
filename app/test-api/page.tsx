"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiService } from "@/lib/api"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface TestResult {
  endpoint: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function TestApiPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const updateResult = (endpoint: string, status: "success" | "error", message: string, data?: any) => {
    setResults((prev) => prev.map((r) => (r.endpoint === endpoint ? { ...r, status, message, data } : r)))
  }

  const addTest = (endpoint: string) => {
    setResults((prev) => [...prev, { endpoint, status: "pending", message: "Testing..." }])
  }

  const testEndpoints = async () => {
    setTesting(true)
    setResults([])

    const tests = [
      // User endpoints
      {
        name: "Get Users",
        test: () => apiService.getUsers(),
      },
      {
        name: "Get Profile",
        test: () => apiService.getProfile(),
      },
      // Template endpoints
      {
        name: "Get Templates",
        test: () => apiService.getTemplates(),
      },
      // Report endpoints
      {
        name: "Get Reports",
        test: () => apiService.getReports(),
      },
      // Chart endpoints
      {
        name: "Get Charts",
        test: () => apiService.getCharts(),
      },
      // Table endpoints
      {
        name: "Get Tables",
        test: () => apiService.getTables(),
      },
      // Department endpoints
      {
        name: "Get Departments",
        test: () => apiService.getDepartments(),
      },
      // Export endpoints
      {
        name: "Get Export Configs",
        test: () => apiService.getExportConfigs(),
      },
      // Stats endpoints
      {
        name: "Get Dashboard Stats",
        test: () => apiService.getDashboardStats(),
      },
      {
        name: "Get User Stats",
        test: () => apiService.getUserStats(),
      },
      // Search endpoints
      {
        name: "Search Users",
        test: () => apiService.searchUsers("test"),
      },
      {
        name: "Search Templates",
        test: () => apiService.searchTemplates("test"),
      },
      {
        name: "Search Reports",
        test: () => apiService.searchReports("test"),
      },
    ]

    for (const test of tests) {
      addTest(test.name)

      try {
        const result = await test.test()
        updateResult(test.name, "success", `✅ Success - ${JSON.stringify(result).slice(0, 100)}...`, result)
      } catch (error: any) {
        updateResult(test.name, "error", `❌ Error: ${error.message}`)
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setTesting(false)
  }

  const testSpecificEndpoint = async (endpointName: string, testFn: () => Promise<any>) => {
    addTest(endpointName)

    try {
      const result = await testFn()
      updateResult(endpointName, "success", `✅ Success`, result)
    } catch (error: any) {
      updateResult(endpointName, "error", `❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 API Endpoints Test</h1>
        <p className="text-gray-600">Prueba todos los endpoints del backend</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Button onClick={testEndpoints} disabled={testing} className="gap-2">
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          {testing ? "Probando..." : "🚀 Probar Todos los Endpoints"}
        </Button>

        <Button variant="outline" onClick={() => setResults([])}>
          🗑️ Limpiar Resultados
        </Button>
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="individual">Pruebas Individuales</TabsTrigger>
          <TabsTrigger value="docs">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {result.status === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
                    {result.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {result.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                    {result.endpoint}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-sm ${
                      result.status === "success"
                        ? "text-green-600"
                        : result.status === "error"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-blue-600">Ver datos</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Haz clic en "Probar Todos los Endpoints" para comenzar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() =>
                testSpecificEndpoint("Create Template", () =>
                  apiService.createTemplate({
                    name: "Test Template",
                    content: "Test content",
                    category: "test",
                  }),
                )
              }
            >
              Crear Template
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                testSpecificEndpoint("Create Report", () =>
                  apiService.createReport({
                    title: "Test Report",
                    content: "Test content",
                  }),
                )
              }
            >
              Crear Report
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                testSpecificEndpoint("Create Department", () =>
                  apiService.createDepartment({
                    name: "Test Department",
                    description: "Test description",
                  }),
                )
              }
            >
              Crear Departamento
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>📚 Endpoints Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold">👥 Users & Auth</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /auth/users/ - Obtener usuarios</li>
                    <li>POST /auth/users/ - Crear usuario</li>
                    <li>PUT /auth/users/:id/ - Actualizar usuario</li>
                    <li>DELETE /auth/users/:id/ - Eliminar usuario</li>
                    <li>GET /auth/profile/ - Obtener perfil</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">📋 Templates</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /templates/ - Obtener templates</li>
                    <li>POST /templates/ - Crear template</li>
                    <li>PUT /templates/:id/ - Actualizar template</li>
                    <li>DELETE /templates/:id/ - Eliminar template</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">📊 Reports</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /reports/ - Obtener reportes</li>
                    <li>POST /reports/ - Crear reporte</li>
                    <li>PUT /reports/:id/ - Actualizar reporte</li>
                    <li>POST /reports/:id/publish/ - Publicar reporte</li>
                    <li>POST /reports/:id/archive/ - Archivar reporte</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">📈 Charts & Tables</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /charts/ - Obtener gráficos</li>
                    <li>POST /charts/ - Crear gráfico</li>
                    <li>GET /tables/ - Obtener tablas</li>
                    <li>POST /tables/ - Crear tabla</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">🏢 Departments</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /departments/ - Obtener departamentos</li>
                    <li>POST /departments/ - Crear departamento</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">📥 Exports</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GET /exports/configs/ - Configuraciones de exportación</li>
                    <li>POST /exports/reports/:id/ - Exportar reporte</li>
                    <li>POST /exports/templates/:id/ - Exportar template</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
