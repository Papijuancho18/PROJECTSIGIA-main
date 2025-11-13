"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle } from "lucide-react"

export function EditorGuide() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 h-10 w-10 rounded-full shadow-md bg-white"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guía del Editor</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tables">Tablas</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="collaboration">Colaboración</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Uso básico del editor</h3>
                <p>
                  El editor te permite crear y editar documentos con formato enriquecido, incluyendo tablas y gráficos.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Usa los botones de la barra de herramientas para dar formato al texto.</li>
                  <li>Puedes insertar imágenes, tablas y gráficos usando los botones correspondientes.</li>
                  <li>Cambia entre modo edición y vista previa con el botón "Vista previa".</li>
                  <li>Usa los botones de deshacer y rehacer para corregir errores.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Atajos de teclado</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border rounded">
                    <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+B</span> - Negrita
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+I</span> - Cursiva
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+U</span> - Subrayado
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+Z</span> - Deshacer
                  </div>
                  <div className="p-2 border rounded">
                    <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+Y</span> - Rehacer
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Insertar tablas</h3>
                <p>Puedes insertar tablas predefinidas o personalizadas en tu documento.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Haz clic en el botón de tabla <span className="inline-block p-1 bg-gray-100 rounded">+</span> en la
                    barra de herramientas.
                  </li>
                  <li>Selecciona una plantilla predefinida o crea una tabla personalizada.</li>
                  <li>Haz clic en "Insertar" para añadir la tabla a tu documento.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Editar tablas</h3>
                <p>Una vez insertada una tabla, puedes editarla usando el editor visual.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el botón "Editar" que aparece junto a la tabla.</li>
                  <li>Usa las pestañas para modificar datos, estilo o ver la vista previa.</li>
                  <li>Puedes añadir/eliminar filas y columnas, mover elementos y más.</li>
                  <li>Haz clic en "Guardar Cambios" cuando termines.</li>
                </ol>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded text-blue-700">
                  <strong>Consejo:</strong> En modo colaborativo, solo un usuario puede editar una tabla a la vez.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Insertar gráficos</h3>
                <p>Puedes insertar diferentes tipos de gráficos para visualizar datos.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Haz clic en el botón de gráfico <span className="inline-block p-1 bg-gray-100 rounded">+</span> en
                    la barra de herramientas.
                  </li>
                  <li>Selecciona una plantilla o un tipo de gráfico (barras, líneas, circular, etc.).</li>
                  <li>Haz clic en "Insertar" para añadir el gráfico a tu documento.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Editar gráficos</h3>
                <p>Personaliza tus gráficos con el editor visual.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el botón "Editar" que aparece junto al gráfico.</li>
                  <li>Modifica los datos, etiquetas y valores en la pestaña "Datos".</li>
                  <li>Cambia el tipo de gráfico en la pestaña "Tipo".</li>
                  <li>Personaliza colores y estilos en la pestaña "Estilo".</li>
                  <li>Visualiza los cambios en la pestaña "Vista Previa".</li>
                  <li>Haz clic en "Guardar Cambios" cuando termines.</li>
                </ol>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded text-blue-700">
                  <strong>Consejo:</strong> Puedes añadir nuevos puntos de datos haciendo clic en el botón "+" en la
                  tabla de datos.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Edición colaborativa</h3>
                <p>El editor permite que múltiples usuarios trabajen en el mismo documento simultáneamente.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el botón "Unirse" en la barra de colaboración.</li>
                  <li>Introduce tu nombre y haz clic en "Unirse".</li>
                  <li>Ahora estás en modo colaborativo y puedes ver a otros usuarios.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Características colaborativas</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Cursores en tiempo real:</strong> Ve dónde están editando otros usuarios.
                  </li>
                  <li>
                    <strong>Bloqueo de elementos:</strong> Las tablas y gráficos se bloquean automáticamente cuando
                    alguien los edita.
                  </li>
                  <li>
                    <strong>Lista de usuarios:</strong> Ve quién está colaborando haciendo clic en el botón "Usuarios".
                  </li>
                  <li>
                    <strong>Historial de cambios:</strong> Accede al historial de modificaciones con el botón
                    "Historial".
                  </li>
                </ul>
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded text-yellow-700">
                  <strong>Importante:</strong> Si otro usuario está editando una tabla o gráfico, deberás esperar a que
                  termine antes de poder editarlo tú.
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Desconectar</h3>
                <p>Para salir del modo colaborativo, haz clic en el botón "Desconectar" en la barra de colaboración.</p>
                <p>Esto liberará todos los elementos que tengas bloqueados y ocultará tu cursor a otros usuarios.</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
