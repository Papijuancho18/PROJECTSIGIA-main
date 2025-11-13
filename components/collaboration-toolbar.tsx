"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCollaboration, type User } from "@/contexts/collaboration-context"
import { Users, UserPlus, Wifi, WifiOff, History, Save } from "lucide-react"

interface CollaborationToolbarProps {
  documentId: string
  documentTitle?: string
  onSave?: () => void
}

export function CollaborationToolbar({ documentId, documentTitle, onSave }: CollaborationToolbarProps) {
  const { isConnected, currentUser, connectToDocument, disconnectFromDocument, getActiveUsers } = useCollaboration()

  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showUsersDialog, setShowUsersDialog] = useState(false)
  const [userName, setUserName] = useState("")
  const [activeUsers, setActiveUsers] = useState<User[]>([])

  // Actualizar lista de usuarios activos
  useEffect(() => {
    if (isConnected) {
      const users = getActiveUsers()
      setActiveUsers(users)
    } else {
      setActiveUsers([])
    }
  }, [isConnected, getActiveUsers])

  // Manejar conexión
  const handleConnect = () => {
    if (userName.trim()) {
      connectToDocument(documentId, userName.trim())
      setShowConnectDialog(false)
    }
  }

  // Manejar desconexión
  const handleDisconnect = () => {
    disconnectFromDocument()
  }

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
      <div className="flex items-center space-x-2">
        {documentTitle && <h3 className="text-sm font-medium">{documentTitle}</h3>}

        {isConnected ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>Colaboración activa</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            <span>Modo individual</span>
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Botón de guardar */}
        {onSave && (
          <Button variant="outline" size="sm" onClick={onSave} className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Guardar</span>
          </Button>
        )}

        {/* Historial de cambios */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Historial</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver historial de cambios</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Usuarios activos */}
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-2">
            {activeUsers.slice(0, 3).map((user) => (
              <TooltipProvider key={user.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-white" style={{ borderColor: user.color }}>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {activeUsers.length > 3 && (
              <Avatar className="h-8 w-8 border-2 border-white bg-gray-200">
                <AvatarFallback>+{activeUsers.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUsersDialog(true)}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
            {activeUsers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeUsers.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Botón de conexión/desconexión */}
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="flex items-center gap-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Desconectar</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConnectDialog(true)}
            className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Unirse</span>
          </Button>
        )}
      </div>

      {/* Diálogo para conectarse */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unirse a la colaboración</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="col-span-3"
                placeholder="Tu nombre"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConnect()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConnect} disabled={!userName.trim()}>
              Unirse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver usuarios */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usuarios colaborando</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {activeUsers.length > 0 ? (
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                    <Avatar className="h-10 w-10 border-2" style={{ borderColor: user.color }}>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.id === currentUser?.id ? "Tú" : "Colaborador"}
                        {user.isActive ? (
                          <span className="ml-2 inline-flex items-center">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center">
                            <span className="h-2 w-2 rounded-full bg-gray-300 mr-1"></span>
                            Inactivo
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay usuarios colaborando actualmente</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUsersDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
