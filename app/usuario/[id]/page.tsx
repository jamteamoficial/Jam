'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Users, Music, MapPin, Mail, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import PostActions from '@/app/components/PostActions'
import { GENERAL_POSTS, DESCUBRIR_POSTS, CONECTAR_POSTS, APRENDER_POSTS, type MockPost } from '@/app/data/mockPosts'

interface UserProfile {
  id: string
  nombre: string
  nombreArtistico: string
  avatar: string
  instrumento: string
  estilo: string
  ciudad: string
  bio: string
  seguidores: number
  seguidos: number
  nivelMusical: string
  instrumentos: string[]
  estilos: string[]
  contactoWhatsapp?: string
  contactoInstagram?: string
}

// Mock de perfiles de usuarios
const mockProfiles: { [key: string]: UserProfile } = {
  'Sebamendez17': {
    id: 'sebamendez17',
    nombre: 'Sebastián Méndez',
    nombreArtistico: 'Sebamendez17',
    avatar: '🎵',
    instrumento: 'Músico',
    estilo: 'Varios',
    ciudad: 'Santiago',
    bio: 'Músico apasionado por crear covers y compartir música. Busco colaborar con otros artistas y aprender constantemente.',
    seguidores: 234,
    seguidos: 156,
    nivelMusical: 'Intermedio',
    instrumentos: ['Guitarra', 'Voz', 'Piano'],
    estilos: ['Rock', 'Pop', 'Indie'],
    contactoWhatsapp: '+56912345678',
    contactoInstagram: '@sebamendez17'
  },
  'Carlos Rock': {
    id: 'carlos-rock',
    nombre: 'Carlos Rodríguez',
    nombreArtistico: 'Carlos Rock',
    avatar: '🎸',
    instrumento: 'Guitarrista',
    estilo: 'Rock',
    ciudad: 'Santiago',
    bio: 'Guitarrista de rock con más de 10 años de experiencia. Busco formar una banda de rock alternativo y tocar en vivo.',
    seguidores: 567,
    seguidos: 289,
    nivelMusical: 'Avanzado',
    instrumentos: ['Guitarra Eléctrica', 'Guitarra Acústica'],
    estilos: ['Rock', 'Metal', 'Alternativo'],
    contactoWhatsapp: '+56987654321',
    contactoInstagram: '@carlosrock'
  },
  'María Jazz': {
    id: 'maria-jazz',
    nombre: 'María González',
    nombreArtistico: 'María Jazz',
    avatar: '🎹',
    instrumento: 'Pianista',
    estilo: 'Jazz',
    ciudad: 'Providencia',
    bio: 'Pianista de jazz con formación clásica. Componiendo música original y abierta a colaboraciones.',
    seguidores: 412,
    seguidos: 198,
    nivelMusical: 'Profesional',
    instrumentos: ['Piano', 'Teclado'],
    estilos: ['Jazz', 'Clásica', 'Blues'],
    contactoWhatsapp: '+56911111111',
    contactoInstagram: '@mariajazz'
  },
  'Diego Beats': {
    id: 'diego-beats',
    nombre: 'Diego Martínez',
    nombreArtistico: 'Diego Beats',
    avatar: '🎧',
    instrumento: 'Productor',
    estilo: 'Electrónica',
    ciudad: 'Las Condes',
    bio: 'Productor de música electrónica especializado en house y techno. Siempre buscando nuevos sonidos.',
    seguidores: 789,
    seguidos: 345,
    nivelMusical: 'Avanzado',
    instrumentos: ['Producción', 'DJ'],
    estilos: ['Electrónica', 'House', 'Techno'],
    contactoWhatsapp: '+56922222222',
    contactoInstagram: '@diegobeats'
  },
  'Ana Funk': {
    id: 'ana-funk',
    nombre: 'Ana Silva',
    nombreArtistico: 'Ana Funk',
    avatar: '🎸',
    instrumento: 'Bajista',
    estilo: 'Funk',
    ciudad: 'Ñuñoa',
    bio: 'Bajista con 5 años de experiencia en vivo. Amante del groove y el funk. Busco banda estable.',
    seguidores: 321,
    seguidos: 167,
    nivelMusical: 'Intermedio',
    instrumentos: ['Bajo'],
    estilos: ['Funk', 'Soul', 'R&B'],
    contactoWhatsapp: '+56933333333',
    contactoInstagram: '@anafunk'
  },
  'Sofía Pop': {
    id: 'sofia-pop',
    nombre: 'Sofía López',
    nombreArtistico: 'Sofía Pop',
    avatar: '🎤',
    instrumento: 'Cantante',
    estilo: 'Pop',
    ciudad: 'Viña del Mar',
    bio: 'Cantante de pop con canciones originales. Busco productor y músicos para grabar demos.',
    seguidores: 523,
    seguidos: 234,
    nivelMusical: 'Avanzado',
    instrumentos: ['Voz'],
    estilos: ['Pop', 'Indie', 'Acústico'],
    contactoWhatsapp: '+56944444444',
    contactoInstagram: '@sofiapop'
  },
  'The Rockers': {
    id: 'the-rockers',
    nombre: 'The Rockers',
    nombreArtistico: 'The Rockers',
    avatar: '🎸',
    instrumento: 'Banda',
    estilo: 'Rock',
    ciudad: 'Santiago',
    bio: 'Banda de rock alternativo buscando guitarrista líder. Tenemos shows programados y material original.',
    seguidores: 890,
    seguidos: 120,
    nivelMusical: 'Avanzado',
    instrumentos: ['Guitarra', 'Batería', 'Bajo'],
    estilos: ['Rock', 'Alternativo'],
    contactoWhatsapp: '+56955555555',
    contactoInstagram: '@therockers'
  },
  'DJ Luna': {
    id: 'dj-luna',
    nombre: 'Luna Martínez',
    nombreArtistico: 'DJ Luna',
    avatar: '🎧',
    instrumento: 'DJ',
    estilo: 'Electrónica',
    ciudad: 'Providencia',
    bio: 'DJ especializada en House. Nuevo set disponible en mi perfil. ¡Perfecto para el fin de semana!',
    seguidores: 1234,
    seguidos: 567,
    nivelMusical: 'Profesional',
    instrumentos: ['DJ'],
    estilos: ['House', 'Electrónica', 'Techno'],
    contactoWhatsapp: '+56966666666',
    contactoInstagram: '@djluna'
  },
  'Solo Artist': {
    id: 'solo-artist',
    nombre: 'Alex Torres',
    nombreArtistico: 'Solo Artist',
    avatar: '🎤',
    instrumento: 'Cantante',
    estilo: 'Indie',
    ciudad: 'Las Condes',
    bio: 'Artista solista buscando colaborar con productores. Tengo un EP en proceso y busco sonidos frescos.',
    seguidores: 678,
    seguidos: 234,
    nivelMusical: 'Avanzado',
    instrumentos: ['Voz', 'Guitarra'],
    estilos: ['Indie', 'Pop', 'Folk'],
    contactoWhatsapp: '+56977777777',
    contactoInstagram: '@soloartist'
  },
  'Funk Squad': {
    id: 'funk-squad',
    nombre: 'Funk Squad',
    nombreArtistico: 'Funk Squad',
    avatar: '🎷',
    instrumento: 'Banda',
    estilo: 'Funk',
    ciudad: 'Ñuñoa',
    bio: 'Banda de funk establecida buscando trompetista. Tenemos shows confirmados y material nuevo.',
    seguidores: 456,
    seguidos: 89,
    nivelMusical: 'Avanzado',
    instrumentos: ['Bajo', 'Batería', 'Guitarra'],
    estilos: ['Funk', 'Soul', 'R&B'],
    contactoWhatsapp: '+56988888888',
    contactoInstagram: '@funksquad'
  },
  'Jazz Collective': {
    id: 'jazz-collective',
    nombre: 'Jazz Collective',
    nombreArtistico: 'Jazz Collective',
    avatar: '🎹',
    instrumento: 'Banda',
    estilo: 'Jazz',
    ciudad: 'Valparaíso',
    bio: 'Colectivo de jazz buscando saxofonista. Tocamos en vivo regularmente y tenemos material original.',
    seguidores: 345,
    seguidos: 67,
    nivelMusical: 'Profesional',
    instrumentos: ['Piano', 'Bajo', 'Batería'],
    estilos: ['Jazz', 'Blues', 'Swing'],
    contactoWhatsapp: '+56999999999',
    contactoInstagram: '@jazzcollective'
  },
  'Metal Warriors': {
    id: 'metal-warriors',
    nombre: 'Metal Warriors',
    nombreArtistico: 'Metal Warriors',
    avatar: '🤘',
    instrumento: 'Banda',
    estilo: 'Metal',
    ciudad: 'Concepción',
    bio: 'Banda de metal buscando vocalista gutural. Si tienes la voz, ¡únete a la guerra!',
    seguidores: 567,
    seguidos: 123,
    nivelMusical: 'Avanzado',
    instrumentos: ['Guitarra', 'Batería', 'Bajo'],
    estilos: ['Metal', 'Heavy Metal', 'Death Metal'],
    contactoWhatsapp: '+56900000000',
    contactoInstagram: '@metalwarriors'
  },
  'Roberto Blues': {
    id: 'roberto-blues',
    nombre: 'Roberto Sánchez',
    nombreArtistico: 'Roberto Blues',
    avatar: '🎸',
    instrumento: 'Guitarrista',
    estilo: 'Blues',
    ciudad: 'Santiago',
    bio: 'Guitarrista de blues con más de 15 años de experiencia. Cover de "Sweet Child O\' Mine" con mi banda.',
    seguidores: 789,
    seguidos: 234,
    nivelMusical: 'Profesional',
    instrumentos: ['Guitarra Eléctrica', 'Guitarra Acústica'],
    estilos: ['Blues', 'Rock', 'Country'],
    contactoWhatsapp: '+56911111111',
    contactoInstagram: '@robertoblues'
  },
  'Cover Band': {
    id: 'cover-band',
    nombre: 'Cover Band',
    nombreArtistico: 'Cover Band',
    avatar: '🎤',
    instrumento: 'Banda',
    estilo: 'Rock',
    ciudad: 'Providencia',
    bio: 'Banda de covers especializada en clásicos del rock. Mezcla de "Bohemian Rhapsody" en nuestro último ensayo.',
    seguidores: 1234,
    seguidos: 456,
    nivelMusical: 'Avanzado',
    instrumentos: ['Guitarra', 'Batería', 'Bajo', 'Voz'],
    estilos: ['Rock', 'Pop', 'Clásicos'],
    contactoWhatsapp: '+56922222222',
    contactoInstagram: '@coverband'
  },
  'DJ Mix Master': {
    id: 'dj-mix-master',
    nombre: 'Mix Master',
    nombreArtistico: 'DJ Mix Master',
    avatar: '🎧',
    instrumento: 'DJ',
    estilo: 'Electrónica',
    ciudad: 'Las Condes',
    bio: 'DJ especializado en techno y progressive house. Nuevo mix de 30 minutos disponible.',
    seguidores: 2345,
    seguidos: 890,
    nivelMusical: 'Profesional',
    instrumentos: ['DJ'],
    estilos: ['Techno', 'House', 'Progressive'],
    contactoWhatsapp: '+56933333333',
    contactoInstagram: '@djmixmaster'
  },
  'Jam Session': {
    id: 'jam-session',
    nombre: 'Jam Session',
    nombreArtistico: 'Jam Session',
    avatar: '🥁',
    instrumento: 'Organizador',
    estilo: 'Jazz',
    ciudad: 'Ñuñoa',
    bio: 'Organizador de jam sessions. Video de nuestra última sesión con mucha improvisación y buena onda.',
    seguidores: 567,
    seguidos: 234,
    nivelMusical: 'Intermedio',
    instrumentos: ['Varios'],
    estilos: ['Jazz', 'Blues', 'Improvisación'],
    contactoWhatsapp: '+56944444444',
    contactoInstagram: '@jamsession'
  },
  'Cover Project': {
    id: 'cover-project',
    nombre: 'Cover Project',
    nombreArtistico: 'Cover Project',
    avatar: '🎤',
    instrumento: 'Banda',
    estilo: 'Pop',
    ciudad: 'Valparaíso',
    bio: 'Banda de covers acústicos. Cover de "Shape of You". ¡Esperamos les guste nuestra versión!',
    seguidores: 890,
    seguidos: 345,
    nivelMusical: 'Intermedio',
    instrumentos: ['Guitarra', 'Voz', 'Percusión'],
    estilos: ['Pop', 'Acústico', 'Covers'],
    contactoWhatsapp: '+56955555555',
    contactoInstagram: '@coverproject'
  },
  'Producer Collab': {
    id: 'producer-collab',
    nombre: 'Producer Collab',
    nombreArtistico: 'Producer Collab',
    avatar: '🎧',
    instrumento: 'Productor',
    estilo: 'Hip-Hop',
    ciudad: 'Concepción',
    bio: 'Productor de beats para colaboraciones de hip-hop. ¿Quién se suma?',
    seguidores: 1234,
    seguidos: 567,
    nivelMusical: 'Avanzado',
    instrumentos: ['Producción'],
    estilos: ['Hip-Hop', 'Rap', 'Beats'],
    contactoWhatsapp: '+56966666666',
    contactoInstagram: '@producercollab'
  },
  'Prof. María': {
    id: 'prof-maria',
    nombre: 'María Fernández',
    nombreArtistico: 'Prof. María',
    avatar: '🎹',
    instrumento: 'Pianista',
    estilo: 'Clásica',
    ciudad: 'Santiago',
    bio: 'Profesora de piano para principiantes. Método personalizado, horarios flexibles. También doy clases de teoría musical.',
    seguidores: 456,
    seguidos: 123,
    nivelMusical: 'Profesional',
    instrumentos: ['Piano'],
    estilos: ['Clásica', 'Teoría Musical'],
    contactoWhatsapp: '+56977777777',
    contactoInstagram: '@profmaria'
  },
  'Guitar Master': {
    id: 'guitar-master',
    nombre: 'Guitar Master',
    nombreArtistico: 'Guitar Master',
    avatar: '🎸',
    instrumento: 'Guitarrista',
    estilo: 'Rock',
    ciudad: 'Providencia',
    bio: 'Clases de guitarra eléctrica y acústica. Todos los niveles. Aprende tus canciones favoritas y desarrolla tu técnica.',
    seguidores: 1234,
    seguidos: 456,
    nivelMusical: 'Profesional',
    instrumentos: ['Guitarra Eléctrica', 'Guitarra Acústica'],
    estilos: ['Rock', 'Blues', 'Acústico'],
    contactoWhatsapp: '+56988888888',
    contactoInstagram: '@guitarmaster'
  },
  'Drum School': {
    id: 'drum-school',
    nombre: 'Drum School',
    nombreArtistico: 'Drum School',
    avatar: '🥁',
    instrumento: 'Baterista',
    estilo: 'Rock',
    ciudad: 'Las Condes',
    bio: 'Clases de batería para todos los niveles. Enfoque en técnica, ritmo y groove. Estudio equipado con batería completa.',
    seguidores: 789,
    seguidos: 234,
    nivelMusical: 'Profesional',
    instrumentos: ['Batería'],
    estilos: ['Rock', 'Jazz', 'Funk'],
    contactoWhatsapp: '+56999999999',
    contactoInstagram: '@drumschool'
  },
  'Vocal Coach': {
    id: 'vocal-coach',
    nombre: 'Vocal Coach',
    nombreArtistico: 'Vocal Coach',
    avatar: '🎤',
    instrumento: 'Cantante',
    estilo: 'Pop',
    ciudad: 'Ñuñoa',
    bio: 'Clases de canto y técnica vocal. Trabajamos respiración, proyección y estilo. Preparación para audiciones y shows.',
    seguidores: 1234,
    seguidos: 567,
    nivelMusical: 'Profesional',
    instrumentos: ['Voz'],
    estilos: ['Pop', 'Rock', 'Jazz'],
    contactoWhatsapp: '+56900000000',
    contactoInstagram: '@vocalcoach'
  },
  'Music Theory': {
    id: 'music-theory',
    nombre: 'Music Theory',
    nombreArtistico: 'Music Theory',
    avatar: '📚',
    instrumento: 'Profesor',
    estilo: 'Teoría',
    ciudad: 'Valparaíso',
    bio: 'Clases de teoría musical y composición. Aprende armonía, escalas y cómo escribir tus propias canciones.',
    seguidores: 567,
    seguidos: 123,
    nivelMusical: 'Profesional',
    instrumentos: ['Teoría'],
    estilos: ['Teoría Musical', 'Composición'],
    contactoWhatsapp: '+56911111111',
    contactoInstagram: '@musictheory'
  },
  'Bass Teacher': {
    id: 'bass-teacher',
    nombre: 'Bass Teacher',
    nombreArtistico: 'Bass Teacher',
    avatar: '🎸',
    instrumento: 'Bajista',
    estilo: 'Funk',
    ciudad: 'Concepción',
    bio: 'Clases de bajo para todos los niveles. Aprende a crear líneas de bajo pegadizas y a improvisar.',
    seguidores: 890,
    seguidos: 345,
    nivelMusical: 'Profesional',
    instrumentos: ['Bajo'],
    estilos: ['Funk', 'Jazz', 'Rock'],
    contactoWhatsapp: '+56922222222',
    contactoInstagram: '@bassteacher'
  }
}

