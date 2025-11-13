"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { apiService } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Verificar que el servicio esté disponible
    console.log("🔧 Checking API service:", apiService)
    console.log("🔧 Login method:", typeof apiService?.login)
    setIsReady(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔐 Starting login process...")
      console.log("📊 API Service available:", !!apiService)
      console.log("📊 Login method type:", typeof apiService.login)

      if (!apiService || typeof apiService.login !== "function") {
        throw new Error("API Service no está disponible")
      }

      const response = await apiService.login({ username, password })
      console.log("✅ Login successful:", response)

      // Verificar la estructura de la respuesta
      if (!response || !response.user) {
        console.error("❌ Unexpected API response structure:", response)
        throw new Error("Respuesta de API inesperada. Contacte al administrador.")
      }

      // Redirigir según el rol del usuario (con fallback a 'user' si no existe 'role')
      const userRole = response.user.role || response.user.groups?.[0] || "user"
      console.log("👤 User role:", userRole)

      // Almacenar el rol en localStorage para uso futuro
      localStorage.setItem("userRole", userRole)

      // Redirigir según el rol - solo admin y staff
      if (userRole.includes("admin")) {
        router.push("/admin/dashboard")
      } else if (userRole.includes("staff")) {
        router.push("/staff/dashboard")
      } else {
        // Si no es admin ni staff, mostrar error
        setError("Rol de usuario no válido. Solo se permiten administradores y personal.")
        return
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      if (error instanceof Error) {
        // Mostrar el mensaje de error tal como viene del servidor
        setError(error.message)
      } else {
        setError("Error de conexión. Verifica que el servidor esté funcionando.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center data-gradient-bg px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg card-hover">
          <CardHeader className="space-y-4 bg-primary text-primary-foreground rounded-t-lg pt-8 pb-6">
            <div className="flex justify-center mb-4">
              <Logo variant="light" size="lg" padding="none" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-primary-foreground/80">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su nombre de usuario"
                  className="border-primary/20 focus-visible:ring-secondary"
                  required
                  disabled={isLoading || !isReady}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Contraseña
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-secondary hover:text-secondary-hover hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="border-primary/20 focus-visible:ring-secondary"
                  required
                  disabled={isLoading || !isReady}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                disabled={isLoading || !isReady}
              >
                {isLoading ? "Iniciando sesión..." : !isReady ? "Cargando..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center bg-highlight rounded-b-lg">
            <p className="text-sm text-foreground">Para soporte técnico contacte al administrador del sistema</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
