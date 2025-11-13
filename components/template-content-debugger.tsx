"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TemplateContentDebuggerProps {
  template?: any
  sections?: any[]
}

export function TemplateContentDebugger({ template, sections }: TemplateContentDebuggerProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="fixed bottom-4 right-4 z-50">
        Debug Template
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Template Debug
          <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        {template && (
          <div>
            <strong>Template Info:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  id: template.id,
                  name: template.name,
                  sectionsCount: template.sections?.length || 0,
                  hasContent: !!template.content,
                  contentType: typeof template.content,
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {sections && (
          <div>
            <strong>Report Sections ({sections.length}):</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(
                sections.map((s) => ({
                  id: s.id,
                  title: s.title,
                  contentLength: s.content?.length || 0,
                  hasSubsections: s.subsections?.length > 0,
                })),
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
