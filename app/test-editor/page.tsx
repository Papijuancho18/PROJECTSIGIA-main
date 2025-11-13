"use client"

import { TestEditorSelector } from "@/components/test-editor-selector"

export default function TestEditorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Prueba de Soluciones para Dirección de Texto</h1>
      <p className="text-center mb-8">
        Estas soluciones están diseñadas para corregir problemas de dirección de texto y comportamiento del cursor.
      </p>
      <TestEditorSelector />
    </div>
  )
}
