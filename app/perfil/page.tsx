'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { syncProfileToSupabase } from '@/src/lib/supabase/syncProfileToSupabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, X, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/client'

interface ProfileData {
  nombreCompleto: string
  ciudad: string
  pais: string
  edad: number | ''
  nivelMusical: string
  instrumentos: string[]
  estilosMusicales: string[]
  descripcion: string
  contactoWhatsapp: string
  contactoInstagram: string
}

interface QuickProfileForm {
  full_name: string
  username: string
  bio: string
  ciudad: string
  instrumentos: string
}

const NIVELES_MUSICALES = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional']
const INSTRUMENTOS_DISPONIBLES = [
  'Guitarra', 'Bajo', 'Batería', 'Piano', 'Teclado', 'Voz', 'Violín', 
  'Saxofón', 'Trompeta', 'Flauta', 'Acordeón', 'Ukelele', 'Otro'
]
const ESTILOS_MUSICALES = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Reggae', 'Hip-Hop', 'Rap', 'Electrónica',
  'Funk', 'Soul', 'R&B', 'Country', 'Folk', 'Clásica', 'Metal', 'Punk', 'Indie', 'Otro'
]

function PerfilContent() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === '1'
  const [loading, setLoading] = useState(false)
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickForm, setQuickForm] = useState<QuickProfileForm>({
    full_name: '',
    username: '',
    bio: '',
    ciudad: '',
    instrumentos: '',
  })
  const [formData, setFormData] = useState<ProfileData>({
    nombreCompleto: '',
    ciudad: '',
    pais: 'Chile',
    edad: '',
    nivelMusical: '',
    instrumentos: [],
    estilosMusicales: [],
    descripcion: '',
    contactoWhatsapp: '',
    contactoInstagram: ''
  })

  // Cargar perfil guardado
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const savedProfile = localStorage.getItem(`profile_${user.id || user.email}`)
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setFormData(parsed)
        } catch (error) {
          console.error('Error al cargar perfil:', error)
        }
      } else if (user.nombreCompleto) {
        // Prellenar con datos del usuario
        setFormData(prev => ({
          ...prev,
          nombreCompleto: user.nombreCompleto || ''
        }))
      }
    }
  }, [user])

  useEffect(() => {
    if (!user?.id || !isQuickEditOpen) return
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, bio, ciudad, instrumentos')
        .eq('id', user.id)
        .maybeSingle()
      if (cancelled || error || !data) return
      const instruments = Array.isArray(data.instrumentos) ? data.instrumentos.join(', ') : ''
      setQuickForm({
        full_name: data.full_name || user.nombreCompleto || '',
        username: data.username || user.username || '',
        bio: data.bio || '',
        ciudad: data.ciudad || '',
        instrumentos: instruments,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [isQuickEditOpen, user])

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleArrayItem = (field: 'instrumentos' | 'estilosMusicales', item: string) => {
    setFormData(prev => {
      const currentArray = prev[field]
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item]
      return {
        ...prev,
        [field]: newArray
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para crear un perfil",
        variant: "destructive"
      })
      router.push('/')
      return
    }

    if (!formData.nombreCompleto.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre completo es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (isOnboarding && !formData.ciudad.trim()) {
      toast({
        title: "Campo requerido",
        description: "Indica tu ciudad para continuar",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Guardar en localStorage
      const profileKey = `profile_${user.id || user.email}`
      localStorage.setItem(profileKey, JSON.stringify(formData))

      if (user.id) {
        const { error: syncErr } = await syncProfileToSupabase(
          user.id,
          user.email,
          formData,
          user.username
        )
        if (syncErr) {
          console.error('[perfil] Supabase:', syncErr)
          toast({
            title: 'No se pudo guardar en el servidor',
            description:
              'Ejecuta la migración 002 en Supabase (SQL) o revisa la consola. Los datos quedaron solo en este dispositivo.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      }

      toast({
        title: "¡Perfil guardado!",
        description: "Tu perfil ha sido actualizado correctamente",
      })

      setLoading(false)
      router.replace('/')
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleQuickChange = (field: keyof QuickProfileForm, value: string) => {
    setQuickForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    const normalizedUsername = quickForm.username
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 40)

    if (!quickForm.full_name.trim() || !normalizedUsername) {
      toast({
        title: 'Campos requeridos',
        description: 'Nombre y username son obligatorios.',
        variant: 'destructive',
      })
      return
    }

    const instrumentos = quickForm.instrumentos
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    setQuickLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: quickForm.full_name.trim(),
        username: normalizedUsername,
        bio: quickForm.bio.trim() || null,
        ciudad: quickForm.ciudad.trim() || null,
        instrumentos: instrumentos.length > 0 ? instrumentos : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    setQuickLoading(false)
    if (error) {
      toast({
        title: 'No se pudo actualizar el perfil',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    const profileKey = `profile_${user.id || user.email}`
    const merged = {
      ...formData,
      nombreCompleto: quickForm.full_name.trim(),
      ciudad: quickForm.ciudad.trim(),
      descripcion: quickForm.bio.trim(),
      instrumentos,
    }
    localStorage.setItem(profileKey, JSON.stringify(merged))
    setFormData(merged)

    toast({
      title: 'Perfil actualizado',
      description: 'Tus cambios se guardaron en Supabase.',
    })
    setIsQuickEditOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicia sesión</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para crear un perfil</p>
          <Link href="/">
            <Button className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const needsInstruments = !isOnboarding
  const canSave =
    formData.nombreCompleto.trim() &&
    formData.ciudad.trim() &&
    (!needsInstruments || formData.instrumentos.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {isOnboarding && (
          <div
            className="mb-6 rounded-xl border-2 border-rolex/40 bg-white p-4 shadow-md"
            role="status"
          >
            <p className="font-semibold text-gray-900">Completa tu perfil</p>
            <p className="mt-1 text-sm text-gray-600">
              Es tu primera vez en JAM. Rellena al menos tu nombre, ciudad y guarda para entrar al inicio.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {isOnboarding ? (
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 opacity-60"
              style={{ color: 'var(--rolex)' }}
              onClick={() =>
                toast({
                  title: 'Primero completa tu perfil',
                  description: 'Guarda los datos obligatorios y podrás ir al inicio.',
                })
              }
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 hover:opacity-80" style={{ color: 'var(--rolex)' }}>
                <ArrowLeft className="w-5 h-5" />
                Volver
              </Button>
            </Link>
          )}
          <h1 className="text-4xl font-bold bg-rolex bg-clip-text text-transparent">
            {isOnboarding ? 'Crea tu perfil' : 'Mi Perfil'}
          </h1>
          {!isOnboarding && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQuickEditOpen(true)}
              className="border-rolex/40 text-rolex hover:bg-rolex/10"
            >
              <User className="mr-2 h-4 w-4" />
              Editar Perfil (modal)
            </Button>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-rolex/30 p-8 space-y-6">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
              className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Ciudad y País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ciudad *{isOnboarding && ' (obligatorio)'}
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                required={isOnboarding}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="Santiago"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                País *
              </label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="Chile"
                required
              />
            </div>
          </div>

          {/* Edad y Nivel Musical */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Edad
              </label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleInputChange('edad', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="25"
                min="13"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel Musical *
              </label>
              <select
                value={formData.nivelMusical}
                onChange={(e) => handleInputChange('nivelMusical', e.target.value)}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                required
              >
                <option value="">Selecciona tu nivel</option>
                {NIVELES_MUSICALES.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instrumentos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instrumentos que tocas *
            </label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTOS_DISPONIBLES.map(instrumento => (
                <button
                  key={instrumento}
                  type="button"
                  onClick={() => toggleArrayItem('instrumentos', instrumento)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    formData.instrumentos.includes(instrumento)
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={formData.instrumentos.includes(instrumento) ? { backgroundColor: 'var(--rolex)' } : undefined}
                >
                  {instrumento}
                </button>
              ))}
            </div>
            {formData.instrumentos.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Selecciona al menos un instrumento</p>
            )}
          </div>

          {/* Estilos Musicales */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estilos Musicales
            </label>
            <div className="flex flex-wrap gap-2">
              {ESTILOS_MUSICALES.map(estilo => (
                <button
                  key={estilo}
                  type="button"
                  onClick={() => toggleArrayItem('estilosMusicales', estilo)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    formData.estilosMusicales.includes(estilo)
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={formData.estilosMusicales.includes(estilo) ? { backgroundColor: 'var(--rolex)' } : undefined}
                >
                  {estilo}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción / Bio
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
              rows={4}
              placeholder="Cuéntanos sobre ti, tu experiencia musical, qué buscas..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.descripcion.length}/500</p>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.contactoWhatsapp}
                onChange={(e) => handleInputChange('contactoWhatsapp', e.target.value)}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="+56912345678"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.contactoInstagram}
                onChange={(e) => handleInputChange('contactoInstagram', e.target.value)}
                className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="@tuusuario"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !canSave}
              className="w-full text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--rolex)' }}
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Guardando...' : isOnboarding ? 'Guardar y continuar' : 'Guardar Perfil'}
            </Button>
          </div>
        </form>
      </div>

      {isQuickEditOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsQuickEditOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border-2 border-rolex/30 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
                <button
                  type="button"
                  onClick={() => setIsQuickEditOpen(false)}
                  className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleQuickSave}>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre completo</label>
                  <input
                    value={quickForm.full_name}
                    onChange={(e) => handleQuickChange('full_name', e.target.value)}
                    className="w-full rounded-xl border-2 border-rolex/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rolex"
                    placeholder="Seba Méndez"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                  <input
                    value={quickForm.username}
                    onChange={(e) => handleQuickChange('username', e.target.value)}
                    className="w-full rounded-xl border-2 border-rolex/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rolex"
                    placeholder="sebamendez"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Bio</label>
                  <textarea
                    value={quickForm.bio}
                    onChange={(e) => handleQuickChange('bio', e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border-2 border-rolex/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rolex"
                    placeholder="Cuéntanos sobre ti"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Ciudad</label>
                    <input
                      value={quickForm.ciudad}
                      onChange={(e) => handleQuickChange('ciudad', e.target.value)}
                      className="w-full rounded-xl border-2 border-rolex/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rolex"
                      placeholder="Santiago"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Instrumentos</label>
                    <input
                      value={quickForm.instrumentos}
                      onChange={(e) => handleQuickChange('instrumentos', e.target.value)}
                      className="w-full rounded-xl border-2 border-rolex/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rolex"
                      placeholder="Guitarra, Voz, Piano"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={quickLoading}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: 'var(--rolex)' }}
                >
                  {quickLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function PerfilPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-600">
          Cargando perfil…
        </div>
      }
    >
      <PerfilContent />
    </Suspense>
  )
}

