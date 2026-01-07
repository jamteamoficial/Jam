'use client'

import { useState, useEffect } from 'react'

export default function JamAnimation() {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const handleShowJamAnimation = () => {
      setShowAnimation(true)
      setTimeout(() => {
        setShowAnimation(false)
      }, 1000) // 1 segundo
    }

    window.addEventListener('showJamAnimation', handleShowJamAnimation)
    return () => {
      window.removeEventListener('showJamAnimation', handleShowJamAnimation)
    }
  }, [])

  if (!showAnimation) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="relative">
        <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-jam-scale drop-shadow-2xl">
          JAM
        </h1>
      </div>
    </div>
  )
}

