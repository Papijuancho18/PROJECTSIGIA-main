// Tipos para la validación de accesibilidad
export interface AccessibilityIssue {
  element: string
  issue: string
  impact: "critical" | "serious" | "moderate" | "minor"
  suggestion: string
  code?: string
}

// Función para verificar el contraste de color (simulada)
function checkColorContrast(color1: string, color2: string): boolean {
  // En una implementación real, calcularíamos el ratio de contraste según WCAG
  // Para este ejemplo, simplemente devolvemos true/false
  return true
}

// Función para extraer el color de un elemento (simulada)
function extractColor(element: HTMLElement): string {
  return element.style.color || "inherit"
}

// Función para extraer el color de fondo de un elemento (simulada)
function extractBackgroundColor(element: HTMLElement): string {
  return element.style.backgroundColor || "inherit"
}

// Función principal para validar accesibilidad
export function validateAccessibility(content: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  // Crear un elemento temporal para analizar el HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content || ""

  // 1. Verificar imágenes sin texto alternativo
  const images = tempDiv.querySelectorAll("img")
  images.forEach((img, index) => {
    if (!img.hasAttribute("alt")) {
      issues.push({
        element: `img-${index}`,
        issue: "Imagen sin texto alternativo",
        impact: "critical",
        suggestion: "Añada un atributo alt descriptivo a la imagen",
        code: img.outerHTML,
      })
    } else if (img.getAttribute("alt") === "") {
      // Las imágenes decorativas pueden tener alt="", pero verificamos si realmente son decorativas
      if (img.width > 50 && img.height > 50 && !img.classList.contains("decorative")) {
        issues.push({
          element: `img-${index}`,
          issue: "Imagen posiblemente informativa con alt vacío",
          impact: "moderate",
          suggestion: "Si la imagen transmite información, proporcione un texto alternativo descriptivo",
          code: img.outerHTML,
        })
      }
    }
  })

  // 2. Verificar estructura de encabezados
  const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6")
  let previousLevel = 0

  headings.forEach((heading, index) => {
    const currentLevel = Number.parseInt(heading.tagName.substring(1))

    // Verificar saltos en la jerarquía (por ejemplo, de h2 a h4)
    if (previousLevel > 0 && currentLevel > previousLevel + 1) {
      issues.push({
        element: `heading-${index}`,
        issue: `Salto en la jerarquía de encabezados (de h${previousLevel} a h${currentLevel})`,
        impact: "serious",
        suggestion: `Utilice h${previousLevel + 1} en lugar de h${currentLevel} para mantener una estructura jerárquica adecuada`,
        code: heading.outerHTML,
      })
    }

    // Verificar encabezados vacíos
    if (heading.textContent?.trim() === "") {
      issues.push({
        element: `heading-${index}`,
        issue: "Encabezado vacío",
        impact: "serious",
        suggestion: "Los encabezados deben contener texto descriptivo",
        code: heading.outerHTML,
      })
    }

    previousLevel = currentLevel
  })

  // 3. Verificar enlaces sin texto descriptivo
  const links = tempDiv.querySelectorAll("a")
  links.forEach((link, index) => {
    const linkText = link.textContent?.trim() || ""

    if (linkText === "") {
      issues.push({
        element: `link-${index}`,
        issue: "Enlace sin texto",
        impact: "critical",
        suggestion: "Añada texto descriptivo al enlace",
        code: link.outerHTML,
      })
    } else if (
      linkText.toLowerCase() === "click aquí" ||
      linkText.toLowerCase() === "haga clic aquí" ||
      linkText.toLowerCase() === "aquí" ||
      linkText.toLowerCase() === "leer más" ||
      linkText.toLowerCase() === "más"
    ) {
      issues.push({
        element: `link-${index}`,
        issue: "Enlace con texto genérico no descriptivo",
        impact: "moderate",
        suggestion: "Utilice texto que describa el destino o propósito del enlace",
        code: link.outerHTML,
      })
    }

    // Verificar enlaces que se abren en nueva ventana sin aviso
    if (
      link.getAttribute("target") === "_blank" &&
      !link.textContent?.toLowerCase().includes("nueva ventana") &&
      !link.textContent?.toLowerCase().includes("nueva pestaña") &&
      !link.getAttribute("aria-label")?.toLowerCase().includes("nueva")
    ) {
      issues.push({
        element: `link-${index}`,
        issue: "Enlace que se abre en nueva ventana sin indicación",
        impact: "moderate",
        suggestion: "Indique que el enlace se abre en una nueva ventana/pestaña en el texto o con aria-label",
        code: link.outerHTML,
      })
    }
  })

  // 4. Verificar tablas accesibles
  const tables = tempDiv.querySelectorAll("table")
  tables.forEach((table, index) => {
    // Verificar si tiene caption
    if (!table.querySelector("caption")) {
      issues.push({
        element: `table-${index}`,
        issue: "Tabla sin caption",
        impact: "moderate",
        suggestion: "Añada un elemento <caption> que describa el propósito de la tabla",
        code: table.outerHTML.substring(0, 100) + "...",
      })
    }

    // Verificar encabezados de tabla
    const hasRowHeaders = table.querySelectorAll("th[scope='row']").length > 0
    const hasColHeaders = table.querySelectorAll("th[scope='col']").length > 0

    if (!hasRowHeaders && !hasColHeaders) {
      const hasAnyTh = table.querySelectorAll("th").length > 0

      if (hasAnyTh) {
        issues.push({
          element: `table-${index}`,
          issue: "Encabezados de tabla sin atributo scope",
          impact: "moderate",
          suggestion: "Añada scope='col' a los encabezados de columna y scope='row' a los encabezados de fila",
          code: table.outerHTML.substring(0, 100) + "...",
        })
      } else {
        issues.push({
          element: `table-${index}`,
          issue: "Tabla sin encabezados",
          impact: "serious",
          suggestion: "Utilice elementos <th> para los encabezados de la tabla",
          code: table.outerHTML.substring(0, 100) + "...",
        })
      }
    }
  })

  // 5. Verificar uso de elementos semánticos
  if (tempDiv.querySelectorAll("main, article, section, nav, header, footer").length === 0) {
    issues.push({
      element: "document",
      issue: "Falta de elementos semánticos",
      impact: "moderate",
      suggestion: "Utilice elementos semánticos como <main>, <article>, <section>, etc. para estructurar el contenido",
      code: "...",
    })
  }

  // 6. Verificar listas correctamente marcadas
  const listItems = tempDiv.querySelectorAll("li")
  listItems.forEach((item, index) => {
    if (!item.parentElement || (item.parentElement.tagName !== "UL" && item.parentElement.tagName !== "OL")) {
      issues.push({
        element: `list-item-${index}`,
        issue: "Elemento de lista (<li>) fuera de una lista (<ul> o <ol>)",
        impact: "moderate",
        suggestion: "Los elementos <li> deben estar dentro de elementos <ul> o <ol>",
        code: item.outerHTML,
      })
    }
  })

  // 7. Verificar uso de atributos ARIA
  const ariaElements = tempDiv.querySelectorAll("[aria-hidden], [aria-label], [role]")
  ariaElements.forEach((element, index) => {
    // Verificar uso incorrecto de aria-hidden en elementos focusables
    if (element.getAttribute("aria-hidden") === "true") {
      const isFocusable =
        element.tagName === "A" ||
        element.tagName === "BUTTON" ||
        element.tagName === "INPUT" ||
        element.tagName === "SELECT" ||
        element.tagName === "TEXTAREA" ||
        element.hasAttribute("tabindex")

      if (isFocusable) {
        issues.push({
          element: `aria-${index}`,
          issue: "Elemento focusable con aria-hidden='true'",
          impact: "critical",
          suggestion: "No utilice aria-hidden='true' en elementos que pueden recibir foco",
          code: element.outerHTML,
        })
      }
    }
  })

  return issues
}

// Función para convertir problemas de accesibilidad a reglas de validación
export function createAccessibilityValidationRules(content: string) {
  const accessibilityIssues = validateAccessibility(content)

  return accessibilityIssues.map((issue) => ({
    id: `accessibility-${issue.element}`,
    type: "custom" as const,
    value: () => false, // Siempre fallará porque ya hemos detectado el problema
    message: `${issue.issue}. Sugerencia: ${issue.suggestion}`,
    severity: issue.impact === "critical" || issue.impact === "serious" ? ("error" as const) : ("warning" as const),
    code: issue.code,
  }))
}

// Función para obtener una puntuación de accesibilidad
export function getAccessibilityScore(issues: AccessibilityIssue[]): number {
  // Ponderación por tipo de impacto
  const weights = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1,
  }

  // Calcular puntuación total de problemas (mayor es peor)
  let totalIssueScore = 0
  issues.forEach((issue) => {
    totalIssueScore += weights[issue.impact]
  })

  // Convertir a una escala de 0-100 donde 100 es perfecto
  // Asumimos que 50 puntos de problemas equivale a 0 de accesibilidad
  const accessibilityScore = Math.max(0, 100 - totalIssueScore * 2)

  return Math.round(accessibilityScore)
}
