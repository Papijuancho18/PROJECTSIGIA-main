export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface TemplateValidationRules {
  requireName: boolean
  requireDescription: boolean
  requireStyles: boolean
  requireCategory: boolean
  allowedFormats: string[]
  maxNameLength: number
  maxDescriptionLength: number
}

const defaultValidationRules: TemplateValidationRules = {
  requireName: true,
  requireDescription: true,
  requireStyles: true,
  requireCategory: true,
  allowedFormats: ["pdf", "word", "excel", "html"],
  maxNameLength: 100,
  maxDescriptionLength: 500,
}

export function validateTemplate(
  template: any,
  rules: TemplateValidationRules = defaultValidationRules,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validaciones obligatorias
  if (rules.requireName && (!template.name || template.name.trim() === "")) {
    errors.push("El nombre de la plantilla es obligatorio")
  }

  if (rules.requireDescription && (!template.description || template.description.trim() === "")) {
    warnings.push("Se recomienda añadir una descripción a la plantilla")
  }

  if (rules.requireStyles && !template.styles) {
    errors.push("La plantilla debe tener estilos definidos")
  }

  if (rules.requireCategory && (!template.category || template.category.trim() === "")) {
    warnings.push("Se recomienda asignar una categoría a la plantilla")
  }

  // Validaciones de formato
  if (template.format && !rules.allowedFormats.includes(template.format)) {
    errors.push(`Formato no soportado: ${template.format}. Formatos permitidos: ${rules.allowedFormats.join(", ")}`)
  }

  // Validaciones de longitud
  if (template.name && template.name.length > rules.maxNameLength) {
    errors.push(`El nombre es demasiado largo (máximo ${rules.maxNameLength} caracteres)`)
  }

  if (template.description && template.description.length > rules.maxDescriptionLength) {
    warnings.push(`La descripción es muy larga (máximo ${rules.maxDescriptionLength} caracteres recomendados)`)
  }

  // Validaciones de estilos
  if (template.styles) {
    if (!template.styles.fontFamily) {
      warnings.push("No se ha especificado una fuente")
    }

    if (!template.styles.primaryColor) {
      warnings.push("No se ha especificado un color primario")
    }

    if (!template.styles.orientation || !["portrait", "landscape"].includes(template.styles.orientation)) {
      warnings.push("Orientación de página no especificada o inválida")
    }
  }

  // Validaciones de dependencias
  if (template.dependencies && Array.isArray(template.dependencies)) {
    const invalidDependencies = template.dependencies.filter((dep: any) => typeof dep !== "string")
    if (invalidDependencies.length > 0) {
      errors.push("Algunas dependencias tienen formato inválido")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateTemplatesBatch(templates: any[]): {
  validTemplates: any[]
  invalidTemplates: any[]
  totalErrors: number
  totalWarnings: number
} {
  const validTemplates: any[] = []
  const invalidTemplates: any[] = []
  let totalErrors = 0
  let totalWarnings = 0

  templates.forEach((template) => {
    const validation = validateTemplate(template)

    if (validation.isValid) {
      validTemplates.push({
        ...template,
        validation,
      })
    } else {
      invalidTemplates.push({
        ...template,
        validation,
      })
    }

    totalErrors += validation.errors.length
    totalWarnings += validation.warnings.length
  })

  return {
    validTemplates,
    invalidTemplates,
    totalErrors,
    totalWarnings,
  }
}

// Función para generar un reporte de validación
export function generateValidationReport(templates: any[]): string {
  const { validTemplates, invalidTemplates, totalErrors, totalWarnings } = validateTemplatesBatch(templates)

  let report = `# Reporte de Validación de Plantillas\n\n`
  report += `**Fecha**: ${new Date().toLocaleString("es-ES")}\n`
  report += `**Total de plantillas**: ${templates.length}\n`
  report += `**Plantillas válidas**: ${validTemplates.length}\n`
  report += `**Plantillas inválidas**: ${invalidTemplates.length}\n`
  report += `**Total de errores**: ${totalErrors}\n`
  report += `**Total de advertencias**: ${totalWarnings}\n\n`

  if (invalidTemplates.length > 0) {
    report += `## Plantillas con Errores\n\n`
    invalidTemplates.forEach((template) => {
      report += `### ${template.name || "Sin nombre"} (ID: ${template.id})\n`
      if (template.validation.errors.length > 0) {
        report += `**Errores:**\n`
        template.validation.errors.forEach((error: string) => {
          report += `- ${error}\n`
        })
      }
      if (template.validation.warnings.length > 0) {
        report += `**Advertencias:**\n`
        template.validation.warnings.forEach((warning: string) => {
          report += `- ${warning}\n`
        })
      }
      report += `\n`
    })
  }

  if (validTemplates.some((t: any) => t.validation.warnings.length > 0)) {
    report += `## Plantillas Válidas con Advertencias\n\n`
    validTemplates
      .filter((t: any) => t.validation.warnings.length > 0)
      .forEach((template) => {
        report += `### ${template.name} (ID: ${template.id})\n`
        report += `**Advertencias:**\n`
        template.validation.warnings.forEach((warning: string) => {
          report += `- ${warning}\n`
        })
        report += `\n`
      })
  }

  return report
}
