"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface EnhancedIframeEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function EnhancedIframeEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: EnhancedIframeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const lastSelectionRef = useRef<{ node: Node | null; offset: number } | null>(null)

  // Inicializar el iframe cuando se monta el componente
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) return

      // Configurar el documento del iframe
      iframeDoc.designMode = "on"

      // Establecer el HTML base con configuración LTR forzada
      iframeDoc.documentElement.setAttribute("dir", "ltr")
      iframeDoc.documentElement.setAttribute("lang", "es")
      iframeDoc.body.setAttribute("dir", "ltr")
      iframeDoc.body.style.direction = "ltr"
      iframeDoc.body.style.textAlign = "left"
      iframeDoc.body.style.unicodeBidi = "isolate"

      // Añadir estilos para forzar LTR
      const styleEl = iframeDoc.createElement("style")
      styleEl.textContent = `
        html, body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          padding: 10px;
          margin: 0;
          min-height: ${minHeight};
        }
        
        body:empty:before {
          content: "${placeholder}";
          color: #999;
          font-style: italic;
        }
      `
      iframeDoc.head.appendChild(styleEl)

      // Establecer el contenido inicial
      if (initialContent) {
        iframeDoc.body.innerHTML = initialContent
      }

      // Función para guardar la posición del cursor
      const saveSelection = () => {
        if (!iframeDoc.getSelection) return

        const selection = iframeDoc.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        lastSelectionRef.current = {
          node: range.startContainer,
          offset: range.startOffset,
        }

        if (debugMode) {
          console.log("Guardando selección:", lastSelectionRef.current)
        }
      }

      // Función para restaurar la posición del cursor
      const restoreSelection = () => {
        if (!lastSelectionRef.current || !lastSelectionRef.current.node) return

        try {
          const selection = iframeDoc.getSelection()
          if (!selection) return

          const range = iframeDoc.createRange()
          range.setStart(lastSelectionRef.current.node, lastSelectionRef.current.offset)
          range.collapse(true)

          selection.removeAllRanges()
          selection.addRange(range)

          if (debugMode) {
            console.log("Restaurando selección:", lastSelectionRef.current)
          }
        } catch (error) {
          console.error("Error al restaurar la selección:", error)
        }
      }

      // Manejar cambios en el contenido
      iframeDoc.body.oninput = () => {
        // Guardar la posición del cursor
        saveSelection()

        // Aplicar estilos LTR
        iframeDoc.body.style.direction = "ltr"
        iframeDoc.body.style.textAlign = "left"
        iframeDoc.body.setAttribute("dir", "ltr")

        // Limpiar caracteres de control bidireccionales
        const cleanHTML = iframeDoc.body.innerHTML.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")

        // Solo actualizar si hay cambios
        if (cleanHTML !== iframeDoc.body.innerHTML) {
          iframeDoc.body.innerHTML = cleanHTML

          // Restaurar la posición del cursor
          setTimeout(() => {
            restoreSelection()
          }, 0)
        }

        if (onChange) {
          onChange(iframeDoc.body.innerHTML)
        }
      }

      // Manejar eventos de teclado
      iframeDoc.body.onkeydown = (e) => {
        // Guardar la posición del cursor
        saveSelection()

        // Forzar LTR después de cada pulsación de tecla
        setTimeout(() => {
          iframeDoc.body.style.direction = "ltr"
          iframeDoc.body.style.textAlign = "left"
          iframeDoc.body.setAttribute("dir", "ltr")

          // Restaurar la posición del cursor
          restoreSelection()
        }, 0)
      }

      // Manejar eventos de clic
      iframeDoc.body.onclick = () => {
        // Guardar la posición del cursor después del clic
        setTimeout(() => {
          saveSelection()
        }, 0)
      }

      setIsReady(true)
    }
  }, [initialContent, placeholder, minHeight, onChange, debugMode])

  // Función para forzar LTR en el iframe
  const forceLTR = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Guardar la posición del cursor
    if (iframeDoc.getSelection) {
      const selection = iframeDoc.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        lastSelectionRef.current = {
          node: range.startContainer,
          offset: range.startOffset,
        }
      }
    }

    // Forzar LTR en todo el documento
    iframeDoc.documentElement.setAttribute("dir", "ltr")
    iframeDoc.body.setAttribute("dir", "ltr")
    iframeDoc.body.style.direction = "ltr"
    iframeDoc.body.style.textAlign = "left"
    iframeDoc.body.style.unicodeBidi = "isolate"

    // Forzar LTR en todos los elementos
    const allElements = iframeDoc.body.querySelectorAll("*")
    allElements.forEach((el) => {
      const element = el as HTMLElement
      element.style.direction = "ltr"
      element.style.textAlign = "left"
      element.setAttribute("dir", "ltr")
      element.style.unicodeBidi = "isolate"
    })

    // Limpiar caracteres de control bidireccionales
    const cleanHTML = iframeDoc.body.innerHTML.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, "")
    iframeDoc.body.innerHTML = cleanHTML

    if (onChange) {
      onChange(cleanHTML)
    }

    // Restaurar la posición del cursor
    setTimeout(() => {
      if (lastSelectionRef.current && lastSelectionRef.current.node) {
        try {
          const selection = iframeDoc.getSelection()
          if (!selection) return

          const range = iframeDoc.createRange()
          range.setStart(lastSelectionRef.current.node, lastSelectionRef.current.offset)
          range.collapse(true)

          selection.removeAllRanges()
          selection.addRange(range)
        } catch (error) {
          console.error("Error al restaurar la selección:", error)
        }
      }
    }, 0)
  }, [onChange])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Barra de herramientas básica */}
      <div className="bg-gray-50 border-b p-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const iframe = iframeRef.current
            if (!iframe) return

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) return

            iframeDoc.execCommand("bold", false)
          }}
        >
          Negrita
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const iframe = iframeRef.current
            if (!iframe) return

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) return

            iframeDoc.execCommand("italic", false)
          }}
        >
          Cursiva
        </Button>

        <div className="flex-1"></div>

        <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)}>
          {debugMode ? "Desactivar modo debug" : "Activar modo debug"}
        </Button>

        <Button variant="outline" size="sm" onClick={forceLTR}>
          Forzar dirección izquierda a derecha
        </Button>
      </div>

      {/* Iframe para el editor */}
      <iframe
        ref={iframeRef}
        className="w-full border-none"
        style={{ minHeight }}
        title="Editor de texto aislado"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={`<!DOCTYPE html><html dir="ltr" lang="es"><head><meta charset="UTF-8"></head><body dir="ltr" style="direction: ltr; text-align: left;"></body></html>`}
      />
    </div>
  )
}
