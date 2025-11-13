"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { WordLikeEditor } from "./word-like-editor"

interface EditorDiagnosticsProps {
  initialContent?: string
}

export function EditorDiagnostics({ initialContent = "" }: EditorDiagnosticsProps) {
  const [content, setContent] = useState(initialContent)
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testPhrase, setTestPhrase] = useState("")
  const [overallStatus, setOverallStatus] = useState<"success" | "warning" | "error" | "idle">("idle")
  const editorRef = useRef<HTMLDivElement>(null)

  // Tipo para los resultados de diagnóstico
  interface DiagnosticResult {
    test: string
    status: "success" | "warning" | "error"
    message: string
    details?: string
  }

  // Función para ejecutar diagnósticos
  const runDiagnostics = () => {
    setIsRunningTests(true)
    const results: DiagnosticResult[] = []

    // Test 1: Verificar dirección del texto
    const textDirectionTest = testTextDirection()
    results.push(textDirectionTest)

    // Test 2: Verificar caracteres de control bidireccionales
    const bidiControlTest = testBidiControlCharacters(content)
    results.push(bidiControlTest)

    // Test 3: Verificar si el texto ingresado coincide con lo esperado
    const textMatchTest = testTextMatch(testPhrase, content)
    results.push(textMatchTest)

    // Test 4: Verificar estructura HTML
    const htmlStructureTest = testHtmlStructure(content)
    results.push(htmlStructureTest)

    // Test 5: Verificar posición del cursor
    const cursorPositionTest = testCursorPosition()
    results.push(cursorPositionTest)

    // Determinar estado general
    if (results.some((r) => r.status === "error")) {
      setOverallStatus("error")
    } else if (results.some((r) => r.status === "warning")) {
      setOverallStatus("warning")
    } else {
      setOverallStatus("success")
    }

    setDiagnosticResults(results)
    setIsRunningTests(false)
  }

  // Test 1: Verificar dirección del texto
  const testTextDirection = (): DiagnosticResult => {
    if (!editorRef.current) {
      return {
        test: "Dirección del texto",
        status: "warning",
        message: "No se pudo verificar la dirección del texto",
        details: "El editor no está disponible para inspección",
      }
    }

    const editorElement = editorRef.current.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editorElement) {
      return {
        test: "Dirección del texto",
        status: "warning",
        message: "No se pudo verificar la dirección del texto",
        details: "No se encontró el elemento editable",
      }
    }

    const direction = window.getComputedStyle(editorElement).direction
    const textAlign = window.getComputedStyle(editorElement).textAlign
    const unicodeBidi = window.getComputedStyle(editorElement).unicodeBidi

    if (direction !== "ltr") {
      return {
        test: "Dirección del texto",
        status: "error",
        message: "La dirección del texto no es de izquierda a derecha (LTR)",
        details: `Dirección actual: ${direction}, debería ser 'ltr'`,
      }
    }

    if (textAlign !== "left" && textAlign !== "start") {
      return {
        test: "Alineación del texto",
        status: "warning",
        message: "La alineación del texto no es a la izquierda",
        details: `Alineación actual: ${textAlign}, debería ser 'left' o 'start'`,
      }
    }

    if (unicodeBidi !== "isolate" && unicodeBidi !== "plaintext") {
      return {
        test: "Comportamiento bidireccional",
        status: "warning",
        message: "El comportamiento bidireccional no está configurado correctamente",
        details: `Valor actual: ${unicodeBidi}, debería ser 'isolate' o 'plaintext'`,
      }
    }

    return {
      test: "Dirección del texto",
      status: "success",
      message: "La dirección del texto es correcta (LTR)",
      details: `Dirección: ${direction}, Alineación: ${textAlign}, Unicode-bidi: ${unicodeBidi}`,
    }
  }

  // Test 2: Verificar caracteres de control bidireccionales
  const testBidiControlCharacters = (text: string): DiagnosticResult => {
    // Expresión regular para detectar caracteres de control bidireccionales
    const bidiControlRegex = /[\u200E\u200F\u061C\u2066-\u2069]/g
    const matches = text.match(bidiControlRegex)

    if (matches && matches.length > 0) {
      const charCodes = matches.map((char) => `U+${char.charCodeAt(0).toString(16).padStart(4, "0")}`).join(", ")
      return {
        test: "Caracteres de control bidireccionales",
        status: "error",
        message: `Se detectaron ${matches.length} caracteres de control bidireccionales`,
        details: `Caracteres detectados: ${charCodes}`,
      }
    }

    return {
      test: "Caracteres de control bidireccionales",
      status: "success",
      message: "No se detectaron caracteres de control bidireccionales",
    }
  }

  // Test 3: Verificar si el texto ingresado coincide con lo esperado
  const testTextMatch = (expected: string, actual: string): DiagnosticResult => {
    if (!expected) {
      return {
        test: "Coincidencia de texto",
        status: "warning",
        message: "No se proporcionó texto de prueba para comparar",
      }
    }

    // Limpiar HTML para comparar solo texto
    const div = document.createElement("div")
    div.innerHTML = actual
    const actualText = div.textContent || div.innerText || ""

    if (!actualText.includes(expected)) {
      return {
        test: "Coincidencia de texto",
        status: "error",
        message: "El texto ingresado no coincide con lo esperado",
        details: `Esperado: "${expected}", Actual: "${actualText}"`,
      }
    }

    return {
      test: "Coincidencia de texto",
      status: "success",
      message: "El texto ingresado coincide con lo esperado",
    }
  }

  // Test 4: Verificar estructura HTML
  const testHtmlStructure = (html: string): DiagnosticResult => {
    // Verificar si hay etiquetas HTML mal formadas
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const errors = doc.querySelectorAll("parsererror")

      if (errors.length > 0) {
        return {
          test: "Estructura HTML",
          status: "error",
          message: "Se detectaron errores en la estructura HTML",
          details: errors[0].textContent || "Error de análisis HTML desconocido",
        }
      }

      // Verificar atributos dir y style
      const elements = doc.body.querySelectorAll("*")
      const elementsWithWrongDir = Array.from(elements).filter(
        (el) => el.getAttribute("dir") === "rtl" || (el as HTMLElement).style.direction === "rtl",
      )

      if (elementsWithWrongDir.length > 0) {
        return {
          test: "Estructura HTML",
          status: "warning",
          message: `Se encontraron ${elementsWithWrongDir.length} elementos con dirección RTL`,
          details: "Algunos elementos tienen atributos dir='rtl' o style='direction: rtl'",
        }
      }

      return {
        test: "Estructura HTML",
        status: "success",
        message: "La estructura HTML es correcta",
      }
    } catch (error) {
      return {
        test: "Estructura HTML",
        status: "error",
        message: "Error al analizar la estructura HTML",
        details: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Test 5: Verificar posición del cursor
  const testCursorPosition = (): DiagnosticResult => {
    if (!editorRef.current) {
      return {
        test: "Posición del cursor",
        status: "warning",
        message: "No se pudo verificar la posición del cursor",
        details: "El editor no está disponible para inspección",
      }
    }

    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return {
          test: "Posición del cursor",
          status: "warning",
          message: "No hay selección activa para verificar la posición del cursor",
        }
      }

      const range = selection.getRangeAt(0)
      const container = range.startContainer
      const offset = range.startOffset

      // Verificar si el contenedor está dentro del editor
      let isInEditor = false
      let node: Node | null = container
      while (node) {
        if (node === editorRef.current) {
          isInEditor = true
          break
        }
        node = node.parentNode
      }

      if (!isInEditor) {
        return {
          test: "Posición del cursor",
          status: "warning",
          message: "El cursor no está dentro del editor",
        }
      }

      return {
        test: "Posición del cursor",
        status: "success",
        message: "La posición del cursor es correcta",
        details: `Posición: ${offset}, Nodo: ${container.nodeName}`,
      }
    } catch (error) {
      return {
        test: "Posición del cursor",
        status: "error",
        message: "Error al verificar la posición del cursor",
        details: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Renderizar el componente
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico del Editor de Texto</CardTitle>
          <CardDescription>
            Herramienta para verificar si el editor de texto está funcionando correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frase de prueba (escribe esto en el editor)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhrase}
                  onChange={(e) => setTestPhrase(e.target.value)}
                  placeholder="Escribe una frase de prueba..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={() => setTestPhrase("El zorro marrón rápido salta sobre el perro perezoso.")}>
                  Usar frase predeterminada
                </Button>
              </div>
            </div>

            <div ref={editorRef} className="border rounded-md">
              <WordLikeEditor
                initialContent={content}
                onChange={setContent}
                placeholder="Escribe aquí para probar el editor..."
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={runDiagnostics} disabled={isRunningTests}>
                {isRunningTests ? "Ejecutando diagnósticos..." : "Ejecutar diagnósticos"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Resultados del diagnóstico</CardTitle>
              <Badge
                variant={
                  overallStatus === "success" ? "default" : overallStatus === "warning" ? "outline" : "destructive"
                }
              >
                {overallStatus === "success"
                  ? "Todo correcto"
                  : overallStatus === "warning"
                    ? "Advertencias"
                    : "Errores detectados"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnosticResults.map((result, index) => (
                <Alert
                  key={index}
                  variant={
                    result.status === "success" ? "default" : result.status === "warning" ? "outline" : "destructive"
                  }
                >
                  <div className="flex items-start gap-2">
                    {result.status === "success" ? (
                      <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                    ) : result.status === "warning" ? (
                      <AlertTriangle className="h-4 w-4 mt-1 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-1 text-red-500" />
                    )}
                    <div>
                      <AlertTitle>{result.test}</AlertTitle>
                      <AlertDescription>
                        <p>{result.message}</p>
                        {result.details && (
                          <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">{result.details}</pre>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Ejecuta los diagnósticos después de escribir en el editor para verificar su funcionamiento</span>
            </div>
            <Button variant="outline" onClick={() => setDiagnosticResults([])}>
              Limpiar resultados
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
