// Tipos para las reglas de validación
import {
  validateAccessibility,
  createAccessibilityValidationRules,
  getAccessibilityScore,
} from "./accessibility-validation"

export interface ValidationRule {
  id: string
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "custom"
    | "hasElement"
    | "hasChart"
    | "hasTable"
    | "accessibility"
  value?: any
  message: string
  severity: "error" | "warning" | "info"
  code?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  accessibilityScore?: number
}

export interface ValidationError {
  ruleId: string
  message: string
  severity: "error" | "warning" | "info"
  code?: string
}

// Función para validar contenido HTML
export function validateContent(content: string, rules: ValidationRule[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  }

  // Crear un elemento temporal para analizar el HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content || ""

  // Verificar accesibilidad si hay alguna regla de tipo "accessibility"
  const hasAccessibilityRule = rules.some((rule) => rule.type === "accessibility")

  if (hasAccessibilityRule) {
    const accessibilityIssues = validateAccessibility(content)
    const accessibilityRules = createAccessibilityValidationRules(content)

    // Añadir puntuación de accesibilidad
    result.accessibilityScore = getAccessibilityScore(accessibilityIssues)

    // Procesar cada regla de accesibilidad
    accessibilityRules.forEach((rule) => {
      const error: ValidationError = {
        ruleId: rule.id,
        message: rule.message,
        severity: rule.severity,
        code: rule.code,
      }

      switch (rule.severity) {
        case "error":
          result.errors.push(error)
          result.valid = false
          break
        case "warning":
          result.warnings.push(error)
          break
        case "info":
          result.info.push(error)
          break
      }
    })
  }

  // Aplicar cada regla de validación
  for (const rule of rules) {
    // Saltamos las reglas de accesibilidad ya que las procesamos arriba
    if (rule.type === "accessibility") continue

    let isValid = true

    switch (rule.type) {
      case "required":
        isValid = content !== undefined && content.trim() !== ""
        break

      case "minLength":
        // Obtener el texto sin HTML
        const textContent = tempDiv.textContent || ""
        isValid = textContent.length >= (rule.value as number)
        break

      case "maxLength":
        const maxTextContent = tempDiv.textContent || ""
        isValid = maxTextContent.length <= (rule.value as number)
        break

      case "pattern":
        const patternText = tempDiv.textContent || ""
        isValid = new RegExp(rule.value as string).test(patternText)
        break

      case "hasElement":
        // Verificar si contiene cierto elemento HTML
        isValid = tempDiv.querySelector(rule.value as string) !== null
        break

      case "hasChart":
        // Verificar si contiene un gráfico (buscamos elementos específicos que indiquen un gráfico)
        isValid = tempDiv.querySelector(".chart-container, [data-chart], svg, canvas") !== null
        break

      case "hasTable":
        // Verificar si contiene una tabla
        const tables = tempDiv.querySelectorAll("table")
        if (tables.length === 0) {
          isValid = false
        } else if (typeof rule.value === "object") {
          // Validar estructura de la tabla si se especifican requisitos
          const { minRows, minCols } = rule.value

          for (const table of tables) {
            const rows = table.querySelectorAll("tr")
            if (rows.length < minRows) {
              isValid = false
              break
            }

            // Verificar columnas en la primera fila
            if (rows.length > 0) {
              const cols = rows[0].querySelectorAll("th, td")
              if (cols.length < minCols) {
                isValid = false
                break
              }
            }
          }
        }
        break

      case "custom":
        // Función de validación personalizada
        if (typeof rule.value === "function") {
          isValid = rule.value(content, tempDiv)
        }
        break
    }

    if (!isValid) {
      const error: ValidationError = {
        ruleId: rule.id,
        message: rule.message,
        severity: rule.severity,
      }

      switch (rule.severity) {
        case "error":
          result.errors.push(error)
          result.valid = false
          break
        case "warning":
          result.warnings.push(error)
          break
        case "info":
          result.info.push(error)
          break
      }
    }
  }

  return result
}

