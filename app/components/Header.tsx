'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { Music, User, LogIn, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleLogin from '../../components/GoogleLogin'
import { createClient } from '@/src/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  onProfileClick?: () => void
  onLoginClick?: () => void
}

export default function Header({ onProfileClick, onLoginClick }: HeaderProps) {
  const router = useRouter()
  const { logout: authContextLogout } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setSupabaseUser(user ?? null)
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const isAuthenticated = !!supabaseUser

  const handleLogout = async () => {
    await supabase.auth.signOut()
    authContextLogout()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-purple-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo JAM - Botón grande */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              JAM
            </h1>
          </Link>

          {/* Barra de búsqueda - Centro */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar músicos, bandas..."
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navegación derecha */}
          <div className="flex items-center gap-3">
            {/* Botón Google Login */}
            <div className="scale-75 origin-center">
              <GoogleLogin />
            </div>
            
            {/* Botón Perfil - basado en sesión real de Supabase */}
            {!loading && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push('/profile')
                    } else {
                      router.push('/login')
                    }
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </Button>

                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                  </Button>
                ) : (
                  <Button
                    onClick={onLoginClick}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 shadow-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Iniciar sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
