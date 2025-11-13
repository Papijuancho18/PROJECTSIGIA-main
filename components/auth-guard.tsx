"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay token en localStorage
        const token = localStorage.getItem("access_token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
          console.log("🔒 No token or user found, redirecting to login")
          router.push(redirectTo)
          return
        }

        const userData = JSON.parse(user)
        console.log("👤 User data:", userData)

        // Verificar rol si es requerido
        if (requiredRole && userData.role !== requiredRole) {
          console.log(`🚫 User role ${userData.role} doesn't match required role ${requiredRole}`)
          router.push("/unauthorized")
          return
        }

        // Verificar que el token sea válido haciendo una petición al backend
        try {
          await apiService.getProfile()
          console.log("✅ Token is valid")
          setIsAuthenticated(true)
        } catch (error) {
          console.log("❌ Token is invalid, redirecting to login")
          apiService.clearAuth()
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // El router.push ya redirigió
  }

  return <>{children}</>
}
