"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserManagement } from "@/components/user-management"
import { UserProfile } from "@/components/user-profile"
import { TemplateManagement } from "@/components/template-management"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
          console.log("🔒 No token or user found, redirecting to login")
          router.push("/login")
          return
        }

        let userData
        try {
          userData = JSON.parse(user)
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }

        console.log("👤 User data:", userData)

        // Verificar que sea admin
        if (userData.role !== "admin") {
          console.log("🚫 User is not admin, redirecting")
          router.push("/login")
          return
        }

        console.log("✅ Admin authenticated")
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

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

  return (
    <div className="min-h-screen flex">
      <AdminSidebar activeItem={activeTab} onNavigate={setActiveTab} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Panel de Administrador</h1>
          <p className="text-gray-500">Gestione usuarios y plantillas del sistema</p>
        </div>

        {activeTab === "profile" && <UserProfile role="Administrador" />}

        {activeTab === "users" && <UserManagement />}

        {activeTab === "templates" && <TemplateManagement />}
      </main>
    </div>
  )
}
