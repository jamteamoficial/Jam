'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const mockComunidades: { [key: string]: { nombre: string; descripcion: string; icono: string; miembros: number; posts: any[] } } = {
  'rock': {
    nombre: 'Rock',
    descripcion: 'Comunidad para amantes del rock. Comparte covers, busca bandas y conecta con otros rockeros.',
    icono: '🎸',
    miembros: 1234,
    posts: [
      { id: '1', usuario: 'Carlos Rock', texto: 'Buscamos guitarrista para banda de rock alternativo', avatar: '🎸' },
      { id: '2', usuario: 'Metal Head', texto: 'Nuevo cover de Metallica, disfruten!', avatar: '🎸' }
    ]
  },
  'clases-guitarra': {
    nombre: 'Clases de Guitarra',
    descripcion: 'Aprende guitarra con profesores experimentados. Comparte técnicas y recursos.',
    icono: '🎸',
    miembros: 856,
    posts: [
      { id: '1', usuario: 'Guitar Master', texto: 'Nueva lección sobre acordes de séptima', avatar: '🎸' },
      { id: '2', usuario: 'Prof. Juan', texto: 'Clases disponibles para todos los niveles', avatar: '🎸' }
    ]
  },
  'leer-partituras': {
    nombre: 'Aprende a Leer Partituras',
    descripcion: 'Comunidad dedicada a enseñar lectura musical y teoría de partituras.',
    icono: '📚',
    miembros: 642,
    posts: [
      { id: '1', usuario: 'Music Theory', texto: 'Tutorial básico de lectura de partituras', avatar: '📚' },
      { id: '2', usuario: 'Prof. Ana', texto: 'Ejercicios prácticos para principiantes', avatar: '📚' }
    ]
  },
  'jazz': {
    nombre: 'Jazz',
    descripcion: 'Para amantes del jazz. Comparte improvisaciones, busca músicos y disfruta del swing.',
    icono: '🎹',
    miembros: 789,
    posts: [
      { id: '1', usuario: 'Jazz Collective', texto: 'Jam session de jazz este viernes', avatar: '🎹' },
      { id: '2', usuario: 'Sax Player', texto: 'Nueva improvisación de jazz moderno', avatar: '🎷' }
    ]
  },
  'house': {
    nombre: 'House',
    descripcion: 'Comunidad de música house. DJs, productores y amantes del house music.',
    icono: '🎧',
    miembros: 1123,
    posts: [
      { id: '1', usuario: 'DJ Luna', texto: 'Nueva mezcla de deep house, disfruten!', avatar: '🎧' },
      { id: '2', usuario: 'House Producer', texto: 'Buscando colaboración para track de house', avatar: '🎧' }
    ]
  },
  'pop': {
    nombre: 'Pop',
    descripcion: 'Comunidad de música pop. Artistas, covers y las últimas tendencias pop.',
    icono: '🎤',
    miembros: 945,
    posts: [
      { id: '1', usuario: 'Pop Star', texto: 'Nuevo cover de Taylor Swift', avatar: '🎤' },
      { id: '2', usuario: 'Pop Producer', texto: 'Buscando vocalista para proyecto pop', avatar: '🎤' }
    ]
  }
}

export default function ComunidadPage() {
  const params = useParams()
  const router = useRouter()
  const comunidadId = params.id as string
  const comunidad = mockComunidades[comunidadId]

  if (!comunidad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Comunidad no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-200 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl">
            {comunidad.icono}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {comunidad.nombre}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{comunidad.miembros} miembros</span>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            Unirse
          </Button>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white border-b-2 border-purple-200 p-6">
        <p className="text-gray-700">{comunidad.descripcion}</p>
      </div>

      {/* Posts de la comunidad */}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600" />
          Publicaciones
        </h2>
        <div className="space-y-4">
          {comunidad.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                  {post.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{post.usuario}</h3>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <p className="text-gray-700">{post.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

