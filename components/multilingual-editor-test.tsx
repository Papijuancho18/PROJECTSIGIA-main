"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordLikeEditor } from "./word-like-editor"

const sampleTexts = {
  spanish: "El rápido zorro marrón salta sobre el perro perezoso.",
  english: "The quick brown fox jumps over the lazy dog.",
  arabic: "الثعلب البني السريع يقفز فوق الكلب الكسول.",
  hebrew: "השועל החום המהיר קופץ מעל הכלב העצלן.",
  mixed: "English text with بعض النص العربي and some עברית text mixed in.",
}

export function MultilingualEditorTest() {
  const [editorContent, setEditorContent] = useState("")
  const [activeTab, setActiveTab] = useState("spanish")
  const [editorOutput, setEditorOutput] = useState<{
    rawHtml: string
    textContent: string
    charCodes: string
  }>({
    rawHtml: "",
    textContent: "",
    charCodes: "",
  })

  const analyzeText = () => {
    // Obtener el contenido HTML
    const rawHtml = editorContent

    // Obtener el contenido de texto
    const div = document.createElement("div")
    div.innerHTML = rawHtml
    const textContent = div.textContent || div.innerText || ""

    // Obtener códigos de caracteres
    const charCodes = Array.from(textContent)
      .map((char) => {
        const code = char.charCodeAt(0)
        return `${char}: U+${code.toString(16).padStart(4, "0")}`
      })
      .join("\n")

    setEditorOutput({
      rawHtml,
      textContent,
      charCodes,
    })
  }

  const insertSampleText = () => {
    setEditorContent(sampleTexts[activeTab as keyof typeof sampleTexts])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Editor Multilingüe</CardTitle>
          <CardDescription>Prueba el editor con texto en diferentes idiomas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="spanish">Español</TabsTrigger>
              <TabsTrigger value="english">Inglés</TabsTrigger>
              <TabsTrigger value="arabic">Árabe (RTL)</TabsTrigger>
              <TabsTrigger value="hebrew">Hebreo (RTL)</TabsTrigger>
              <TabsTrigger value="mixed">Mixto</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-4">
            <Button onClick={insertSampleText} variant="outline" size="sm">
              Insertar texto de ejemplo
            </Button>
          </div>

          <div className="border rounded-md mb-4">
            <WordLikeEditor
              initialContent={editorContent}
              onChange={setEditorContent}
              placeholder="Escribe o pega texto aquí..."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={analyzeText}>Analizar texto</Button>
          </div>
        </CardContent>
      </Card>

      {editorOutput.rawHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis del texto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">HTML sin procesar:</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                  {editorOutput.rawHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Contenido de texto:</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">{editorOutput.textContent}</pre>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Códigos de caracteres:</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs h-60 overflow-y-auto">
                  {editorOutput.charCodes}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Los caracteres de control bidireccionales (U+200E, U+200F, U+061C, U+2066-U+2069) pueden causar problemas
              con la dirección del texto.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
