"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface UserProfileProps {
  role: string
}

export function UserProfile({ role }: UserProfileProps) {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: role,
    password: "********",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        console.log("🔍 Cargando datos del usuario...")
        console.log("📦 apiService:", apiService)

        // Verificar si apiService existe
        if (!apiService) {
          throw new Error("ApiService no está disponible")
        }

        // Obtener datos del usuario actual desde localStorage
        const currentUser = apiService.getCurrentUser()
        console.log("👤 Usuario actual:", currentUser)

        if (currentUser) {
          setUserData({
            first_name: currentUser.first_name || "",
            last_name: currentUser.last_name || "",
            email: currentUser.email || "",
            role: currentUser.role || role,
            password: "********",
          })
        } else {
          // Si no hay usuario en cache, intentar obtener el perfil
          try {
            const profile = await apiService.getProfile()
            console.log("📋 Perfil obtenido:", profile)

            setUserData({
              first_name: profile.first_name || "",
              last_name: profile.last_name || "",
              email: profile.email || "",
              role: profile.role || role,
              password: "********",
            })
          } catch (profileError) {
            console.error("❌ Error obteniendo perfil:", profileError)
            // Usar datos por defecto si no se puede obtener el perfil
            setUserData({
              first_name: "",
              last_name: "",
              email: "",
              role: role,
              password: "********",
            })
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar datos del usuario:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del perfil",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      if (!apiService) {
        throw new Error("ApiService no está disponible")
      }

      const currentUser = apiService.getCurrentUser()

      if (!currentUser?.id) {
        throw new Error("No se pudo identificar al usuario actual")
      }

      // Solo enviar los campos que pueden actualizarse
      const updateData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        // Solo enviar contraseña si ha sido modificada
        ...(userData.password !== "********" && { password: userData.password }),
      }

      console.log("💾 Actualizando usuario:", currentUser.id, updateData)
      await apiService.updateUser(currentUser.id, updateData)

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("❌ Error al guardar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-md border-primary/20">
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle>Mi Perfil</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Actualice su información personal y preferencias
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={userData.first_name}
              onChange={handleChange}
              className="border-primary/20 focus-visible:ring-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={userData.last_name}
              onChange={handleChange}
              className="border-primary/20 focus-visible:ring-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              className="border-primary/20 focus-visible:ring-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Input id="role" value={userData.role} disabled className="bg-highlight border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              className="border-primary/20 focus-visible:ring-secondary"
              placeholder="Ingrese nueva contraseña para cambiarla"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-highlight rounded-b-lg">
          <Button
            type="submit"
            className="bg-secondary text-secondary-foreground hover:bg-secondary-hover"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
