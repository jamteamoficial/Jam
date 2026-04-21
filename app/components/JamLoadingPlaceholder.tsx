'use client'

import { cn } from '@/src/lib/utils'

type JamLoadingPlaceholderProps = {
  className?: string
}

/**
 * Mensaje unificado mientras el cliente termina de hidratar o cargan datos.
 */
export default function JamLoadingPlaceholder({ className }: JamLoadingPlaceholderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-gray-600',
        className
      )}
    >
      <p className="text-lg font-semibold text-gray-800">Cargando JAM…</p>
      <p className="max-w-sm text-sm text-gray-500">Preparando tu experiencia en el navegador.</p>
    </div>
  )
}
