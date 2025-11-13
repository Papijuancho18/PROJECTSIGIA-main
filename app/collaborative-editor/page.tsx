"use client"

import { CollaborativeEditor } from "@/components/collaborative-editor"
import { CollaborationProvider } from "@/contexts/collaboration-context"
import { GlobalElementsProvider } from "@/contexts/global-elements-context"

export default function CollaborativeEditorPage() {
  return (
    <GlobalElementsProvider>
      <CollaborationProvider>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Editor Colaborativo</h1>
          <p className="mb-4 text-gray-600">
            Este editor permite que múltiples usuarios editen el mismo documento simultáneamente. Prueba a conectarte
            desde diferentes navegadores o pestañas para ver la colaboración en acción.
          </p>

          <div className="mb-8">
            <CollaborativeEditor
              documentId="doc-1"
              documentTitle="Documento de prueba"
              initialContent={`# Documento de prueba colaborativo

Este es un documento de ejemplo para probar la edición colaborativa. Puedes editar este texto, añadir tablas, gráficos y más.

## Instrucciones

1. Haz clic en el botón "Unirse" en la barra superior para entrar en modo colaborativo.
2. Introduce tu nombre y comienza a editar.
3. Abre otra pestaña o navegador y únete con un nombre diferente para ver la colaboración en acción.

## Características

- **Edición en tiempo real**: Ve los cambios de otros usuarios mientras escriben.
- **Cursores compartidos**: Observa dónde están editando otros usuarios.
- **Bloqueo de elementos**: Las tablas y gráficos se bloquean cuando alguien los edita.
- **Historial de cambios**: Accede al historial de modificaciones.

Prueba a insertar una tabla o un gráfico y editarlos colaborativamente.`}
              minHeight="500px"
              reportId="report-1"
              sectionId="section-1"
            />
          </div>
        </div>
      </CollaborationProvider>
    </GlobalElementsProvider>
  )
}
