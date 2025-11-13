"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TemplateTransferManager } from "@/components/template-transfer-manager"
import { StaffSidebar } from "@/components/staff-sidebar"
import { ArrowLeft } from "lucide-react"

export default function TemplateTransferPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/templates/custom")
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Plantillas
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Transferencia de Plantillas</h1>
          <p className="text-gray-500">
            Importe y exporte plantillas para compartir entre diferentes sistemas o hacer respaldos
          </p>
        </div>

        <TemplateTransferManager />
      </div>
    </div>
  )
}
