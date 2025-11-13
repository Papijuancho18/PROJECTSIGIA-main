export interface ExportFilter {
  categories?: string[]
  formats?: string[]
  dateRange?: {
    from: string
    to: string
  }
  tags?: string[]
  authors?: string[]
  favorites?: boolean
}

export interface ExportConfiguration {
  id: string
  name: string
  description: string
  isDefault?: boolean
  isShared?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string

  // Configuración de exportación
  format: "json" | "zip" | "package"
  includeAssets: boolean
  includeMetadata: boolean
  compression: boolean

  // Filtros de plantillas
  filters: ExportFilter

  // Configuraciones específicas por formato
  formatOptions: {
    json?: {
      prettyPrint: boolean
      includeValidation: boolean
    }
    zip?: {
      compressionLevel: number
      includeReadme: boolean
      folderStructure: "flat" | "categorized"
    }
    package?: {
      includeInstallScript: boolean
      includeDocumentation: boolean
      generateChecksums: boolean
      compatibilityCheck: boolean
    }
  }

  // Configuraciones de nomenclatura
  naming: {
    pattern: string // e.g., "plantillas-{format}-{date}-{time}"
    includeTimestamp: boolean
    includeUserName: boolean
    customPrefix?: string
    customSuffix?: string
  }

  // Configuraciones de notificación
  notifications?: {
    onComplete: boolean
    onError: boolean
    emailNotification?: boolean
    webhookUrl?: string
  }
}

export interface ExportConfigTemplate {
  id: string
  name: string
  description: string
  category: string
  isBuiltIn: boolean
  isShared: boolean
  configuration: Partial<ExportConfiguration>
  usageCount: number
  lastUsed?: string
}
