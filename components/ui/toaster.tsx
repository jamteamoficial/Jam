'use client'

import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toast } = useToast()
  
  if (!toast) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-4 ${
        toast.variant === 'destructive' 
          ? 'bg-red-600 text-white' 
          : 'bg-white border-2 border-purple-200'
      }`}>
        <h4 className="font-bold">{toast.title}</h4>
        {toast.description && (
          <p className="text-sm mt-1">{toast.description}</p>
        )}
      </div>
    </div>
  )
}


