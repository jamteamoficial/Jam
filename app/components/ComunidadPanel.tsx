'use client'

import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    purple: 'from-purple-600 to-purple-700',
    blue: 'from-blue-600 to-blue-700',
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-400 to-yellow-500',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-600 to-indigo-700',
    pink: 'from-pink-500 to-pink-600',
    teal: 'from-teal-500 to-teal-600'
  }
  return colors[color] || 'from-purple-600 to-blue-600'
}

export default function ComunidadPanel() {
  const router = useRouter()

  const handleComunidadClick = (comunidadId: string) => {
    router.push(`/comunidad/${comunidadId}`)
  }

  return (
    <div className="h-full bg-white border-l-2 border-purple-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Comunidad
          </h2>
        </div>

        <div className="space-y-3">
          {COMUNIDADES.map((comunidad) => (
            <div
              key={comunidad.id}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg group"
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
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Ver Comunidad
                </button>
                <Link
                  href={`/comunidad/${comunidad.id}/chat`}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
                >
                  Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

