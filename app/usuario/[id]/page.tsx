'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Users, Music, MapPin, Mail, Instagram, Sparkles, Radio, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import PostActions from '@/app/components/PostActions'
import { GENERAL_POSTS, DESCUBRIR_POSTS, CONECTAR_POSTS, APRENDER_POSTS, type MockPost } from '@/app/data/mockPosts'
import { createClient } from '@/src/lib/supabase/client'

function isProfileUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

function mapSupabaseProfileRow(row: Record<string, unknown>): UserProfile {
  const instrumentos = Array.isArray(row.instrumentos) ? (row.instrumentos as string[]) : []
  const email = (row.email as string) || ''
  const username = (row.username as string) || email.split('@')[0] || 'usuario'
  const fullName = (row.full_name as string)?.trim()
  const displayArtistic = username.includes('_')
    ? fullName || username.replace(/_[a-f0-9]+$/i, '') || username
    : username
  const avatarRaw = (row.avatar_url as string) || '🎵'
  return {
    id: row.id as string,
    nombre: fullName || displayArtistic,
    nombreArtistico: displayArtistic,
    avatar: avatarRaw,
    instrumento: instrumentos[0] || 'Músico',
    estilo: instrumentos[1] || 'Varios',
    ciudad: (row.ciudad as string) || '—',
    bio: (row.bio as string) || 'Sin descripción aún.',
    seguidores: 0,
    seguidos: 0,
    nivelMusical: '—',
    instrumentos: instrumentos.length > 0 ? instrumentos : ['—'],
    estilos: [],
    contactoWhatsapp: undefined,
    contactoInstagram: undefined,
  }
}

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
  /** Referencias musicales / artistas favoritos */
  influencias?: string[]
  /** Ej. Disponible para tocar, Buscando banda */
  estadoDisponibilidad?: string
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
    contactoInstagram: '@sebamendez17',
    influencias: ['John Mayer', 'Silvio Rodríguez', 'Mateo'],
    estadoDisponibilidad: 'Disponible para tocar en vivo',
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
    contactoInstagram: '@carlosrock',
    influencias: ['Led Zeppelin', 'Black Sabbath', 'Soundgarden'],
    estadoDisponibilidad: 'Buscando banda de rock alternativo',
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
  const isUuid = isProfileUuid(userId)
  const [remoteProfile, setRemoteProfile] = useState<UserProfile | null | undefined>(undefined)
  const [userPosts, setUserPosts] = useState<MockPost[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    if (!isUuid) {
      setRemoteProfile(null)
      return
    }
    let cancelled = false
    setRemoteProfile(undefined)
    ;(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setRemoteProfile(null)
        return
      }
      setRemoteProfile(mapSupabaseProfileRow(data as Record<string, unknown>))
    })()
    return () => {
      cancelled = true
    }
  }, [userId, isUuid])

  // Perfil demo / legacy (no UUID): mock y posts locales
  const mockProfile = React.useMemo(() => {
    if (isUuid) return null

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
  }, [userId, isUuid])

  const userProfile = isUuid ? remoteProfile : mockProfile

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

  if (isUuid && remoteProfile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <p className="text-gray-600">Cargando perfil…</p>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h2>
          <Button
            onClick={() => router.push('/')}
            className="text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--rolex)' }}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-rolex/30 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 hover:opacity-80"
            style={{ color: 'var(--rolex)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Perfil Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-rolex/30 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-rolex text-6xl">
              {/^https?:\/\//i.test(userProfile.avatar) ? (
                <img
                  src={userProfile.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                userProfile.avatar
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{userProfile.nombreArtistico}</h1>
              <p className="text-xl text-rolex font-semibold mb-2">{userProfile.instrumento}</p>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.ciudad}</span>
                <span className="mx-2">•</span>
                <span className="text-rolex font-semibold">{userProfile.nivelMusical}</span>
              </div>
              <p className="text-gray-700 mb-4">{userProfile.bio}</p>

              {userProfile.estadoDisponibilidad && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rolex/25 bg-emerald-50/80 px-4 py-3">
                  <Radio className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rolex)]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-900/70">Estado</p>
                    <p className="font-semibold text-emerald-950">{userProfile.estadoDisponibilidad}</p>
                  </div>
                </div>
              )}

              {userProfile.influencias && userProfile.influencias.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Sparkles className="h-4 w-4 text-[var(--rolex)]" />
                    Influencias musicales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.influencias.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-rolex/30 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botones Seguir y JAM - solo si no es el propio perfil */}
              {user?.username !== userProfile.nombreArtistico && (
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={handleFollow}
                    variant={following ? "outline" : "default"}
                    className={following 
                      ? "border-2 hover:opacity-90" 
                      : "text-white font-semibold hover:opacity-90"
                    }
                    style={following 
                      ? { borderColor: 'var(--rolex)', color: 'var(--rolex)' } 
                      : { backgroundColor: 'var(--rolex)' }
                    }
                  >
                    {following ? 'Siguiendo' : 'Seguir'}
                  </Button>
                  <Button
                    onClick={handleProfileJam}
                    className="text-white font-bold hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    JAM
                  </Button>
                </div>
              )}
              
              {/* Instrumentos y Estilos */}
              <div className="flex flex-wrap gap-2 mb-4">
                {userProfile.instrumentos.map((inst, idx) => (
                  <span key={idx} className="px-3 py-1 bg-rolex/20 text-rolex rounded-full text-sm font-semibold">
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
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rolex to-rolex-light text-white rounded-xl hover:opacity-90 transition-opacity"
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
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-rolex/30">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-gray-900">{totalLikes}</span>
              </div>
              <p className="text-sm text-gray-600">Likes totales</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Music className="w-5 h-5 text-rolex" />
                <span className="text-2xl font-bold text-gray-900">{userPosts.length}</span>
              </div>
              <p className="text-sm text-gray-600">Publicaciones</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Users className="w-5 h-5 text-rolex" />
                <span className="text-2xl font-bold text-gray-900">{userProfile.seguidores}</span>
              </div>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
          </div>
        </div>

        {/* Portafolio — grid de videos / posts */}
        <div className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Music className="h-6 w-6 text-rolex" />
            Portafolio
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Videos y publicaciones de {userProfile.nombreArtistico}
          </p>

          {userPosts.length === 0 ? (
            <div className="rounded-2xl border-2 border-rolex/30 bg-white p-12 text-center shadow-lg">
              <Music className="mx-auto mb-4 h-16 w-16 text-rolex/50" />
              <p className="text-lg text-gray-600">Este usuario aún no ha publicado nada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-2xl border-2 border-rolex/20 bg-white shadow-md transition hover:border-rolex/40 hover:shadow-lg"
                >
                  <Link href={`/post/${post.id}`} className="relative block aspect-video bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                    {post.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : post.video_url ? (
                      <div className="flex h-full w-full items-center justify-center bg-black/40">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[var(--rolex)] shadow-lg">
                          <Play className="ml-1 h-7 w-7 fill-current" />
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
                        {post.texto?.slice(0, 80)}
                        {post.texto && post.texto.length > 80 ? '…' : ''}
                      </div>
                    )}
                    {post.video_url && (
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Video
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-2 text-sm text-gray-800">{post.texto}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{post.instrumento}</span>
                      {post.estado && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">{post.estado}</span>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <PostActions postId={post.id} usuario={post.usuario} />
                      <Button
                        onClick={() => handleJam(post.id, post.usuario)}
                        className="w-full font-bold text-white hover:opacity-90"
                        style={{ backgroundColor: 'var(--rolex)' }}
                      >
                        <Music className="mr-2 h-4 w-4" />
                        JAM
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

