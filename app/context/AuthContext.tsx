'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

import { createClient } from '@/src/lib/supabase/client'
import { ensurePublicProfileFromAuth } from '@/src/lib/supabase/ensurePublicProfile'

const AUTH_REQUEST_TIMEOUT_MS = 8_000

export interface ProfileData {
  nombreCompleto: string
  comuna: string
  ciudad: string
  pais: string
  edad: string
  nivelMusical: string
  instrumentos: string
  canta: boolean
  descripcion: string
  rol: string
}

interface User {
  /** Id de Supabase Auth (necesario para perfil / claves) */
  id?: string
  email: string
  username: string
  nombreCompleto: string
  profile?: ProfileData
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  updateProfile: (profileData: ProfileData) => Promise<void>
}

interface RegisterData {
  nombreCompleto: string
  username: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const withTimeout = async <T,>(promise: Promise<T>, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} tardó más de 8 segundos.`))
      }, AUTH_REQUEST_TIMEOUT_MS)
    })
    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const syncFromSupabase = async (supabaseUser: SupabaseAuthUser) => {
    const supabase = createClient()

    await ensurePublicProfileFromAuth(supabaseUser).catch(() => {
      /* tabla profiles o RLS: se ignora para no bloquear la UI */
    })

    const { data: profile } = await withTimeout(
      supabase
        .from('profiles')
        .select('username, full_name, ciudad, bio, instrumentos')
        .eq('id', supabaseUser.id)
        .maybeSingle(),
      'La carga del perfil'
    )

    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || `${supabaseUser.id}@jam.local`,
      username:
        profile?.username ||
        supabaseUser.email?.split('@')[0] ||
        supabaseUser.id.slice(0, 8),
      nombreCompleto:
        profile?.full_name ||
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        'Usuario',
    }

    const instrumentosJoined = Array.isArray(profile?.instrumentos) ? profile.instrumentos.join(', ') : ''

    if (profile?.ciudad || profile?.bio || instrumentosJoined) {
      userData.profile = {
        nombreCompleto: userData.nombreCompleto,
        comuna: '',
        ciudad: profile?.ciudad || '',
        pais: '',
        edad: '',
        nivelMusical: '',
        instrumentos: instrumentosJoined,
        canta: false,
        descripcion: profile?.bio || '',
        rol: '',
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
    }

    setUser(userData)
    setIsAuthenticated(true)
  }

  // Cargar y mantener sesión: localStorage + sincronizar con Supabase (Google)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const supabase = createClient()

    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await withTimeout(
          supabase.auth.getUser(),
          'La validación de sesión'
        )
        if (supabaseUser) {
          await syncFromSupabase(supabaseUser)
          return
        }
      } catch (error) {
        console.error('[Auth] initAuth error', error)
      }

      // Sin JWT en cookies: no restaurar desde localStorage. En producción eso dejaba la UI
      // "logueada" mientras las queries iban como `anon` → feed vacío, DMs vacíos, perfil raro.
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      setUser(null)
      setIsAuthenticated(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await syncFromSupabase(session.user).catch((error) => {
            console.error('[Auth] onAuthStateChange sync error', error)
          })
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      console.error('[Auth] signIn error', error)
      return false
    }

    await syncFromSupabase(data.user)
    return true
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.nombreCompleto,
          username: userData.username,
        },
      },
    })

    if (error) {
      console.error('[Auth] signUp error', error)
      return false
    }

    // Si el proyecto requiere confirmación por email, puede no haber sesión inmediata.
    if (data.user) {
      await ensurePublicProfileFromAuth(data.user).catch(() => {})
      await syncFromSupabase(data.user)
    }

    return true
  }

  const updateProfile = async (profileData: ProfileData) => {
    if (!user?.id) return

    const supabase = createClient()
    const instrumentos = profileData.instrumentos
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const displayUsername = user.username ?? ''

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.nombreCompleto || null,
        username: displayUsername,
        ciudad: profileData.ciudad || null,
        bio: profileData.descripcion || null,
        instrumentos,
      })
      .eq('id', user.id)

    if (error) {
      console.error('[Auth] updateProfile error', error)
      return
    }

    const updatedUser: User = {
      ...user,
      nombreCompleto: profileData.nombreCompleto,
      profile: profileData,
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    }
    setUser(null)
    setIsAuthenticated(false)
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'global' })
    } catch {
      // Ignorar si no hay sesión Supabase
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

