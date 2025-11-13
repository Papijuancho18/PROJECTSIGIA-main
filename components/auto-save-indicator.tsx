"use client"

import { CheckCircle, Clock, Save, AlertCircle, Loader2 } from "lucide-react"
import type { AutoSaveState } from "@/hooks/use-auto-save"

interface AutoSaveIndicatorProps {
  state: AutoSaveState
  className?: string
}

export function AutoSaveIndicator({ state, className = "" }: AutoSaveIndicatorProps) {
  const getIcon = () => {
    switch (state.status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "saving":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Save className="h-4 w-4 text-gray-400" />
    }
  }

  const getText = () => {
    switch (state.status) {
      case "pending":
        return "Cambios pendientes..."
      case "saving":
        return "Guardando..."
      case "saved":
        return state.lastSaved ? `Guardado a las ${state.lastSaved.toLocaleTimeString()}` : "Guardado"
      case "error":
        return state.error || "Error al guardar"
      default:
        return "Sin cambios"
    }
  }

  const getTextColor = () => {
    switch (state.status) {
      case "pending":
        return "text-yellow-600"
      case "saving":
        return "text-blue-600"
      case "saved":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getIcon()}
      <span className={`text-sm ${getTextColor()}`}>{getText()}</span>
    </div>
  )
}
