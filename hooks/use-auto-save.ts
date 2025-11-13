"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseAutoSaveOptions {
  delay?: number // Tiempo de espera en ms antes de guardar (default: 2000)
  onSave: () => Promise<void> | void
  enabled?: boolean
}

export interface AutoSaveState {
  status: "idle" | "pending" | "saving" | "saved" | "error"
  lastSaved?: Date
  error?: string
}

export function useAutoSave({ delay = 2000, onSave, enabled = true }: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({ status: "idle" })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isEnabledRef = useRef(enabled)

  // Actualizar la referencia cuando cambie enabled
  useEffect(() => {
    isEnabledRef.current = enabled
  }, [enabled])

  const triggerSave = useCallback(async () => {
    if (!isEnabledRef.current) return

    setState((prev) => ({ ...prev, status: "saving" }))

    try {
      await onSave()
      setState({
        status: "saved",
        lastSaved: new Date(),
        error: undefined,
      })

      // Cambiar a idle después de 2 segundos
      setTimeout(() => {
        setState((prev) => (prev.status === "saved" ? { ...prev, status: "idle" } : prev))
      }, 2000)
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Error al guardar",
      })
    }
  }, [onSave])

  const debouncedSave = useCallback(() => {
    if (!isEnabledRef.current) return

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Establecer estado pendiente
    setState((prev) => ({ ...prev, status: "pending" }))

    // Programar guardado
    timeoutRef.current = setTimeout(triggerSave, delay)
  }, [delay, triggerSave])

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    triggerSave()
  }, [triggerSave])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState((prev) => ({ ...prev, status: "idle" }))
  }, [])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    debouncedSave,
    saveNow,
    cancel,
  }
}
