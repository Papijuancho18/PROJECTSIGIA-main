"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ExportConfiguration, ExportConfigTemplate } from "@/types/export-config"
import {
  Save,
  Settings,
  Copy,
  Edit,
  Trash2,
  Share2,
  Star,
  StarOff,
  MoreVertical,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Globe,
} from "lucide-react"

// Configuraciones predefinidas de ejemplo
const builtInConfigurations: ExportConfigTemplate[] = [
  {
    id: "quick-json",
    name: "Exportación Rápida JSON",
    description: "Configuración básica para exportar plantillas en formato JSON",
    category: "básica",
    isBuiltIn: true,
    isShared: true,
    usageCount: 156,
    lastUsed: "2024-01-15T10:30:00Z",
    configuration: {
      format: "json",
      includeAssets: false,
      includeMetadata: true,
      compression: false,
      formatOptions: {
        json: {
          prettyPrint: true,
          includeValidation: false,
        },
      },
      naming: {
        pattern: "plantillas-{format}-{date}",
        includeTimestamp: true,
        includeUserName: false,
      },
    },
  },
  {
    id: "complete-package",
    name: "Paquete Completo",
    description: "Exportación completa con todos los recursos y documentación",
    category: "completa",
    isBuiltIn: true,
    isShared: true,
    usageCount: 89,
    lastUsed: "2024-01-14T15:45:00Z",
    configuration: {
      format: "package",
      includeAssets: true,
      includeMetadata: true,
      compression: true,
      formatOptions: {
        package: {
          includeInstallScript: true,
          includeDocumentation: true,
          generateChecksums: true,
          compatibilityCheck: true,
        },
      },
      naming: {
        pattern: "paquete-plantillas-{date}-{time}",
        includeTimestamp: true,
        includeUserName: true,
      },
    },
  },
  {
    id: "backup-zip",
    name: "Respaldo ZIP",
    description: "Configuración optimizada para crear respaldos de plantillas",
    category: "respaldo",
    isBuiltIn: true,
    isShared: true,
    usageCount: 234,
    lastUsed: "2024-01-13T09:15:00Z",
    configuration: {
      format: "zip",
      includeAssets: true,
      includeMetadata: true,
      compression: true,
      formatOptions: {
        zip: {
          compressionLevel: 9,
          includeReadme: true,
          folderStructure: "categorized",
        },
      },
      naming: {
        pattern: "backup-plantillas-{date}",
        includeTimestamp: true,
        includeUserName: false,
        customPrefix: "backup",
      },
    },
  },
]

const userConfigurations: ExportConfigTemplate[] = [
  {
    id: "user-config-1",
    name: "Mi Configuración Académica",
    description: "Configuración personalizada para exportar plantillas académicas",
    category: "personalizada",
    isBuiltIn: false,
    isShared: false,
    usageCount: 12,
    lastUsed: "2024-01-12T14:20:00Z",
    configuration: {
      format: "pdf",
      includeAssets: true,
      includeMetadata: true,
      compression: false,
      filters: {
        categories: ["académico", "investigación"],
        favorites: true,
      },
      naming: {
        pattern: "plantillas-academicas-{date}",
        includeTimestamp: true,
        includeUserName: true,
      },
    },
  },
]

interface ExportConfigManagerProps {
  onSelectConfig?: (config: ExportConfigTemplate) => void
  onSaveConfig?: (config: ExportConfiguration) => void
  currentConfig?: Partial<ExportConfiguration>
}

