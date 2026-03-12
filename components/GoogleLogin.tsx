'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'

export default function GoogleLogin() {
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

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center gap-2 border-2 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
      style={{ backgroundColor: 'var(--rolex)', borderColor: 'var(--rolex)', color: 'white' }}
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google logo" 
        className="w-4 h-4"
      />
      <span className="hidden sm:inline">{loading ? 'Cargando…' : 'Google'}</span>
    </button>
  )
}
