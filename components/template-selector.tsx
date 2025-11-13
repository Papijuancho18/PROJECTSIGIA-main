"use client"

import type React from "react"

interface Template {
  id: string
  name: string
  description: string
  is_admin_template: boolean
  can_edit: boolean
}

interface TemplateSelectorProps {
  templates: Template[]
  onSelect: (templateId: string) => void
}

const Badge = ({
  children,
  variant,
  className,
}: { children: React.ReactNode; variant: string; className?: string }) => {
  let badgeClass = "inline-flex items-center py-0.5 px-2.5 text-xs font-semibold rounded-full " + className

  switch (variant) {
    case "outline":
      badgeClass += " border "
      break
    default:
      break
  }

  return <span className={badgeClass}>{children}</span>
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect }) => {
  return (
    <div>
      {templates.map((template) => (
        <div
          key={template.id}
          className="mb-4 p-4 border rounded cursor-pointer hover:bg-gray-50"
          onClick={() => onSelect(template.id)}
        >
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-gray-600">{template.description}</p>

          {template.is_admin_template && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Plantilla del Administrador
            </Badge>
          )}

          {!template.can_edit && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              Solo lectura
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}

export { TemplateSelector }
export type { Template }
export default TemplateSelector
