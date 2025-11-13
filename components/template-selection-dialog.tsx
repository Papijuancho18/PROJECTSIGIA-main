"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AvailableTemplatesSelector } from "./available-templates-selector"
import type { EnhancedReportTemplate } from "@/lib/api"

interface TemplateSelectionDialogProps {
  onSelectTemplate: (template: EnhancedReportTemplate) => void
  buttonText?: string
}

export function TemplateSelectionDialog({
  onSelectTemplate,
  buttonText = "Crear nuevo informe",
}: TemplateSelectionDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSelectTemplate = (template: EnhancedReportTemplate) => {
    onSelectTemplate(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla</DialogTitle>
          <DialogDescription>Elige una plantilla para crear tu nuevo informe</DialogDescription>
        </DialogHeader>
        <AvailableTemplatesSelector onSelectTemplate={handleSelectTemplate} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
