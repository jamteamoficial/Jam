import { useState, useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastState: Toast | null = null
let toastListeners: ((toast: Toast | null) => void)[] = []

export function useToast() {
  const [toast, setToastState] = useState<Toast | null>(toastState)

  const showToast = useCallback((toastData: Toast) => {
    toastState = toastData
    toastListeners.forEach(listener => listener(toastData))
    setTimeout(() => {
      toastState = null
      toastListeners.forEach(listener => listener(null))
    }, 3000)
  }, [])

  return {
    toast,
    toast: showToast
  }
}

