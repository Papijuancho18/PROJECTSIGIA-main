import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: string
  tags?: string[]
  sections?: any[]
}

interface StaffTemplateSelectorProps {
  adminTemplates: Template[]
  staffTemplates: Template[]
}

const StaffTemplateSelector: React.FC<StaffTemplateSelectorProps> = ({ adminTemplates, staffTemplates }) => {
  return (
    <div className="space-y-6">
      {/* Admin Templates Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Plantillas
          {adminTemplates.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {adminTemplates.length} disponibles
            </Badge>
          )}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Secciones:</span>
                    <span className="font-medium">{template.sections?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creado por:</span>
                    <span className="font-medium">administrador</span>
                  </div>
                </div>

                {/* Eliminar completamente el botón Duplicar */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff Templates Section (Example - Adapt as needed) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Plantillas del Personal
          {staffTemplates.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {staffTemplates.length} disponibles
            </Badge>
          )}
        </h3>
        {/* Display Staff Templates Here - Example */}
        {staffTemplates.length === 0 ? (
          <p className="text-gray-500">No hay plantillas del personal disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Category: {template.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffTemplateSelector
