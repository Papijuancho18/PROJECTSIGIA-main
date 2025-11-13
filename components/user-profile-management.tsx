"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Save, X } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { User as UserType } from "@/lib/api"

export function UserProfileManagement() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    phone: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await apiService.getProfile()
      setUser(profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        department: profile.department || "",
        phone: profile.phone || "",
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil del usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!user) return

      const updatedUser = await apiService.updateUser(user.id, formData)
      setUser(updatedUser)
      setEditing(false)

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        department: user.department || "",
        phone: user.phone || "",
      })
    }
    setEditing(false)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "staff":
        return "Personal Administrativo"
      default:
        return "Usuario"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No se pudo cargar la información del perfil</p>
            <Button onClick={loadUserProfile} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal</p>
          </div>
        </div>

        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  {editing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="Ingresa tu nombre"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{user.first_name || "No especificado"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  {editing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Ingresa tu apellido"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{user.last_name || "No especificado"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{user.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <p className="text-sm text-gray-900 py-2">{user.username}</p>
                  <p className="text-xs text-gray-500">El nombre de usuario no se puede cambiar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  {editing ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Departamento o área"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{user.department || "No especificado"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Número de teléfono"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{user.phone || "No especificado"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información de Cuenta</CardTitle>
              <CardDescription>Detalles de tu cuenta en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Badge variant="secondary" className="text-sm">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Badge variant={user.is_active ? "default" : "destructive"} className="text-sm">
                  {user.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>ID de Usuario</Label>
                <p className="text-sm text-gray-600">#{user.id}</p>
              </div>

              {user.created_at && (
                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <p className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
