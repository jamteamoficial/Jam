'use client'

import { supabase } from '../src/lib/supabase'

export default function GoogleLogin() {
  const handleLogin = () => {
    if (typeof window === 'undefined') return
    
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-all"
    >
      {/* Icono de Google oficial */}
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google logo" 
        className="w-4 h-4"
      />
      <span className="hidden sm:inline">Google</span>
    </button>
  )
}
