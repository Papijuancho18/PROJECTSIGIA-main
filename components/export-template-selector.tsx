// components/export-template-selector.tsx

export interface ExportTemplate {
  id: string
  name: string
  format?: string
  styles: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    headerStyle: string
    includePageNumbers: boolean
    includeTableOfContents: boolean
    orientation: "portrait" | "landscape"
    fontSize?: {
      title: number
      heading: number
      subheading: number
      body: number
      table: number
    }
    lineSpacing?: number
    paragraphSpacing?: {
      before: number
      after: number
    }
    margins?: {
      top: number
      bottom: number
      left: number
      right: number
    }
    textAlignment?: "left" | "justified" | "center" | "right"
  }
}

export const predefinedTemplates: ExportTemplate[] = [
  {
    id: "academic-standard",
    name: "Estándar Académico",
    format: "pdf",
    styles: {
      fontFamily: "Calibri",
      primaryColor: "#003366",
      secondaryColor: "#6E56CF",
      headerStyle: "bold-uppercase",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "portrait",
      fontSize: {
        title: 18,
        heading: 14,
        subheading: 12,
        body: 11,
        table: 10,
      },
      lineSpacing: 1.15,
      paragraphSpacing: {
        before: 0,
        after: 6,
      },
      margins: {
        top: 2.5,
        bottom: 2.5,
        left: 3,
        right: 2.5,
      },
      textAlignment: "justified",
    },
  },
  {
    id: "modern-clean",
    name: "Moderno y Limpio",
    format: "pdf",
    styles: {
      fontFamily: "Arial",
      primaryColor: "#283747",
      secondaryColor: "#A9CCE3",
      headerStyle: "normal",
      includePageNumbers: true,
      includeTableOfContents: false,
      orientation: "portrait",
      fontSize: {
        title: 20,
        heading: 16,
        subheading: 14,
        body: 12,
        table: 11,
      },
      lineSpacing: 1.5,
      paragraphSpacing: {
        before: 3,
        after: 3,
      },
      margins: {
        top: 2,
        bottom: 2,
        left: 2,
        right: 2,
      },
      textAlignment: "left",
    },
  },
  {
    id: "minimalist",
    name: "Minimalista",
    format: "pdf",
    styles: {
      fontFamily: "Helvetica",
      primaryColor: "#333333",
      secondaryColor: "#777777",
      headerStyle: "bold",
      includePageNumbers: false,
      includeTableOfContents: false,
      orientation: "portrait",
      fontSize: {
        title: 22,
        heading: 18,
        subheading: 16,
        body: 12,
        table: 10,
      },
      lineSpacing: 1.0,
      paragraphSpacing: {
        before: 0,
        after: 0,
      },
      margins: {
        top: 1.5,
        bottom: 1.5,
        left: 1.5,
        right: 1.5,
      },
      textAlignment: "left",
    },
  },
  {
    id: "business-report",
    name: "Informe de Negocios",
    format: "pdf",
    styles: {
      fontFamily: "Times New Roman",
      primaryColor: "#000000",
      secondaryColor: "#808080",
      headerStyle: "bold",
      includePageNumbers: true,
      includeTableOfContents: true,
      orientation: "landscape",
      fontSize: {
        title: 16,
        heading: 14,
        subheading: 12,
        body: 10,
        table: 9,
      },
      lineSpacing: 1.0,
      paragraphSpacing: {
        before: 3,
        after: 3,
      },
      margins: {
        top: 2,
        bottom: 2,
        left: 2,
        right: 2,
      },
      textAlignment: "justified",
    },
  },
]
