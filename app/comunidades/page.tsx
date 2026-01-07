'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COMUNIDADES = [
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

export default function ComunidadesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Comunidades
          </h1>
        </div>

        {/* Grid de Comunidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMUNIDADES.map((comunidad) => (
            <div 
              key={comunidad.id}
              className="border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl cursor-pointer group rounded-xl bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColorClasses(comunidad.color)} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {comunidad.icono}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {comunidad.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {comunidad.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      👥 {comunidad.miembros} miembros
                    </span>
                    <Button 
                      className={`bg-gradient-to-r ${getColorClasses(comunidad.color)} text-white hover:opacity-90`}
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


