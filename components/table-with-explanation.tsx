import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataExplanation } from "@/components/data-explanation"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface TableWithExplanationProps {
  title: string
  description?: string
  insights: {
    text: string
    trend?: "up" | "down" | "neutral"
    highlight?: boolean
  }[]
  showExport?: boolean
  children: React.ReactNode
}

export function TableWithExplanation({
  title,
  description,
  insights,
  showExport = true,
  children,
}: TableWithExplanationProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {showExport && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-hidden">{children}</div>

        <DataExplanation title="Análisis de los Datos" insights={insights} />
      </CardContent>
    </Card>
  )
}
