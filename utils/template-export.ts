import JSZip from "jszip"

export interface ExportTemplate {
  id: string
  name: string
  description: string
  category: string
  format: string
  styles: any
  dependencies?: string[]
  thumbnail?: string
  createdAt?: string
  updatedAt?: string
}

export interface ExportOptions {
  format: "json" | "zip" | "package"
  includeAssets: boolean
  includeMetadata: boolean
  compression: boolean
}

export interface ExportMetadata {
  version: string
  exportDate: string
  exportedBy: string
  systemVersion: string
  totalTemplates: number
  format: string
  includeAssets: boolean
}

// Función para generar metadatos de exportación
export function generateExportMetadata(
  templates: ExportTemplate[],
  options: ExportOptions,
  exportedBy = "Usuario Actual",
): ExportMetadata {
  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    exportedBy,
    systemVersion: "2.1.0",
    totalTemplates: templates.length,
    format: options.format,
    includeAssets: options.includeAssets,
  }
}

// Función para exportar en formato JSON
export async function exportAsJSON(templates: ExportTemplate[], options: ExportOptions): Promise<Blob> {
  const exportData = {
    metadata: options.includeMetadata ? generateExportMetadata(templates, options) : undefined,
    templates: templates.map((template) => ({
      ...template,
      // Remover campos internos si es necesario
      thumbnail: options.includeAssets ? template.thumbnail : undefined,
    })),
  }

  const jsonString = JSON.stringify(exportData, null, options.compression ? 0 : 2)
  return new Blob([jsonString], { type: "application/json" })
}

// Función para descargar recursos asociados
async function downloadResource(url: string): Promise<Blob> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download resource: ${response.statusText}`)
    }
    return await response.blob()
  } catch (error) {
    console.warn(`Could not download resource ${url}:`, error)
    // Retornar un blob vacío como fallback
    return new Blob([""], { type: "text/plain" })
  }
}

// Función para exportar en formato ZIP
export async function exportAsZIP(templates: ExportTemplate[], options: ExportOptions): Promise<Blob> {
  const zip = new JSZip()

  // Añadir archivo principal de plantillas
  const templatesData = {
    metadata: options.includeMetadata ? generateExportMetadata(templates, options) : undefined,
    templates,
  }

  zip.file("templates.json", JSON.stringify(templatesData, null, 2))

  // Añadir recursos si está habilitado
  if (options.includeAssets) {
    const assetsFolder = zip.folder("assets")
    const resourcePromises: Promise<void>[] = []

    for (const template of templates) {
      if (template.dependencies && template.dependencies.length > 0) {
        for (const dependency of template.dependencies) {
          const resourcePromise = (async () => {
            try {
              // Simular descarga de recurso (en un caso real, esto vendría de tu API)
              const resourceUrl = `/assets/${dependency}`
              const resourceBlob = await downloadResource(resourceUrl)
              assetsFolder?.file(dependency, resourceBlob)
            } catch (error) {
              console.warn(`Could not include asset ${dependency}:`, error)
            }
          })()
          resourcePromises.push(resourcePromise)
        }
      }

      // Incluir thumbnail si existe
      if (template.thumbnail) {
        const thumbnailPromise = (async () => {
          try {
            const thumbnailBlob = await downloadResource(template.thumbnail!)
            const thumbnailName = `thumbnails/${template.id}.png`
            assetsFolder?.file(thumbnailName, thumbnailBlob)
          } catch (error) {
            console.warn(`Could not include thumbnail for ${template.id}:`, error)
          }
        })()
        resourcePromises.push(thumbnailPromise)
      }
    }

    // Esperar a que se descarguen todos los recursos
    await Promise.all(resourcePromises)
  }

  // Añadir archivo README
  const readmeContent = `# Plantillas Exportadas

Este archivo contiene ${templates.length} plantilla(s) exportada(s) del Sistema de Gestión Académica.

## Contenido:
- templates.json: Definiciones de las plantillas
${options.includeAssets ? "- assets/: Recursos asociados (imágenes, estilos, etc.)" : ""}

## Fecha de exportación: ${new Date().toLocaleString("es-ES")}

## Instrucciones de importación:
1. Use la función de importación del sistema
2. Seleccione este archivo ZIP
3. Configure las opciones de resolución de conflictos
4. Complete la importación

