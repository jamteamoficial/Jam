'use client'

import { useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

let toastState: Toast | null = null
let toastListeners: Array<(toast: Toast | null) => void> = []

export function useToast() {
  const toast = useCallback((newToast: Toast) => {
    toastState = newToast
    toastListeners.forEach((listener) => listener(newToast))

    const duration = newToast.duration || 3000
    setTimeout(() => {
      toastState = null
      toastListeners.forEach((listener) => listener(null))
    }, duration)
  }, [])

  return { toast }
}
