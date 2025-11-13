"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"

export default function TestLogoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Obtener información del usuario actual
  const currentUser = apiService.getCurrentUser()
  const isAuthenticated = apiService.isAuthenticated()

  const handleLogout = async () => {
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      console.log("🚪 Starting logout process...")

      // Llamar al método logout del apiService
      await apiService.logout()

      console.log("✅ Logout successful")
      setMessage("Logout exitoso. Redirigiendo...")

      // Esperar un momento para mostrar el mensaje
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      console.error("❌ Logout error:", error)
      setError(`Error durante logout: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthStatus = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

    console.log("🔍 Auth Status Check:")
    console.log("- Access Token:", token ? "✅ Present" : "❌ Missing")
    console.log("- User Data:", user ? "✅ Present" : "❌ Missing")
    console.log("- Refresh Token:", refreshToken ? "✅ Present" : "❌ Missing")
    console.log("- API Service Auth:", isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated")

    setMessage(`
      Token: ${token ? "Presente" : "Ausente"}
      Usuario: ${user ? "Presente" : "Ausente"}
      Refresh: ${refreshToken ? "Presente" : "Ausente"}
      API Auth: ${isAuthenticated ? "Autenticado" : "No autenticado"}
    `)
  }

  const clearAuthManually = () => {
    apiService.clearAuth()
    setMessage("Datos de autenticación limpiados manualmente")
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Test de Logout
              {isAuthenticated ? (
                <Badge variant="default">Autenticado</Badge>
              ) : (
                <Badge variant="destructive">No Autenticado</Badge>
              )}
            </CardTitle>
            <CardDescription>Prueba la funcionalidad de logout del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información del usuario actual */}
            {currentUser && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">👤 Usuario Actual:</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Nombre:</strong> {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p>
                    <strong>Usuario:</strong> {currentUser.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                  <p>
                    <strong>Rol:</strong> {currentUser.role}
                  </p>
                </div>
              </div>
            )}

            {/* Mensajes */}
            {message && (
              <Alert>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm">{message}</pre>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botones de prueba */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleLogout}
                disabled={isLoading || !isAuthenticated}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? "Cerrando sesión..." : "🚪 Logout Completo"}
              </Button>

              <Button onClick={checkAuthStatus} variant="outline" className="w-full">
                🔍 Verificar Estado Auth
              </Button>

              <Button onClick={clearAuthManually} variant="secondary" className="w-full">
                🗑️ Limpiar Auth Manual
              </Button>

              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                ↩️ Ir a Login
              </Button>
            </div>

            {/* Información técnica */}
            <div className="p-4 bg-gray-100 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">ℹ️ Información Técnica:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• El logout envía el refresh token al backend</li>
                <li>• Limpia localStorage (access_token, refresh_token, user)</li>
                <li>• Resetea el estado del apiService</li>
                <li>• Redirige automáticamente al login</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pruebas adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Pruebas Adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={async () => {
                try {
                  const profile = await apiService.getProfile()
                  setMessage(`Perfil obtenido: ${profile.username}`)
                } catch (error) {
                  setError(`Error al obtener perfil: ${error}`)
                }
              }}
              variant="outline"
              className="w-full"
            >
              🔍 Probar API con Token Actual
            </Button>

            <Button
              onClick={() => {
                const dashboardUrl =
                  currentUser?.role === "admin"
                    ? "/admin/dashboard"
                    : currentUser?.role === "staff"
                      ? "/staff/dashboard"
                      : "/committee/dashboard"
                router.push(dashboardUrl)
              }}
              variant="outline"
              className="w-full"
              disabled={!currentUser}
            >
              🏠 Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
