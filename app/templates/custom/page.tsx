"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateManager } from "@/components/template-manager"
import { StaffSidebar } from "@/components/staff-sidebar"
import { ArrowLeft, Plus, Settings } from "lucide-react"
import TemplateCreator from "@/components/template-creator" // Import TemplateCreator

export default function CustomTemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("manage")

  const handleBack = () => {
    router.push("/staff/reports")
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Informes
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Plantillas Personalizadas</h1>
          <p className="text-gray-500">Cree, gestione y comparta sus propias plantillas de exportación</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Gestionar Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Crear Nueva</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="mt-0">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <Card className="shadow-md border-primary/20">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle>Crear Nueva Plantilla</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TemplateCreator
                  onSave={async () => {
                    // Simulación de guardado
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    setActiveTab("manage")
                  }}
                  onCancel={() => setActiveTab("manage")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
