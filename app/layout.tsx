import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { GlobalElementsProvider } from "@/contexts/global-elements-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gestión Académica",
  description: "Sistema integral para la gestión de informes académicos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <GlobalElementsProvider>
          {children}
          <Toaster />
        </GlobalElementsProvider>
      </body>
    </html>
  )
}
