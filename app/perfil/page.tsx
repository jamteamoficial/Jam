'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

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

const NIVELES_MUSICALES = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional']
const INSTRUMENTOS_DISPONIBLES = [
  'Guitarra', 'Bajo', 'Batería', 'Piano', 'Teclado', 'Voz', 'Violín', 
  'Saxofón', 'Trompeta', 'Flauta', 'Acordeón', 'Ukelele', 'Otro'
]
const ESTILOS_MUSICALES = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Reggae', 'Hip-Hop', 'Rap', 'Electrónica',
  'Funk', 'Soul', 'R&B', 'Country', 'Folk', 'Clásica', 'Metal', 'Punk', 'Indie', 'Otro'
]

export default function PerfilPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

    setLoading(true)

    try {
      // Guardar en localStorage
      const profileKey = `profile_${user.id || user.email}`
      localStorage.setItem(profileKey, JSON.stringify(formData))

      toast({
        title: "¡Perfil guardado!",
        description: "Tu perfil ha sido actualizado correctamente",
      })

      setLoading(false)
      router.push('/')
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicia sesión</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para crear un perfil</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8 space-y-6">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Ciudad y País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Santiago"
                required
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
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="@tuusuario"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.nombreCompleto.trim() || formData.instrumentos.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


