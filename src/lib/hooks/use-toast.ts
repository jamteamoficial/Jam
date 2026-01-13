import { useState, useEffect } from 'react'

type ToastProps = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let listeners: Array<(toast: ToastProps | null) => void> = []
let memoryToast: ToastProps | null = null

function dispatch(toast: ToastProps | null) {
  memoryToast = toast
  listeners.forEach((listener) => listener(toast))
}

export function toast(props: ToastProps) {
  dispatch(props)
  setTimeout(() => {
    dispatch(null)
  }, 3000)
}

export function useToast() {
  const [currentToast, setCurrentToast] = useState<ToastProps | null>(memoryToast)

  useEffect(() => {
    listeners.push(setCurrentToast)
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToast)
    }
  }, [])

  return { currentToast, toast }
}
