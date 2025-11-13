"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h1>

        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un
          error.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Volver al Login</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">Ir al Inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