// Función para generar reglas de validación predefinidas
export function createValidationRules(type: "text" | "chart" | "table", options?: any): ValidationRule[] {
  const rules: ValidationRule[] = []

  // Regla básica requerida para todos los tipos
  rules.push({
    id: "required",
    type: "required",
    message: "Este campo es obligatorio",
    severity: "error",
  })

  // Añadir regla de accesibilidad para todos los tipos
  rules.push({
    id: "accessibility",
    type: "accessibility",
    message: "Verificar accesibilidad",
    severity: "warning",
  })

  switch (type) {
    case "text":
      // Reglas para texto
      if (options?.minLength) {
        rules.push({
          id: "minLength",
          type: "minLength",
          value: options.minLength,
          message: `El texto debe tener al menos ${options.minLength} caracteres`,
          severity: "error",
        })
      }

      if (options?.maxLength) {
        rules.push({
          id: "maxLength",
          type: "maxLength",
          value: options.maxLength,
          message: `El texto no debe exceder ${options.maxLength} caracteres`,
          severity: "warning",
        })
      }

      if (options?.keywords && Array.isArray(options.keywords)) {
        // Verificar si el texto contiene ciertas palabras clave
        rules.push({
          id: "keywords",
          type: "custom",
          value: (content: string) => {
            const text = content.toLowerCase()
            return options.keywords.some((keyword: string) => text.includes(keyword.toLowerCase()))
          },
          message: `El texto debe incluir al menos una de las siguientes palabras clave: ${options.keywords.join(", ")}`,
          severity: "warning",
        })
      }
      break

    case "chart":
      // Reglas para gráficos
      rules.push({
        id: "hasChart",
        type: "hasChart",
        message: "Debe insertar un gráfico",
        severity: "error",
      })

      if (options?.requiredExplanation) {
        rules.push({
          id: "chartExplanation",
          type: "minLength",
          value: 50, // Mínimo 50 caracteres de explicación
          message: "Debe proporcionar una explicación detallada del gráfico (mínimo 50 caracteres)",
          severity: "error",
        })
      }
      break

    case "table":
      // Reglas para tablas
      rules.push({
        id: "hasTable",
        type: "hasTable",
        value: {
          minRows: options?.minRows || 2,
          minCols: options?.minCols || 2,
        },
        message: `La tabla debe tener al menos ${options?.minRows || 2} filas y ${options?.minCols || 2} columnas`,
        severity: "error",
      })

      if (options?.requiresHeader) {
        rules.push({
          id: "tableHeader",
          type: "hasElement",
          value: "table th",
          message: "La tabla debe incluir encabezados (elementos <th>)",
          severity: "warning",
        })
      }
      break
  }

  return rules
}

// Función para validar una sección completa con múltiples placeholders
export function validateSection(section: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
    accessibilityScore: 100, // Puntuación inicial perfecta
  }

  // Validar el contenido principal de la sección si es editable
  if (section.editable && section.validationRules) {
    const sectionValidation = validateContent(section.content, section.validationRules)

    result.errors = [...result.errors, ...sectionValidation.errors]
    result.warnings = [...result.warnings, ...sectionValidation.warnings]
    result.info = [...result.info, ...sectionValidation.info]

    // Actualizar puntuación de accesibilidad (tomamos la más baja)
    if (sectionValidation.accessibilityScore !== undefined) {
      result.accessibilityScore = Math.min(result.accessibilityScore, sectionValidation.accessibilityScore)
    }

    if (!sectionValidation.valid) {
      result.valid = false
    }
  }

  // Validar cada placeholder
  if (section.placeholders) {
    for (const placeholder of section.placeholders) {
      if (placeholder.validationRules) {
        const placeholderValidation = validateContent(placeholder.content, placeholder.validationRules)

        // Añadir el nombre del placeholder a los mensajes de error
        const prefixedErrors = placeholderValidation.errors.map((error) => ({
          ...error,
          message: `${placeholder.label}: ${error.message}`,
          code: error.code,
        }))

        const prefixedWarnings = placeholderValidation.warnings.map((warning) => ({
          ...warning,
          message: `${placeholder.label}: ${warning.message}`,
          code: warning.code,
        }))

        const prefixedInfo = placeholderValidation.info.map((info) => ({
          ...info,
          message: `${placeholder.label}: ${info.message}`,
          code: info.code,
        }))

        result.errors = [...result.errors, ...prefixedErrors]
        result.warnings = [...result.warnings, ...prefixedWarnings]
        result.info = [...result.info, ...prefixedInfo]

        // Actualizar puntuación de accesibilidad (tomamos la más baja)
        if (placeholderValidation.accessibilityScore !== undefined) {
          result.accessibilityScore = Math.min(result.accessibilityScore, placeholderValidation.accessibilityScore)
        }

        if (!placeholderValidation.valid) {
          result.valid = false
        }
      }
    }
  }

  return result
}
