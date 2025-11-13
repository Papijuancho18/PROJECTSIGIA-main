"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CursorFixedEditor } from "./cursor-fixed-editor"
import { EnhancedIframeEditor } from "./enhanced-iframe-editor"
import { Button } from "@/components/ui/button"

export function TestEditorSelector() {
  const [content, setContent] = useState<Record<string, string>>({
    cursorFixed: "",
    enhancedIframe: "",
  })

  const [testText, setTestText] = useState("Este informe presenta los resultados del semestre 2023-2... Hola.")

  const handleContentChange = (editorType: string, newContent: string) => {
    setContent((prev) => ({
      ...prev,
      [editorType]: newContent,
    }))
  }

  const insertTestText = (editorType: string) => {
    handleContentChange(editorType, testText)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">Texto de prueba</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <Tabs defaultValue="cursorFixed">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="cursorFixed">Editor con Cursor Fijo</TabsTrigger>
          <TabsTrigger value="enhancedIframe">Editor Iframe Mejorado</TabsTrigger>
        </TabsList>

        <TabsContent value="cursorFixed" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => insertTestText("cursorFixed")}>Insertar texto de prueba</Button>
          </div>
          <CursorFixedEditor
            initialContent={content.cursorFixed}
            onChange={(newContent) => handleContentChange("cursorFixed", newContent)}
            minHeight="200px"
          />
          <div className="bg-gray-50 p-4 rounded-lg border mt-4">
            <h3 className="text-sm font-medium mb-2">HTML generado:</h3>
            <pre className="text-xs overflow-auto p-2 bg-white border rounded">{content.cursorFixed}</pre>
          </div>
        </TabsContent>

        <TabsContent value="enhancedIframe" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => insertTestText("enhancedIframe")}>Insertar texto de prueba</Button>
          </div>
          <EnhancedIframeEditor
            initialContent={content.enhancedIframe}
            onChange={(newContent) => handleContentChange("enhancedIframe", newContent)}
            minHeight="200px"
          />
          <div className="bg-gray-50 p-4 rounded-lg border mt-4">
            <h3 className="text-sm font-medium mb-2">HTML generado:</h3>
            <pre className="text-xs overflow-auto p-2 bg-white border rounded">{content.enhancedIframe}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
