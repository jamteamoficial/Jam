'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Music, Calendar, MessageCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'

// Helper functions (se mueven antes de los datos)
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

interface ComunidadData {
  nombre: string
  descripcion: string
  descripcionCompleta: string
  icono: string
  miembros: number
  fechaCreacion: string
  posts: any[]
  color: string
}

const mockComunidades: { [key: string]: ComunidadData } = {
  'audiciones': {
    nombre: 'Audiciones',
    descripcion: 'Encuentra audiciones y oportunidades para músicos',
    descripcionCompleta: 'Comunidad dedicada a conectar músicos con oportunidades profesionales. Comparte audiciones, casting, búsquedas de músicos para proyectos, bandas que buscan miembros, y proyectos musicales que necesitan talento. Ideal para músicos de todos los niveles que buscan crecer en su carrera.',
    icono: '🎤',
    miembros: 1200,
    fechaCreacion: '2023-01-15',
    color: 'purple',
    posts: [
      { id: '1', usuario: 'Carlos Producer', texto: 'Busco vocalista para proyecto de pop rock en Santiago', avatar: '🎸', fecha: 'Hace 2 horas' },
      { id: '2', usuario: 'Rock Band', texto: 'Necesitamos baterista urgente para concierto este viernes', avatar: '🥁', fecha: 'Hace 5 horas' }
    ]
  },
  'clases': {
    nombre: 'Aprender Música',
    descripcion: 'Clases, tutoriales y aprendizaje musical',
    descripcionCompleta: 'La mejor comunidad para aprender música desde cero o perfeccionar tus habilidades. Comparte tutoriales, técnicas, recursos educativos, partituras, y conecta con profesores. Perfecta para estudiantes y educadores musicales.',
    icono: '🎓',
    miembros: 2500,
    fechaCreacion: '2022-11-20',
    color: 'blue',
    posts: [
      { id: '1', usuario: 'Guitar Master', texto: 'Nueva lección sobre acordes de séptima disponible', avatar: '🎸', fecha: 'Hace 1 hora' },
      { id: '2', usuario: 'Prof. María', texto: 'Clases disponibles para todos los niveles', avatar: '🎓', fecha: 'Hace 3 horas' }
    ]
  },
  'rock': {
    nombre: 'Rock & Bandas',
    descripcion: 'Para bandas de rock y músicos del género',
    descripcionCompleta: 'Comunidad para amantes del rock en todas sus variantes: rock clásico, alternativo, metal, punk, indie. Comparte covers, busca bandas, organiza jams, y conecta con otros rockeros apasionados. La comunidad más grande de rock en la plataforma.',
    icono: '🎸',
    miembros: 3100,
    fechaCreacion: '2022-09-10',
    color: 'red',
    posts: [
      { id: '1', usuario: 'Carlos Rock', texto: 'Buscamos guitarrista para banda de rock alternativo', avatar: '🎸', fecha: 'Hace 2 horas' },
      { id: '2', usuario: 'Metal Head', texto: 'Nuevo cover de Metallica, disfruten!', avatar: '🎸', fecha: 'Hace 4 horas' }
    ]
  },
  'emergentes': {
    nombre: 'Bandas Emergentes',
    descripcion: 'Bandas nuevas buscando crecer y conectar',
    descripcionCompleta: 'Espacio dedicado a bandas y artistas emergentes. Comparte tu música, busca consejos, colaboraciones, y conecta con otros músicos que están empezando. Ideal para bandas que buscan su primer concierto, grabación, o simplemente crecer juntos.',
    icono: '🚀',
    miembros: 1800,
    fechaCreacion: '2023-03-05',
    color: 'green',
    posts: [
      { id: '1', usuario: 'Nueva Banda', texto: 'Somos una banda nueva buscando nuestro primer concierto. ¿Consejos?', avatar: '🚀', fecha: 'Hace 1 hora' },
      { id: '2', usuario: 'Emergentes', texto: 'Compartimos nuestro primer demo! Feedback bienvenido', avatar: '🎤', fecha: 'Hace 6 horas' }
    ]
  },
  'productores': {
    nombre: 'Productores & Beats',
    descripcion: 'Productores y creadores de beats',
    descripcionCompleta: 'Comunidad exclusiva para productores, beatmakers, y creadores de música. Comparte beats, técnicas de producción, plugins, software, y colabora con otros productores. Perfecta para productores de todos los niveles.',
    icono: '🎧',
    miembros: 2200,
    fechaCreacion: '2022-12-01',
    color: 'yellow',
    posts: [
      { id: '1', usuario: 'Beat Maker', texto: 'Acabo de terminar un nuevo beat, ¿quieren escucharlo?', avatar: '🎧', fecha: 'Hace 3 horas' },
      { id: '2', usuario: 'Producer Pro', texto: 'Tutorial de producción en Ableton disponible', avatar: '🎛️', fecha: 'Hace 8 horas' }
    ]
  },
  'jams': {
    nombre: 'Jams & Sesiones',
    descripcion: 'Jams en vivo y sesiones improvisadas',
    descripcionCompleta: 'Organiza y participa en jam sessions, sesiones improvisadas, y encuentros musicales en vivo. Conecta con músicos para tocar juntos, organiza eventos, y disfruta de la música en su forma más espontánea y creativa.',
    icono: '🥁',
    miembros: 1500,
    fechaCreacion: '2023-02-14',
    color: 'orange',
    posts: [
      { id: '1', usuario: 'Jam Master', texto: 'Jam session este sábado en el centro, ¿quiénes se apuntan?', avatar: '🥁', fecha: 'Hace 5 horas' },
      { id: '2', usuario: 'Guitar Jammer', texto: 'Sesión de improvisación libre este domingo', avatar: '🎸', fecha: 'Hace 10 horas' }
    ]
  },
  'jazz': {
    nombre: 'Jazz & Blues',
    descripcion: 'Comunidad de jazz, blues y música clásica',
    descripcionCompleta: 'Para amantes del jazz, blues, y música clásica. Comparte improvisaciones, busca músicos para cuartetos, big bands, y proyectos de jazz. Ideal para saxofonistas, pianistas, contrabajistas, y todos los amantes de la música improvisada.',
    icono: '🎹',
    miembros: 890,
    fechaCreacion: '2022-10-25',
    color: 'indigo',
    posts: [
      { id: '1', usuario: 'Jazz Collective', texto: 'Jam session de jazz este viernes', avatar: '🎹', fecha: 'Hace 2 horas' },
      { id: '2', usuario: 'Sax Player', texto: 'Nueva improvisación de jazz moderno', avatar: '🎷', fecha: 'Hace 7 horas' }
    ]
  },
  'electronica': {
    nombre: 'Música Electrónica',
    descripcion: 'DJs, productores y amantes de la electrónica',
    descripcionCompleta: 'Comunidad de DJs, productores de música electrónica, y amantes del EDM, techno, house, trance, y más. Comparte mezclas, tracks originales, organiza eventos, y conecta con la escena electrónica.',
    icono: '⚡',
    miembros: 1900,
    fechaCreacion: '2023-01-30',
    color: 'pink',
    posts: [
      { id: '1', usuario: 'DJ Techno', texto: 'Nueva pista de techno subida! Déjenme saber qué opinan', avatar: '⚡', fecha: 'Hace 4 horas' },
      { id: '2', usuario: 'EDM Producer', texto: 'Buscando colaboración para track de progressive house', avatar: '🎧', fecha: 'Hace 12 horas' }
    ]
  },
  'folk': {
    nombre: 'Folk & Acústico',
    descripcion: 'Música acústica, folk y sonidos orgánicos',
    descripcionCompleta: 'Espacio para músicos acústicos, cantautores, y amantes del folk. Comparte covers acústicos, composiciones originales, y conecta con otros músicos que valoran los sonidos orgánicos y la música tradicional.',
    icono: '🎻',
    miembros: 1100,
    fechaCreacion: '2023-04-12',
    color: 'teal',
    posts: [
      { id: '1', usuario: 'Acoustic Lover', texto: 'Compartí un nuevo cover acústico de Radiohead, disfruten!', avatar: '🎻', fecha: 'Hace 3 horas' },
      { id: '2', usuario: 'Folk Artist', texto: 'Nueva canción original en el feed principal', avatar: '🎸', fecha: 'Hace 9 horas' }
    ]
  },
  'hiphop': {
    nombre: 'Hip-Hop & Rap',
    descripcion: 'Rappers, MCs y productores de hip-hop',
    descripcionCompleta: 'Comunidad de rappers, MCs, productores de hip-hop, beatmakers, y todos los amantes del rap. Comparte letras, beats, colaboraciones, y conecta con la cultura hip-hop. Perfecta para artistas urbanos.',
    icono: '🎤',
    miembros: 2300,
    fechaCreacion: '2022-08-18',
    color: 'purple',
    posts: [
      { id: '1', usuario: 'Rapper MC', texto: '¿Alguien quiere hacer un featuring? Tengo un beat listo', avatar: '🎤', fecha: 'Hace 2 horas' },
      { id: '2', usuario: 'Hip-Hop Artist', texto: 'Nueva freestyle en el canal, feedback apreciado!', avatar: '🎤', fecha: 'Hace 6 horas' }
    ]
  }
}

