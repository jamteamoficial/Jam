'use client'

import { useState } from 'react'
import { X, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/app/context/AuthContext'

interface CreateComunidadModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLOR_OPTIONS = [
  { value: 'purple', label: 'Morado', gradient: 'from-purple-600 to-purple-700' },
  { value: 'blue', label: 'Azul', gradient: 'from-blue-600 to-blue-700' },
  { value: 'red', label: 'Rojo', gradient: 'from-red-500 to-red-700' },
  { value: 'green', label: 'Verde', gradient: 'from-green-500 to-green-600' },
  { value: 'yellow', label: 'Amarillo', gradient: 'from-yellow-400 to-yellow-500' },
  { value: 'orange', label: 'Naranja', gradient: 'from-orange-500 to-orange-600' },
  { value: 'indigo', label: 'Índigo', gradient: 'from-indigo-600 to-indigo-700' },
  { value: 'pink', label: 'Rosa', gradient: 'from-pink-500 to-pink-600' },
  { value: 'teal', label: 'Verde azulado', gradient: 'from-teal-500 to-teal-600' }
]

const EMOJI_OPTIONS = ['🎤', '🎸', '🥁', '🎹', '🎺', '🎻', '🎧', '🎵', '🎶', '🎼', '🎷', '🎪', '🎭', '🎨', '🚀', '⭐', '🔥', '💫', '🎯', '🌟']

export default function CreateComunidadModal({ isOpen, onClose }: CreateComunidadModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('🎵')
  const [color, setColor] = useState('purple')
  const [loading, setLoading] = useState(false)

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
      // Obtener comunidades existentes de localStorage
      const existingComunidades = JSON.parse(localStorage.getItem('userComunidades') || '[]')
      
      // Crear ID único basado en el nombre (slug)
      const comunidadId = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Verificar si ya existe una comunidad con ese ID
      const idExists = existingComunidades.some((c: any) => c.id === comunidadId)
      if (idExists) {
        toast({
          title: "Nombre ya existe",
          description: "Ya existe una comunidad con ese nombre. Por favor elige otro.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      const nuevaComunidad = {
        id: comunidadId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        icono,
        color,
        miembros: '1',
        creador: user.username || user.email,
        fechaCreacion: new Date().toISOString()
      }

      existingComunidades.push(nuevaComunidad)
      localStorage.setItem('userComunidades', JSON.stringify(existingComunidades))

      toast({
        title: "¡Comunidad creada!",
        description: `Has creado la comunidad "${nombre}" exitosamente`,
      })

      // Limpiar formulario
      setNombre('')
      setDescripcion('')
      setIcono('🎵')
      setColor('purple')
      setLoading(false)
      onClose()

      // Disparar evento para actualizar el panel
      window.dispatchEvent(new CustomEvent('comunidadCreated'))
    } catch (error) {
      console.error('Error al crear comunidad:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la comunidad",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNombre('')
    setDescripcion('')
    setIcono('🎵')
    setColor('purple')
    onClose()
  }

  if (!isOpen) return null

  const selectedColorGradient = COLOR_OPTIONS.find(c => c.value === color)?.gradient || 'from-purple-600 to-purple-700'

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-purple-200 shadow-2xl">
          <div className="relative p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
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
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                <div className="grid grid-cols-10 gap-2 p-3 border-2 border-purple-200 rounded-xl bg-gray-50">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcono(emoji)}
                      className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                        icono === emoji
                          ? 'bg-purple-600 scale-110 shadow-md'
                          : 'bg-white hover:bg-purple-100'
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
                  {COLOR_OPTIONS.map((colorOption) => (
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
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
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

