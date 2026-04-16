'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { Music, User, LogIn, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleLogin from '../../components/GoogleLogin'
import NotificationsBell from '@/app/components/NotificationsBell'
import { createClient } from '@/src/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  onProfileClick?: () => void
  onLoginClick?: () => void
}

export default function Header({ onProfileClick, onLoginClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { logout: authContextLogout } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [headerQuery, setHeaderQuery] = useState('')
  const headerSearchRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setHeaderQuery(q)
  }, [searchParams])

  const applyGlobalSearch = (rawValue: string) => {
    const value = rawValue.trim()
    const params = new URLSearchParams(pathname === '/' ? searchParams.toString() : '')
    if (value) params.set('q', value)
    else params.delete('q')
    const qs = params.toString()
    const target = qs ? `/?${qs}` : '/'
    router.replace(target)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-search-changed', { detail: { q: value } }))
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      // Si no estamos en home y no hay término, evitamos navegación innecesaria.
      if (pathname !== '/' && headerQuery.trim().length === 0) return
      applyGlobalSearch(headerQuery)
    }, 380)
    return () => window.clearTimeout(t)
  }, [headerQuery, pathname, searchParams])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-rolex/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo JAM - Botón grande */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            style={{ color: 'var(--rolex)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" style={{ backgroundColor: 'var(--rolex)' }}></div>
              <div className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--rolex)' }}>
                <Music className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold group-hover:scale-105 transition-transform" style={{ color: 'var(--rolex)' }}>
              JAM
            </h1>
          </Link>

          {/* Barra de búsqueda - Centro */}
          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={headerSearchRef}
                type="search"
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                placeholder="Buscar músicos, bandas..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    applyGlobalSearch(headerQuery)
                    headerSearchRef.current?.blur()
                  }
                }}
                className="w-full rounded-full border-2 border-rolex/30 py-2 pl-10 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rolex"
                aria-label="Buscar en JAM"
              />
              <button
                type="button"
                title="Buscar"
                aria-label="Confirmar búsqueda"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-sm transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--rolex)' }}
                onClick={() => {
                  applyGlobalSearch(headerQuery)
                  headerSearchRef.current?.blur()
                }}
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
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
                      router.push('/perfil')
                    } else {
                      router.push('/login')
                    }
                  }}
                  className="flex items-center gap-2 font-semibold hover:opacity-80"
                  style={{ color: 'var(--rolex)' }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </Button>

                {isAuthenticated ? (
                  <>
                    <NotificationsBell />
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 border-2 hover:opacity-90"
                    style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                  </Button>
                  </>
                ) : (
                  <Button
                    onClick={onLoginClick}
                    className="text-white flex items-center gap-2 shadow-lg hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
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
