'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'

interface GoogleLoginProps {
  /** Texto del botón (por defecto: Google) */
  label?: string
  /** Estilo compacto (header) o destacado (banner) */
  variant?: 'default' | 'hero'
  className?: string
}

export default function GoogleLogin({ label, variant = 'default', className = '' }: GoogleLoginProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    if (typeof window === 'undefined') return

    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        console.error('Error al iniciar sesión con Google:', error)
        setLoading(false)
        return
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }
    } catch (e) {
      console.error('Error en login con Google:', e)
    } finally {
      setLoading(false)
    }
  }

  const isHero = variant === 'hero'
  const displayLabel = loading ? 'Cargando…' : (label ?? (isHero ? 'Únete ahora con Google' : 'Google'))

  const heroStyle = isHero
    ? { backgroundColor: '#ffffff', borderColor: '#ffffff', color: '#1A6329' }
    : { backgroundColor: 'var(--rolex)', borderColor: 'var(--rolex)', color: 'white' }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className={`flex items-center justify-center gap-2 border-2 font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95 ${
        isHero
          ? 'rounded-2xl px-8 py-4 text-base md:text-lg w-full sm:w-auto min-w-[240px]'
          : 'rounded-lg px-3 py-1.5 text-sm hover:opacity-90'
      } ${className}`}
      style={heroStyle}
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="" 
        className={isHero ? 'h-6 w-6' : 'h-4 w-4'}
        aria-hidden
      />
      <span>{displayLabel}</span>
    </button>
  )
}
