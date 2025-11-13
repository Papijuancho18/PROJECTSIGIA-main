"use client"

import { CursorFixedEditor } from "./cursor-fixed-editor"

interface RichTextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  placeholder?: string
  minHeight?: string
  reportId?: string
  sectionId?: string
  readOnly?: boolean
}

export function RichTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Escriba aquí...",
  minHeight = "300px",
  reportId,
  sectionId,
  readOnly = false,
}: RichTextEditorProps) {
  return (
    <CursorFixedEditor
      initialContent={initialContent}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      reportId={reportId}
      sectionId={sectionId}
      readOnly={readOnly}
    />
  )
}
