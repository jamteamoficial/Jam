'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Community {
  id: string
  name: string
  description: string
  members: number
  icon: string
  color: string
}

// Función helper para formatear números de manera consistente (sin depender de locale)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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

export default function Communities() {
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])

  const toggleJoin = (communityId: string) => {
    setJoinedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="mr-2">👥</span>
        Comunidades
      </h2>
      
      <div className="space-y-4">
        {communities.map((community) => {
          const isJoined = joinedCommunities.includes(community.id)
          
          return (
            <Link 
              key={community.id}
              href={`/communities/${community.id}`}
              className="block"
            >
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${community.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{community.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{community.description}</p>
                    <p className="text-xs text-gray-500">{formatNumber(community.members)} miembros</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleJoin(community.id)
                  }}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    isJoined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isJoined ? '✓ Unirse' : '+ Unirse'}
                </button>
              </div>
            </Link>
          )
        })}
      </div>

      <button className="w-full mt-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
        Ver todas las comunidades
      </button>
    </div>
  )
}

