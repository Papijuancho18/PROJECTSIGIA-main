"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, Search, UserCheck, UserX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { EditUserDialog } from "@/components/edit-user-dialog"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "staff"
  is_active: boolean
  date_joined: string
  last_login?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Datos de muestra para demostración
  // const sampleUsers: User[] = [
  //   {
  //     id: 1,
  //     username: "admin",
  //     email: "admin@universidad.edu",
  //     first_name: "Administrador",
  //     last_name: "Sistema",
  //     role: "admin",
  //     is_active: true,
  //     date_joined: "2023-01-15",
  //     last_login: "2024-01-15T10:30:00Z",
  //   },
  //   {
  //     id: 2,
  //     username: "maria.gonzalez",
  //     email: "maria.gonzalez@universidad.edu",
  //     first_name: "María",
  //     last_name: "González",
  //     role: "staff",
  //     is_active: true,
  //     date_joined: "2023-03-20",
  //     last_login: "2024-01-14T15:45:00Z",
  //   },
  //   {
  //     id: 3,
  //     username: "carlos.rodriguez",
  //     email: "carlos.rodriguez@universidad.edu",
  //     first_name: "Carlos",
  //     last_name: "Rodríguez",
  //     role: "staff",
  //     is_active: true,
  //     date_joined: "2023-05-10",
  //     last_login: "2024-01-13T09:20:00Z",
  //   },
  //   {
  //     id: 4,
  //     username: "ana.martinez",
  //     email: "ana.martinez@universidad.edu",
  //     first_name: "Ana",
  //     last_name: "Martínez",
  //     role: "staff",
  //     is_active: false,
  //     date_joined: "2023-07-05",
  //     last_login: "2023-12-20T14:10:00Z",
  //   },
  // ]

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const response = await apiService.getUsers()
        setUsers(response.results || [])
        setFilteredUsers(response.results || [])
      } catch (error) {
        console.error("Error loading users:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => (statusFilter === "active" ? user.is_active : !user.is_active))
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleCreateUser = async (userData: {
    username: string
    email: string
    first_name: string
    last_name: string
    role: "admin" | "staff"
    password: string
  }) => {
    try {
      const newUser = await apiService.createUser(userData)
      setUsers((prevUsers) => [...prevUsers, newUser])
      toast({
        title: "Usuario creado",
        description: `Usuario ${newUser.username} creado correctamente`,
      })
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditDialog(true)
  }

  const handleUpdateUser = async (
    userId: number,
    userData: {
      username: string
      email: string
      first_name: string
      last_name: string
      role: "admin" | "staff"
      is_active: boolean
    },
  ) => {
    try {
      const updatedUser = await apiService.updateUser(userId, userData)
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? updatedUser : u)))
      toast({
        title: "Usuario actualizado",
        description: `Usuario ${updatedUser.username} actualizado correctamente`,
      })
      setShowEditDialog(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      const updatedUser = await apiService.updateUser(userId, {
        is_active: !user.is_active,
      })

      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? updatedUser : u)))

      toast({
        title: "Estado actualizado",
        description: `Usuario ${user.username} ${updatedUser.is_active ? "activado" : "desactivado"} correctamente`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiService.deleteUser(userId)
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "staff":
        return "Personal"
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administre los usuarios del sistema y sus permisos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre los usuarios por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-filter">Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="staff">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Badge className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                      {user.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <UserX className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{user.username} • {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registrado: {new Date(user.date_joined).toLocaleDateString("es-ES")}
                      {user.last_login && (
                        <> • Último acceso: {new Date(user.last_login).toLocaleDateString("es-ES")}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={
                      user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                    }
                  >
                    {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron usuarios que coincidan con los filtros</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear usuario */}
      <CreateUserDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateUser={handleCreateUser} />

      {/* Dialog para editar usuario */}
      <EditUserDialog
        user={editingUser}
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setEditingUser(null)
        }}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  )
}
