'use client'

import { useState, useEffect } from 'react'
import { Users, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CreateComunidadModal from './CreateComunidadModal'

interface Comunidad {
  id: string
  nombre: string
  icono: string
  descripcion: string
  color: string
  miembros: string
}

const COMUNIDADES: Comunidad[] = [
  { 
    id: 'audiciones',
    nombre: 'Audiciones', 
    icono: '🎤', 
    descripcion: 'Encuentra audiciones y oportunidades para músicos', 
    color: 'purple',
    miembros: '1.2k'
  },
  { 
    id: 'clases',
    nombre: 'Aprender Música', 
    icono: '🎓', 
    descripcion: 'Clases, tutoriales y aprendizaje musical', 
    color: 'blue',
    miembros: '2.5k'
  },
  { 
    id: 'rock',
    nombre: 'Rock & Bandas', 
    icono: '🎸', 
    descripcion: 'Para bandas de rock y músicos del género', 
    color: 'red',
    miembros: '3.1k'
  },
  { 
    id: 'emergentes',
    nombre: 'Bandas Emergentes', 
    icono: '🚀', 
    descripcion: 'Bandas nuevas buscando crecer y conectar', 
    color: 'green',
    miembros: '1.8k'
  },
  { 
    id: 'productores',
    nombre: 'Productores & Beats', 
    icono: '🎧', 
    descripcion: 'Productores y creadores de beats', 
    color: 'yellow',
    miembros: '2.2k'
  },
  { 
    id: 'jams',
    nombre: 'Jams & Sesiones', 
    icono: '🥁', 
    descripcion: 'Jams en vivo y sesiones improvisadas', 
    color: 'orange',
    miembros: '1.5k'
  },
  { 
    id: 'jazz',
    nombre: 'Jazz & Blues', 
    icono: '🎹', 
    descripcion: 'Comunidad de jazz, blues y música clásica', 
    color: 'indigo',
    miembros: '890'
  },
  { 
    id: 'electronica',
    nombre: 'Música Electrónica', 
    icono: '⚡', 
    descripcion: 'DJs, productores y amantes de la electrónica', 
    color: 'pink',
    miembros: '1.9k'
  },
  { 
    id: 'folk',
    nombre: 'Folk & Acústico', 
    icono: '🎻', 
    descripcion: 'Música acústica, folk y sonidos orgánicos', 
    color: 'teal',
    miembros: '1.1k'
  },
  { 
    id: 'hiphop',
    nombre: 'Hip-Hop & Rap', 
    icono: '🎤', 
    descripcion: 'Rappers, MCs y productores de hip-hop', 
    color: 'purple',
    miembros: '2.3k'
  }
]

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    purple: 'from-rolex to-rolex-light',
    blue: 'from-rolex to-rolex-light',
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-400 to-yellow-500',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-rolex to-rolex-light',
    pink: 'from-rolex to-rolex-light',
    teal: 'from-teal-500 to-teal-600'
  }
  return colors[color] || 'from-rolex to-rolex-light'
}

export default function ComunidadPanel() {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userComunidades, setUserComunidades] = useState<Comunidad[]>([])

  // Cargar comunidades creadas por el usuario
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userComunidades')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setUserComunidades(parsed)
        } catch (error) {
          console.error('Error al cargar comunidades:', error)
        }
      }
    }
  }, [])

  // Escuchar cuando se crea una nueva comunidad
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userComunidades')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setUserComunidades(parsed)
        } catch (error) {
          console.error('Error al cargar comunidades:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // También escuchar eventos personalizados
    window.addEventListener('comunidadCreated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('comunidadCreated', handleStorageChange)
    }
  }, [])

  const handleComunidadClick = (comunidadId: string) => {
    router.push(`/comunidad/${comunidadId}`)
  }

  // Combinar comunidades por defecto con las creadas por el usuario
  const allComunidades = [...userComunidades, ...COMUNIDADES]

  return (
    <>
      <div className="h-full bg-white border-l-2 border-rolex/30 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rolex" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-rolex to-rolex-light bg-clip-text text-transparent">
                Comunidades
              </h2>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg text-white transition-all flex items-center gap-1.5 hover:opacity-90"
              style={{ backgroundColor: 'var(--rolex)' }}
            >
              <Plus className="w-4 h-4" />
              Crear
            </button>
          </div>

          <div className="space-y-3">
            {allComunidades.map((comunidad) => (
              <div
                key={comunidad.id}
                className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-rolex/30 hover:border-rolex/50 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(comunidad.color)} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                    {comunidad.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{comunidad.nombre}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{comunidad.descripcion}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{comunidad.miembros} miembros</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleComunidadClick(comunidad.id)}
                    className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    Ver Comunidad
                  </button>
                  <Link
                    href={`/comunidad/${comunidad.id}/chat`}
                    className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg text-white transition-colors text-center hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CreateComunidadModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  )
}