export default function ComunidadPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const comunidadId = params.id as string
  const comunidad = mockComunidades[comunidadId]
  
  const [isJoined, setIsJoined] = useState(false)
  const [memberCount, setMemberCount] = useState(comunidad?.miembros || 0)

  // Cargar estado de unirse desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && comunidadId) {
      const joinedCommunities = JSON.parse(localStorage.getItem('joinedCommunities') || '[]')
      setIsJoined(joinedCommunities.includes(comunidadId))
      
      // Cargar contador de miembros actualizado
      const savedMemberCount = localStorage.getItem(`comunidad_${comunidadId}_members`)
      if (savedMemberCount) {
        setMemberCount(parseInt(savedMemberCount))
      }
    }
  }, [comunidadId])

  const handleJoin = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para unirte a una comunidad",
        variant: "destructive"
      })
      return
    }

    const joinedCommunities = JSON.parse(localStorage.getItem('joinedCommunities') || '[]')
    const newIsJoined = !isJoined
    
    if (newIsJoined) {
      // Unirse
      if (!joinedCommunities.includes(comunidadId)) {
        joinedCommunities.push(comunidadId)
      }
      setMemberCount(memberCount + 1)
      localStorage.setItem(`comunidad_${comunidadId}_members`, (memberCount + 1).toString())
      toast({
        title: "¡Bienvenido!",
        description: `Te has unido a ${comunidad?.nombre}`,
      })
    } else {
      // Salir
      const updated = joinedCommunities.filter((id: string) => id !== comunidadId)
      localStorage.setItem('joinedCommunities', JSON.stringify(updated))
      setMemberCount(Math.max(0, memberCount - 1))
      localStorage.setItem(`comunidad_${comunidadId}_members`, Math.max(0, memberCount - 1).toString())
      toast({
        title: "Te has salido",
        description: `Has salido de ${comunidad?.nombre}`,
      })
    }
    
    localStorage.setItem('joinedCommunities', JSON.stringify(joinedCommunities))
    setIsJoined(newIsJoined)
  }

  const handleChatClick = () => {
    if (!isJoined) {
      toast({
        title: "Únete primero",
        description: "Debes unirte a la comunidad para acceder al chat",
        variant: "destructive"
      })
      return
    }
    router.push(`/comunidad/${comunidadId}/chat`)
  }

  if (!comunidad) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-rolex to-rolex-light flex items-center justify-center text-4xl mb-4 mx-auto">
            👥
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Comunidad no encontrada</h2>
          <p className="text-gray-600 mb-4">La comunidad que buscas no existe</p>
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
      {/* Header con navegación */}
      <div className="bg-white border-b-2 border-rolex/30 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 hover:opacity-80"
            style={{ color: 'var(--rolex)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Button>
        </div>
      </div>

      {/* Hero Section - Perfil de la Comunidad */}
      <div className="bg-white border-b-2 border-rolex/30">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar grande */}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${getColorClasses(comunidad.color)} flex items-center justify-center text-6xl shadow-xl flex-shrink-0`}>
              {comunidad.icono}
            </div>
            
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {comunidad.nombre}
              </h1>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-rolex" />
                  <span className="font-semibold text-lg">{formatNumber(memberCount)}</span>
                  <span>miembros</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-rolex" />
                  <span>Creada el {formatDate(comunidad.fechaCreacion)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  onClick={handleJoin}
                  disabled={!user}
                  className={`${
                    isJoined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300'
                      : 'text-white border-2 border-transparent hover:opacity-90'
                  } font-semibold px-6 py-3 text-lg transition-all`}
                  style={!isJoined ? { backgroundColor: 'var(--rolex)' } : undefined}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Unido
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Unirse a la Comunidad
                    </>
                  )}
                </Button>
                
                {isJoined && (
                  <Button
                    onClick={handleChatClick}
                    className="text-white font-semibold px-6 py-3 text-lg border-2 border-transparent transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat Comunitario
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción Completa */}
      <div className="bg-white border-b-2 border-rolex/30">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre esta comunidad</h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
            {comunidad.descripcionCompleta}
          </p>
        </div>
      </div>

      {/* Posts de la comunidad */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-rolex" />
          <h2 className="text-2xl font-bold text-gray-900">Publicaciones Recientes</h2>
        </div>
        
        {comunidad.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comunidad.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl p-6 border-2 border-rolex/30 hover:border-rolex/40 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rolex to-rolex-light flex items-center justify-center text-2xl flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{post.usuario}</h3>
                    <p className="text-sm text-gray-500">{post.fecha || 'Hace 2 horas'}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{post.texto}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-rolex/30">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aún no hay publicaciones en esta comunidad</p>
            <p className="text-gray-500 mt-2">¡Sé el primero en compartir algo!</p>
          </div>
        )}
      </div>
    </div>
  )
}

