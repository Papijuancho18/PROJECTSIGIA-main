"use client"

import { TemplateAvailabilityDebugger } from "@/components/template-availability-debugger"

export default function DebugAvailabilityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Diagnóstico de Disponibilidad de Plantillas</h1>
      <TemplateAvailabilityDebugger />
    </div>
  )
}