export default function UsuarioProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, followUser, unfollowUser, isFollowing } = useAuth()
  const { toast } = useToast()
  const userId = decodeURIComponent(params.id as string)
  const [userPosts, setUserPosts] = useState<MockPost[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [following, setFollowing] = useState(false)

  // Buscar perfil del usuario - buscar por nombre artístico exacto o por ID
  // Primero buscar directamente por la clave del objeto, luego por nombre artístico
  const userProfile = React.useMemo(() => {
    // Buscar directamente por clave
    if (mockProfiles[userId]) {
      return mockProfiles[userId]
    }
    
    // Buscar por nombre artístico exacto
    const found = Object.values(mockProfiles).find(
      profile => profile.nombreArtistico === userId || profile.id === userId
    )
    
    if (found) {
      return found
    }
    
    // Si no se encuentra, crear un perfil básico desde las publicaciones
    const allPosts = [
      ...GENERAL_POSTS,
      ...DESCUBRIR_POSTS,
      ...CONECTAR_POSTS,
      ...APRENDER_POSTS
    ]
    const userPost = allPosts.find(post => post.usuario === userId)
    
    if (userPost) {
      return {
        id: userId.toLowerCase().replace(/\s+/g, '-'),
        nombre: userId,
        nombreArtistico: userId,
        avatar: userPost.avatar,
        instrumento: userPost.instrumento,
        estilo: userPost.estilo,
        ciudad: userPost.ciudad,
        bio: `Músico de ${userPost.estilo} especializado en ${userPost.instrumento}.`,
        seguidores: Math.floor(Math.random() * 500) + 100,
        seguidos: Math.floor(Math.random() * 200) + 50,
        nivelMusical: 'Intermedio',
        instrumentos: [userPost.instrumento],
        estilos: [userPost.estilo]
      }
    }
    
    return null
  }, [userId])

  useEffect(() => {
    if (userProfile) {
      setFollowing(isFollowing(userProfile.nombreArtistico))
    }
  }, [userProfile, isFollowing])

  // Cargar publicaciones del usuario
  useEffect(() => {
    if (typeof window !== 'undefined' && userProfile) {
      // Buscar en todos los feeds
      const allPosts = [
        ...GENERAL_POSTS,
        ...DESCUBRIR_POSTS,
        ...CONECTAR_POSTS,
        ...APRENDER_POSTS
      ]

      // Filtrar publicaciones del usuario
      const posts = allPosts.filter(post => 
        post.usuario === userProfile.nombreArtistico
      )

      // También buscar en localStorage
      const userPostsFromStorage = JSON.parse(localStorage.getItem('userPosts') || '[]')
      const storagePosts = userPostsFromStorage.filter((post: MockPost) => 
        post.usuario === userProfile.nombreArtistico
      )

      setUserPosts([...storagePosts, ...posts])

      // Calcular likes totales
      const savedPostLikes = localStorage.getItem('postLikes')
      if (savedPostLikes) {
        try {
          const postLikes: { [key: string]: number } = JSON.parse(savedPostLikes)
          const allPostIds = [...posts, ...storagePosts].map(p => p.id)
          const total = allPostIds.reduce((sum, id) => sum + (postLikes[id] || 0), 0)
          setTotalLikes(total)
        } catch (error) {
          console.error('Error al calcular likes:', error)
        }
      }
    }
  }, [userProfile])

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para seguir a alguien",
        variant: "destructive"
      })
      return
    }
    if (following) {
      unfollowUser(userProfile!.nombreArtistico)
      setFollowing(false)
    } else {
      followUser(userProfile!.nombreArtistico)
      setFollowing(true)
    }
  }

  const handleProfileJam = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para enviar un JAM",
        variant: "destructive"
      })
      return
    }
    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    toast({
      title: "¡JAM enviado!",
      description: `Tu solicitud fue enviada a ${userProfile!.nombreArtistico}`,
    })
  }

  const handleJam = (postId: string, usuario: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para enviar un JAM",
        variant: "destructive"
      })
      return
    }

    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    toast({
      title: "¡JAM enviado!",
      description: `Tu solicitud fue enviada a ${usuario}`,
    })
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h2>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Perfil Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-6xl flex-shrink-0">
              {userProfile.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{userProfile.nombreArtistico}</h1>
              <p className="text-xl text-purple-600 font-semibold mb-2">{userProfile.instrumento}</p>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.ciudad}</span>
                <span className="mx-2">•</span>
                <span className="text-purple-600 font-semibold">{userProfile.nivelMusical}</span>
              </div>
              <p className="text-gray-700 mb-4">{userProfile.bio}</p>
              
              {/* Botones Seguir y JAM - solo si no es el propio perfil */}
              {user?.username !== userProfile.nombreArtistico && (
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={handleFollow}
                    variant={following ? "outline" : "default"}
                    className={following 
                      ? "border-2 border-purple-300 text-purple-600 hover:bg-purple-50" 
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                    }
                  >
                    {following ? 'Siguiendo' : 'Seguir'}
                  </Button>
                  <Button
                    onClick={handleProfileJam}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    JAM
                  </Button>
                </div>
              )}
              
              {/* Instrumentos y Estilos */}
              <div className="flex flex-wrap gap-2 mb-4">
                {userProfile.instrumentos.map((inst, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {inst}
                  </span>
                ))}
                {userProfile.estilos.map((estilo, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {estilo}
                  </span>
                ))}
              </div>

              {/* Contacto */}
              {(userProfile.contactoWhatsapp || userProfile.contactoInstagram) && (
                <div className="flex gap-3 mb-4">
                  {userProfile.contactoWhatsapp && (
                    <a
                      href={`https://wa.me/${userProfile.contactoWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                  {userProfile.contactoInstagram && (
                    <a
                      href={`https://instagram.com/${userProfile.contactoInstagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-purple-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-gray-900">{totalLikes}</span>
              </div>
              <p className="text-sm text-gray-600">Likes totales</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Music className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{userPosts.length}</span>
              </div>
              <p className="text-sm text-gray-600">Publicaciones</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{userProfile.seguidores}</span>
              </div>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
          </div>
        </div>

        {/* Publicaciones del Usuario */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-600" />
            Publicaciones
          </h2>
          
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-12 text-center">
              <Music className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Este usuario aún no ha publicado nada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl mr-3">
                      {post.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{post.usuario}</h3>
                      <p className="text-sm text-purple-600">{post.instrumento}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{post.texto}</p>
                  
                  {/* Botones de interacción */}
                  <div className="mb-4">
                    <PostActions postId={post.id} usuario={post.usuario} />
                  </div>

                  <Button
                    onClick={() => handleJam(post.id, post.usuario)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    JAM
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