export function ExportConfigManager({ onSelectConfig, onSaveConfig, currentConfig }: ExportConfigManagerProps) {
  const [builtInConfigs] = useState<ExportConfigTemplate[]>(builtInConfigurations)
  const [userConfigs, setUserConfigs] = useState<ExportConfigTemplate[]>(userConfigurations)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ExportConfigTemplate | null>(null)
  const [favoriteConfigs, setFavoriteConfigs] = useState<string[]>(["quick-json", "user-config-1"])
  const [actionStatus, setActionStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  // Obtener todas las configuraciones
  const allConfigs = [...builtInConfigs, ...userConfigs]

  // Filtrar configuraciones
  const filteredConfigs = allConfigs.filter((config) => {
    const matchesSearch =
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || config.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Obtener categorías únicas
  const categories = ["all", ...Array.from(new Set(allConfigs.map((config) => config.category)))]

  const handleSelectConfig = (config: ExportConfigTemplate) => {
    onSelectConfig?.(config)
    setActionStatus({
      status: "success",
      message: `Configuración "${config.name}" aplicada`,
    })

    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  const handleSaveCurrentConfig = () => {
    if (!currentConfig) return
    setShowCreateDialog(true)
  }

  const handleCreateConfig = async (configData: any) => {
    // Simulación de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newConfig: ExportConfigTemplate = {
      id: `user-config-${Date.now()}`,
      name: configData.name,
      description: configData.description,
      category: configData.category || "personalizada",
      isBuiltIn: false,
      isShared: configData.isShared || false,
      usageCount: 0,
      configuration: currentConfig || {},
    }

    setUserConfigs((prev) => [...prev, newConfig])
    setShowCreateDialog(false)
    setActionStatus({
      status: "success",
      message: "Configuración guardada exitosamente",
    })

    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  const handleDeleteConfig = async (configId: string) => {
    // Simulación de eliminación
    await new Promise((resolve) => setTimeout(resolve, 500))

    setUserConfigs((prev) => prev.filter((config) => config.id !== configId))
    setActionStatus({
      status: "success",
      message: "Configuración eliminada exitosamente",
    })

    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  const handleDuplicateConfig = (config: ExportConfigTemplate) => {
    const duplicatedConfig: ExportConfigTemplate = {
      ...config,
      id: `user-config-${Date.now()}`,
      name: `${config.name} (Copia)`,
      isBuiltIn: false,
      isShared: false,
      usageCount: 0,
      lastUsed: undefined,
    }

    setUserConfigs((prev) => [...prev, duplicatedConfig])
    setActionStatus({
      status: "success",
      message: "Configuración duplicada exitosamente",
    })

    setTimeout(() => {
      setActionStatus({ status: "idle" })
    }, 3000)
  }

  const handleToggleFavorite = (configId: string) => {
    setFavoriteConfigs((prev) => (prev.includes(configId) ? prev.filter((id) => id !== configId) : [...prev, configId]))
  }

  const renderConfigCard = (config: ExportConfigTemplate) => (
    <Card
      key={config.id}
      className="overflow-hidden hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleSelectConfig(config)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {config.name}
              {config.isBuiltIn && <Badge variant="secondary">Predefinida</Badge>}
              {config.isShared && <Globe className="h-4 w-4 text-blue-500" />}
              {favoriteConfigs.includes(config.id) && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{config.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectConfig(config)
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Usar configuración
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicateConfig(config)
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(config.id)
                }}
              >
                {favoriteConfigs.includes(config.id) ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Quitar de favoritos
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Añadir a favoritos
                  </>
                )}
              </DropdownMenuItem>
              {!config.isBuiltIn && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingConfig(config)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConfig(config.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="capitalize">
              {config.category}
            </Badge>
            <span>•</span>
            <span>Formato: {config.configuration.format?.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{config.usageCount} usos</span>
            </div>
            {config.lastUsed && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Último uso: {new Date(config.lastUsed).toLocaleDateString("es-ES")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Configuraciones de Exportación</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Gestione y reutilice configuraciones de exportación guardadas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {currentConfig && (
                <Button variant="secondary" className="gap-1" onClick={handleSaveCurrentConfig}>
                  <Save className="h-4 w-4" />
                  Guardar Actual
                </Button>
              )}
              <Button variant="secondary" className="gap-1" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" />
                Nueva Configuración
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Controles de filtrado */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar configuraciones..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas las categorías" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alertas de estado */}
          {actionStatus.status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Operación exitosa</AlertTitle>
              <AlertDescription>{actionStatus.message}</AlertDescription>
            </Alert>
          )}

          {actionStatus.status === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{actionStatus.message}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="favorites">Favoritas</TabsTrigger>
              <TabsTrigger value="user">Mis Configuraciones</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {filteredConfigs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron configuraciones</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? "No hay configuraciones que coincidan con su búsqueda."
                      : "No hay configuraciones disponibles."}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>Crear nueva configuración</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConfigs.map(renderConfigCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              {filteredConfigs.filter((config) => favoriteConfigs.includes(config.id)).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay configuraciones favoritas</h3>
                  <p className="text-gray-500">Marque configuraciones como favoritas para acceder rápidamente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConfigs.filter((config) => favoriteConfigs.includes(config.id)).map(renderConfigCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="user" className="mt-0">
              {filteredConfigs.filter((config) => !config.isBuiltIn).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay configuraciones personalizadas</h3>
                  <p className="text-gray-500 mb-4">Cree su primera configuración personalizada.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>Crear configuración</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConfigs.filter((config) => !config.isBuiltIn).map(renderConfigCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar configuración */}
      <CreateConfigDialog
        open={showCreateDialog || !!editingConfig}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false)
            setEditingConfig(null)
          }
        }}
        onSave={handleCreateConfig}
        currentConfig={currentConfig}
        editingConfig={editingConfig}
      />
    </>
  )
}

// Componente para crear/editar configuraciones
interface CreateConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: any) => void
  currentConfig?: Partial<ExportConfiguration>
  editingConfig?: ExportConfigTemplate | null
}

function CreateConfigDialog({ open, onOpenChange, onSave, currentConfig, editingConfig }: CreateConfigDialogProps) {
  const [formData, setFormData] = useState({
    name: editingConfig?.name || "",
    description: editingConfig?.description || "",
    category: editingConfig?.category || "personalizada",
    isShared: editingConfig?.isShared || false,
  })

  const handleSave = () => {
    if (!formData.name.trim()) return

    onSave(formData)
    setFormData({
      name: "",
      description: "",
      category: "personalizada",
      isShared: false,
    })
  }

  const categories = ["personalizada", "básica", "completa", "respaldo", "académica", "ejecutiva"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingConfig ? "Editar Configuración" : "Guardar Configuración"}</DialogTitle>
          <DialogDescription>
            {editingConfig
              ? "Modifique los detalles de la configuración"
              : "Guarde la configuración actual para reutilizarla en el futuro"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre descriptivo para la configuración"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describa el propósito de esta configuración"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isShared">Compartir con otros usuarios</Label>
            <Switch
              id="isShared"
              checked={formData.isShared}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isShared: checked }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()}>
            {editingConfig ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
