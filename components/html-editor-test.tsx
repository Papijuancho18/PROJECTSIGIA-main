"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

export const HtmlEditorTest: React.FC = () => {
  const [content, setContent] = useState("Este informe presenta los resultados del semestre 2023-2...")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [showDebug, setShowDebug] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Función para mostrar información de depuración
  const showDebugInformation = () => {
    if (!content) {
      setDebugInfo("No hay contenido para analizar")
      return
    }

    // Convertir el contenido a representación hexadecimal para ver caracteres especiales
    const hexRepresentation = Array.from(content)
      .map((char) => {
        const hex = char.charCodeAt(0).toString(16).padStart(4, "0")
        return `${char} (U+${hex})`
      })
      .join(", ")

    // Detectar caracteres de control bidireccionales
    const bidiControls = content.match(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g)
    const hasBidiControls = bidiControls && bidiControls.length > 0

    const bidiInfo = hasBidiControls
      ? `Caracteres de control bidireccionales detectados: ${bidiControls.map((c) => `U+${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join(", ")}`
      : "No se detectaron caracteres de control bidireccionales"

    setDebugInfo(`
Representación de caracteres: ${hexRepresentation}

${bidiInfo}

Longitud del texto: ${content.length} caracteres
    `)

    setShowDebug(true)
  }

  // Función para limpiar caracteres de control
  const cleanBidiControls = () => {
    const cleaned = content.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
    setContent(cleaned)
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Prueba de Editor HTML</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Instrucciones:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Escribe o pega texto en el editor de abajo</li>
          <li>Observa cómo se comporta el cursor y la dirección del texto</li>
          <li>Usa el botón "Mostrar información de depuración" para ver detalles sobre los caracteres</li>
          <li>
            Prueba el botón "Limpiar caracteres de control" si sospechas que hay caracteres invisibles afectando la
            dirección
          </li>
        </ol>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-md font-medium mb-2">Editor de prueba:</h3>

        {/* Editor con dirección LTR forzada */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            direction: "ltr",
            unicodeBidi: "isolate",
            textAlign: "left",
          }}
          dir="ltr"
          onInput={(e) => setContent(e.currentTarget.textContent || "")}
          suppressContentEditableWarning={true}
        >
          {content}
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={showDebugInformation}>Mostrar información de depuración</Button>
          <Button variant="outline" onClick={cleanBidiControls}>
            Limpiar caracteres de control
          </Button>
        </div>
      </div>

      {showDebug && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-medium mb-2">Información de depuración:</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm overflow-x-auto">{debugInfo}</pre>
          <Button variant="outline" className="mt-2" onClick={() => setShowDebug(false)}>
            Ocultar
          </Button>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-blue-50">
        <h3 className="text-md font-medium mb-2">Pruebas adicionales:</h3>
        <p className="mb-4">Si sigues experimentando problemas, prueba estos enfoques:</p>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Textarea nativo con LTR forzado:</h4>
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md mt-2"
              style={{
                direction: "ltr",
                unicodeBidi: "isolate",
              }}
              dir="ltr"
              defaultValue={content}
            ></textarea>
          </div>

          <div>
            <h4 className="font-medium">Input de texto simple:</h4>
            <input
              type="text"
              className="w-full p-3 border rounded-md mt-2"
              style={{
                direction: "ltr",
                unicodeBidi: "isolate",
              }}
              dir="ltr"
              defaultValue={content}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
