"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface IframeIsolatedEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function IframeIsolatedEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: IframeIsolatedEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)

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

      // Manejar cambios en el contenido
      iframeDoc.body.oninput = () => {
        if (onChange) {
          onChange(iframeDoc.body.innerHTML)
        }
      }

      // Manejar eventos de teclado
      iframeDoc.body.onkeydown = (e) => {
        // Forzar LTR después de cada pulsación de tecla
        setTimeout(() => {
          iframeDoc.body.style.direction = "ltr"
          iframeDoc.body.style.textAlign = "left"
          iframeDoc.body.setAttribute("dir", "ltr")
        }, 0)
      }

      setIsReady(true)
    }
  }, [initialContent, placeholder, minHeight, onChange])

  // Función para forzar LTR en el iframe
  const forceLTR = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

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
  }

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
        srcDoc={`<!DOCTYPE html><html dir="ltr"><head><meta charset="UTF-8"></head><body dir="ltr" style="direction: ltr; text-align: left;"></body></html>`}
      />
    </div>
  )
}