Para más información, consulte la documentación del sistema.
`

  zip.file("README.md", readmeContent)

  // Generar el archivo ZIP
  return await zip.generateAsync({
    type: "blob",
    compression: options.compression ? "DEFLATE" : "STORE",
    compressionOptions: {
      level: options.compression ? 6 : 0,
    },
  })
}

// Función para exportar en formato Package (más completo)
export async function exportAsPackage(templates: ExportTemplate[], options: ExportOptions): Promise<Blob> {
  const zip = new JSZip()

  // Metadatos más detallados para el formato package
  const packageMetadata = {
    ...generateExportMetadata(templates, options),
    packageFormat: "academic-management-templates",
    requiredSystemVersion: "2.0.0",
    compatibility: {
      minVersion: "2.0.0",
      maxVersion: "3.0.0",
    },
    checksums: {} as Record<string, string>,
  }

  // Añadir plantillas con validación
  const validatedTemplates = templates.map((template) => {
    // Validar estructura de la plantilla
    const errors: string[] = []
    if (!template.name) errors.push("Missing template name")
    if (!template.styles) errors.push("Missing template styles")

    return {
      ...template,
      validation: {
        isValid: errors.length === 0,
        errors,
        validatedAt: new Date().toISOString(),
      },
    }
  })

  const packageData = {
    metadata: packageMetadata,
    templates: validatedTemplates,
    schema: {
      version: "1.0",
      templateSchema: {
        required: ["id", "name", "description", "category", "format", "styles"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          format: { type: "string", enum: ["pdf", "word", "excel", "html"] },
          styles: { type: "object" },
        },
      },
    },
  }

  zip.file("package.json", JSON.stringify(packageData, null, 2))

  // Añadir recursos con checksums
  if (options.includeAssets) {
    const assetsFolder = zip.folder("assets")
    const checksums: Record<string, string> = {}

    for (const template of templates) {
      if (template.dependencies && template.dependencies.length > 0) {
        for (const dependency of template.dependencies) {
          try {
            const resourceBlob = await downloadResource(`/assets/${dependency}`)
            assetsFolder?.file(dependency, resourceBlob)

            // Generar checksum simple (en producción usarías una librería de hash)
            const checksum = await generateSimpleChecksum(resourceBlob)
            checksums[dependency] = checksum
          } catch (error) {
            console.warn(`Could not include asset ${dependency}:`, error)
          }
        }
      }
    }

    // Actualizar metadatos con checksums
    packageMetadata.checksums = checksums
    zip.file("package.json", JSON.stringify(packageData, null, 2))
  }

  // Añadir archivo de instalación
  const installScript = `#!/bin/bash
# Script de instalación para plantillas del Sistema de Gestión Académica
# Uso: ./install.sh [opciones]

echo "Instalando plantillas del Sistema de Gestión Académica..."
echo "Plantillas incluidas: ${templates.length}"
echo "Fecha de exportación: ${new Date().toLocaleString("es-ES")}"

# Aquí irían los comandos de instalación específicos del sistema
echo "Para instalar estas plantillas, use la función de importación del sistema web."
`

  zip.file("install.sh", installScript)

  // Añadir documentación
  const documentation = `# Documentación del Paquete de Plantillas

## Información General
- **Número de plantillas**: ${templates.length}
- **Formato del paquete**: academic-management-templates v1.0
- **Fecha de exportación**: ${new Date().toLocaleString("es-ES")}
- **Versión del sistema**: 2.1.0

## Plantillas Incluidas

${templates
  .map(
    (template) => `### ${template.name}
- **ID**: ${template.id}
- **Categoría**: ${template.category}
- **Formato**: ${template.format}
- **Descripción**: ${template.description}
${template.dependencies && template.dependencies.length > 0 ? `- **Dependencias**: ${template.dependencies.join(", ")}` : ""}
`,
  )
  .join("\n")}

## Estructura del Paquete

\`\`\`
package.json          # Metadatos y configuración del paquete
assets/              # Recursos asociados (imágenes, estilos, etc.)
install.sh           # Script de instalación
README.md           # Esta documentación
\`\`\`

## Instalación

1. Extraiga el contenido del paquete
2. Use la función de importación del sistema web
3. Seleccione el archivo package.json
4. Configure las opciones según sus necesidades
5. Complete la importación

## Compatibilidad

- **Versión mínima requerida**: 2.0.0
- **Versión máxima soportada**: 3.0.0
- **Formato de plantillas**: Compatible con todas las versiones 2.x

## Soporte

Para obtener ayuda con la instalación o uso de estas plantillas, consulte la documentación del sistema o contacte al administrador.
`

  zip.file("README.md", documentation)

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })
}

// Función auxiliar para generar checksum simple
async function generateSimpleChecksum(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  let hash = 0

  for (let i = 0; i < uint8Array.length; i++) {
    const char = uint8Array[i]
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16)
}

// Función principal de exportación
export async function exportTemplates(
  templates: ExportTemplate[],
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void,
): Promise<{ blob: Blob; filename: string }> {
  try {
    onProgress?.(10, "Preparando plantillas...")

    if (templates.length === 0) {
      throw new Error("No hay plantillas seleccionadas para exportar")
    }

    onProgress?.(30, "Validando datos...")

    // Validar plantillas
    const invalidTemplates = templates.filter((t) => !t.name || !t.styles)
    if (invalidTemplates.length > 0) {
      throw new Error(`${invalidTemplates.length} plantilla(s) tienen datos inválidos`)
    }

    onProgress?.(50, "Generando archivo...")

    let blob: Blob
    let extension: string

    switch (options.format) {
      case "json":
        blob = await exportAsJSON(templates, options)
        extension = "json"
        break
      case "zip":
        onProgress?.(60, "Recopilando recursos...")
        blob = await exportAsZIP(templates, options)
        extension = "zip"
        break
      case "package":
        onProgress?.(60, "Creando paquete completo...")
        blob = await exportAsPackage(templates, options)
        extension = "zip"
        break
      default:
        throw new Error(`Formato de exportación no soportado: ${options.format}`)
    }

    onProgress?.(90, "Finalizando...")

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `plantillas-${options.format}-${timestamp}.${extension}`

    onProgress?.(100, "Exportación completada")

    return { blob, filename }
  } catch (error) {
    throw new Error(`Error durante la exportación: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Función para descargar el archivo
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
