'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

interface Community {
  id: string
  name: string
  description: string
  members: number
  icon: string
  color: string
}

const communities: Community[] = [
  {
    id: '1',
    name: 'Comunidad de Rock',
    description: 'Para amantes del rock en todas sus variantes',
    members: 1250,
    icon: '🎸',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: '2',
    name: 'Profesor/Alumno',
    description: 'Conecta profesores con estudiantes de música',
    members: 890,
    icon: '🎓',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Búsqueda de Banda',
    description: 'Encuentra músicos para formar tu banda',
    members: 2100,
    icon: '🎤',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '4',
    name: 'Músicos de Jazz',
    description: 'Comunidad dedicada al jazz y la improvisación',
    members: 650,
    icon: '🎷',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: '5',
    name: 'Productores',
    description: 'Para productores y técnicos de sonido',
    members: 450,
    icon: '🎛️',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '6',
    name: 'Música Acústica',
    description: 'Comparte tu música acústica y sinfónica',
    members: 780,
    icon: '🎻',
    color: 'from-indigo-500 to-purple-500'
  }
]

// Función helper para formatear números
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function CommunityPage({ params }: { params: { id: string } }) {
  const community = communities.find(c => c.id === params.id)
  const [isJoined, setIsJoined] = useState(false)
  const [memberCount, setMemberCount] = useState(community?.members || 0)

  if (!community) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
        <Header />
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Comunidad no encontrada</h1>
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <Header />
      
      <div className="max-w-6xl mx-auto mt-8">
        {/* Botón para volver al inicio */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-md border border-purple-200"
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Header de la comunidad */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex items-start space-x-6">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center text-5xl flex-shrink-0`}>
              {community.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{community.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{community.description}</p>
              <div className="flex items-center space-x-6">
                <div>
                  <span className="font-bold text-gray-900 text-lg">{formatNumber(memberCount)}</span>
                  <span className="text-gray-600 ml-2">miembros</span>
                </div>
                <button 
                  onClick={() => {
                    setIsJoined(!isJoined)
                    if (!isJoined) {
                      setMemberCount(memberCount + 1)
                    } else {
                      setMemberCount(memberCount - 1)
                    }
                  }}
                  className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                    isJoined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isJoined ? '✓ Unido' : '+ Unirse a la comunidad'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la comunidad */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts de la comunidad */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Posts de la comunidad</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start space-x-3 mb-2">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
                      alt="Usuario" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Usuario Ejemplo</p>
                      <p className="text-sm text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    ¡Hola a todos! Compartiendo mi nueva composición en esta comunidad. Espero sus comentarios 🎵
                  </p>
                  <div className="flex space-x-4 mt-3 text-gray-500">
                    <button className="hover:text-red-500 transition-colors">❤️ 12</button>
                    <button className="hover:text-blue-500 transition-colors">💬 3</button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start space-x-3 mb-2">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop" 
                      alt="Usuario" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Otro Usuario</p>
                      <p className="text-sm text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Buscando colaboradores para un proyecto nuevo. ¿Alguien interesado?
                  </p>
                  <div className="flex space-x-4 mt-3 text-gray-500">
                    <button className="hover:text-red-500 transition-colors">❤️ 8</button>
                    <button className="hover:text-blue-500 transition-colors">💬 5</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Miembros destacados</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
                    alt="Miembro" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Miembro 1</p>
                    <p className="text-xs text-gray-500">Guitarrista</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop" 
                    alt="Miembro" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Miembro 2</p>
                    <p className="text-xs text-gray-500">Baterista</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reglas de la comunidad</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Respeta a todos los miembros</li>
                <li>• Comparte contenido relevante</li>
                <li>• No spam ni publicidad</li>
                <li>• Sé constructivo en tus comentarios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

