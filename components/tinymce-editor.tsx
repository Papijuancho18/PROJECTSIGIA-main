"use client"

import { useEffect, useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"

interface TinyMCEEditorProps {
  initialContent: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function TinyMCEEditor({
  initialContent,
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [editorContent, setEditorContent] = useState(initialContent || "")

  // Configuración para forzar LTR
  const forceLTR = () => {
    if (editorRef.current && editorRef.current.editor) {
      const editor = editorRef.current.editor

      // Forzar dirección LTR en el cuerpo del editor
      editor.getBody().style.direction = "ltr"
      editor.getBody().style.textAlign = "left"
      editor.getBody().setAttribute("dir", "ltr")

      // Aplicar CSS para forzar LTR en todos los elementos
      const styleTag = editor.dom.create(
        "style",
        { type: "text/css" },
        `
        body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: plaintext !important;
        }
      `,
      )

      editor.getDoc().head.appendChild(styleTag)

      // Configurar el editor para usar LTR
      editor.settings.directionality = "ltr"
    }
  }

  // Manejar cambios en el contenido
  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    onChange(content)
  }

  // Inicializar el editor
  useEffect(() => {
    if (isEditorReady) {
      forceLTR()
    }
  }, [isEditorReady])

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        apiKey="no-api-key" // Reemplazar con tu API key de TinyMCE si tienes una
        onInit={(evt, editor) => {
          editorRef.current = editor
          setIsEditorReady(true)
        }}
        initialValue={initialContent}
        onEditorChange={handleEditorChange}
        init={{
          height: Number.parseInt(minHeight) || 300,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help",
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              font-size: 14px;
              direction: ltr !important;
              text-align: left !important;
            }
          `,
          directionality: "ltr",
          placeholder: placeholder,
          setup: (editor) => {
            editor.on("init", () => {
              // Forzar LTR después de la inicialización
              forceLTR()
            })

            editor.on("NodeChange", () => {
              // Forzar LTR después de cada cambio en el DOM
              forceLTR()
            })

            editor.on("keydown", (e) => {
              // Forzar LTR después de cada pulsación de tecla
              setTimeout(forceLTR, 0)
            })
          },
        }}
      />
    </div>
  )
}
