"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { apiService } from "@/lib/api"

interface DiagnosticResult {
  status: string
  message: string
  details?: any
}

export function ConnectionDiagnostics() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const runDiagnostics = async () => {
    setIsChecking(true)
    setResult(null)

    try {
      const result = await apiService.testConnection()
      setResult(result)
    } catch (error) {
      setResult({
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        details: { error: String(error) },
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "auth_required":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Conectado
          </Badge>
        )
      case "auth_required":
        return <Badge variant="secondary">Requiere Auth</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Diagnóstico de Conexión
        </CardTitle>
        <CardDescription>Verifica la conectividad con el servidor Django</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando conexión...
            </>
          ) : (
            "Ejecutar Diagnóstico"
          )}
        </Button>

        {result && (
          <Alert>
            <div className="flex items-center gap-2">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Estado de Conexión:</span>
                  {getStatusBadge(result.status)}
                </div>
                <AlertDescription>{result.message}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {result?.details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detalles Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>URL del API:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}
          </p>
          <p>
            <strong>Modo:</strong> {process.env.NODE_ENV}
          </p>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Pasos para solucionar problemas:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Verifica que el servidor Django esté ejecutándose</li>
              <li>Confirma que el puerto sea el correcto (por defecto 8000)</li>
              <li>Revisa la configuración de CORS en Django</li>
              <li>Verifica la variable NEXT_PUBLIC_API_URL en .env.local</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
