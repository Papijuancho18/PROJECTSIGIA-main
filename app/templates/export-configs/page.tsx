"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExportConfigManager } from "@/components/export-config-manager"
import { TemplateExportManager } from "@/components/template-export-manager"
import { StaffSidebar } from "@/components/staff-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Download } from "lucide-react"

export default function ExportConfigsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("configs")

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
          <h1 className="text-2xl font-bold text-primary">Configuraciones de Exportación</h1>
          <p className="text-gray-500">Gestione configuraciones reutilizables para exportar plantillas</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="configs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configuraciones</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="mt-0">
            <ExportConfigManager />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <TemplateExportManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
