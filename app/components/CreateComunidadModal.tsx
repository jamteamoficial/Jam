'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/src/lib/hooks/use-toast'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/src/lib/supabase/client'
import { createCommunity, joinCommunity } from '@/src/lib/services/communities'
import {
  COMMUNITY_COLOR_OPTIONS,
  DEFAULT_COMMUNITY_COLOR_TOKEN,
} from '@/src/lib/communities/colors'

interface CreateComunidadModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMOJI_OPTIONS = ['🎤', '🎸', '🥁', '🎹', '🎺', '🎻', '🎧', '🎵', '🎶', '🎼', '🎷', '🎪', '🎭', '🎨', '🚀', '⭐', '🔥', '💫', '🎯', '🌟']

export default function CreateComunidadModal({ isOpen, onClose }: CreateComunidadModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('🎵')
  const [color, setColor] = useState(DEFAULT_COMMUNITY_COLOR_TOKEN)
  const [loading, setLoading] = useState(false)

  const slugifyCommunityId = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 64)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para crear una comunidad",
        variant: "destructive"
      })
      return
    }

    if (!nombre.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para tu comunidad",
        variant: "destructive"
      })
      return
    }

    if (!descripcion.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor ingresa una descripción para tu comunidad",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const comunidadId = slugifyCommunityId(nombre)
      if (!comunidadId) {
        toast({
          title: "Nombre inválido",
          description: "Usa un nombre con letras o números.",
          variant: "destructive"
        })
        return
      }

      const supabase = createClient()
      const { error } = await createCommunity(supabase, {
        id: comunidadId,
        name: nombre.trim(),
        description: descripcion.trim(),
        icon: icono?.trim() ? icono : null,
        color: color || DEFAULT_COMMUNITY_COLOR_TOKEN,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('duplicate') || msg.includes('unique')) {
          toast({
            title: "Nombre ya existe",
            description: "Ya existe una comunidad con ese nombre. Elige otro.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error al crear comunidad",
            description: error.message,
            variant: "destructive"
          })
        }
        return
      }

      if (user.id) {
        await joinCommunity(supabase, { communityId: comunidadId, userId: user.id })
      }

      toast({
        title: "¡Comunidad creada!",
        description: `Has creado la comunidad "${nombre}" exitosamente`,
      })

      // Limpiar formulario
      setNombre('')
      setDescripcion('')
      setIcono('🎵')
      setColor(DEFAULT_COMMUNITY_COLOR_TOKEN)
      onClose()
      window.dispatchEvent(new CustomEvent('comunidadCreated'))
      router.push(`/comunidad/${comunidadId}`)
    } catch (error) {
      console.error('Error al crear comunidad:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la comunidad",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNombre('')
    setDescripcion('')
    setIcono('🎵')
    setColor(DEFAULT_COMMUNITY_COLOR_TOKEN)
    onClose()
  }

  if (!isOpen) return null

  const selectedColorGradient =
    COMMUNITY_COLOR_OPTIONS.find((c) => c.value === color)?.gradient || 'from-rolex to-rolex-light'

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-rolex/30 shadow-2xl">
          <div className="relative p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold text-rolex mb-6">
              Crear Comunidad
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la comunidad *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                  placeholder="Ej: Músicos de Jazz"
                  required
                  maxLength={50}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-rolex/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-rolex"
                  rows={4}
                  placeholder="Describe tu comunidad..."
                  required
                  maxLength={200}
                />
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-10 gap-2 p-3 border-2 border-rolex/30 rounded-xl bg-gray-50">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcono(emoji)}
                      className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                        icono === emoji
                          ? 'bg-rolex scale-110 shadow-md'
                          : 'bg-white hover:bg-rolex/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Icono seleccionado: {icono}</p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COMMUNITY_COLOR_OPTIONS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                        color === colorOption.value
                          ? `bg-gradient-to-r ${colorOption.gradient} text-white shadow-lg scale-105`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {colorOption.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedColorGradient} flex items-center justify-center text-2xl shadow-md`}>
                    {icono}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Vista previa</p>
                    <p className="text-xs text-gray-500">Así se verá tu comunidad</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !nombre.trim() || !descripcion.trim()}
                className="w-full text-white font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: 'var(--rolex)' }}
              >
                <Users className="w-4 h-4 mr-2" />
                {loading ? 'Creando...' : 'Crear Comunidad'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

