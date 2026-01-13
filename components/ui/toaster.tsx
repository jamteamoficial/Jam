'use client'
import { useToast } from '../../src/lib/hooks/use-toast'

export function Toaster() {
  const { currentToast } = useToast()
  if (!currentToast) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`rounded-lg shadow-lg p-4 min-w-[300px] ${
        currentToast.variant === 'destructive' 
          ? 'bg-red-600 text-white' 
          : 'bg-white border-l-4 border-purple-600 text-gray-800 shadow-xl'
      }`}>
        <h4 className="font-bold text-sm">{currentToast.title}</h4>
        {currentToast.description && (
          <p className="text-xs mt-1 opacity-90">{currentToast.description}</p>
        )}
      </div>
    </div>
  )
}
