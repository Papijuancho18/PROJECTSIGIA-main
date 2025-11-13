import { EditorDiagnostics } from "@/components/editor-diagnostics"
import { MultilingualEditorTest } from "@/components/multilingual-editor-test"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditorTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Diagnóstico del Editor</h1>
      <p className="mb-6 text-gray-600">
        Esta herramienta te permite verificar si el editor de texto está funcionando correctamente.
      </p>

      <Tabs defaultValue="diagnostics" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostics">Diagnóstico General</TabsTrigger>
          <TabsTrigger value="multilingual">Prueba Multilingüe</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          <EditorDiagnostics />
        </TabsContent>

        <TabsContent value="multilingual">
          <MultilingualEditorTest />
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Instrucciones</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Usa la pestaña "Diagnóstico General" para verificar el funcionamiento básico del editor</li>
          <li>Usa la pestaña "Prueba Multilingüe" para probar con texto en diferentes idiomas</li>
          <li>Prueba escribiendo manualmente y también pegando texto desde otras fuentes</li>
          <li>Verifica especialmente el comportamiento con idiomas de derecha a izquierda (RTL)</li>
        </ol>
      </div>
    </div>
  )
}
