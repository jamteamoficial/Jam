'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, MessageCircle, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
    miembros: '1.2k',
  },
  {
    id: 'clases',
    nombre: 'Aprender Música',
    icono: '🎓',
    descripcion: 'Clases, tutoriales y aprendizaje musical',
    color: 'blue',
    miembros: '2.5k',
  },
  {
    id: 'rock',
    nombre: 'Rock & Bandas',
    icono: '🎸',
    descripcion: 'Para bandas de rock y músicos del género',
    color: 'red',
    miembros: '3.1k',
  },
  {
    id: 'emergentes',
    nombre: 'Bandas Emergentes',
    icono: '🚀',
    descripcion: 'Bandas nuevas buscando crecer y conectar',
    color: 'green',
    miembros: '1.8k',
  },
  {
    id: 'productores',
    nombre: 'Productores & Beats',
    icono: '🎧',
    descripcion: 'Productores y creadores de beats',
    color: 'yellow',
    miembros: '2.2k',
  },
  {
    id: 'jams',
    nombre: 'Jams & Sesiones',
    icono: '🥁',
    descripcion: 'Jams en vivo y sesiones improvisadas',
    color: 'orange',
    miembros: '1.5k',
  },
  {
    id: 'jazz',
    nombre: 'Jazz & Blues',
    icono: '🎹',
    descripcion: 'Comunidad de jazz, blues y música clásica',
    color: 'indigo',
    miembros: '890',
  },
  {
    id: 'electronica',
    nombre: 'Música Electrónica',
    icono: '⚡',
    descripcion: 'DJs, productores y amantes de la electrónica',
    color: 'pink',
    miembros: '1.9k',
  },
  {
    id: 'folk',
    nombre: 'Folk & Acústico',
    icono: '🎻',
    descripcion: 'Música acústica, folk y sonidos orgánicos',
    color: 'teal',
    miembros: '1.1k',
  },
  {
    id: 'hiphop',
    nombre: 'Hip-Hop & Rap',
    icono: '🎤',
    descripcion: 'Rappers, MCs y productores de hip-hop',
    color: 'purple',
    miembros: '2.3k',
  },
]

const getIconGradient = (color: string) => {
  const map: Record<string, string> = {
    purple: 'from-violet-600 to-purple-900',
    blue: 'from-sky-600 to-blue-900',
    red: 'from-red-600 to-rose-900',
    green: 'from-emerald-600 to-green-900',
    yellow: 'from-amber-500 to-yellow-700',
    orange: 'from-orange-500 to-red-800',
    indigo: 'from-indigo-500 to-slate-900',
    pink: 'from-pink-500 to-fuchsia-900',
    teal: 'from-teal-500 to-cyan-900',
  }
  return map[color] || 'from-emerald-600 to-green-900'
}

export default function ComunidadPanel() {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userComunidades, setUserComunidades] = useState<Comunidad[]>([])
  /** Simula membresía por id de comunidad (para demo / hasta conectar con Supabase) */
  const [miembroDe, setMiembroDe] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userComunidades')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setUserComunidades(parsed)
        } catch {
          console.error('Error al cargar comunidades')
        }
      }
      const memb = localStorage.getItem('jam_comunidad_miembros_mock')
      if (memb) {
        try {
          setMiembroDe(JSON.parse(memb))
        } catch {
          /* ignore */
        }
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userComunidades')
      if (saved) {
        try {
          setUserComunidades(JSON.parse(saved))
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('comunidadCreated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('comunidadCreated', handleStorageChange)
    }
  }, [])

  const persistMembresia = (next: Record<string, boolean>) => {
    setMiembroDe(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('jam_comunidad_miembros_mock', JSON.stringify(next))
    }
  }

  const setMembresia = (id: string, value: boolean) => {
    setMiembroDe((prev) => {
      const next = { ...prev, [id]: value }
      persistMembresia(next)
      return next
    })
  }

  /** Demo: unirse con un clic; si ya eres miembro, el mismo botón abre el chat */
  const handlePrimaryAction = (comunidadId: string) => {
    const soyMiembro = miembroDe[comunidadId]
    if (soyMiembro) {
      router.push(`/comunidad/${comunidadId}/chat`)
    } else {
      setMembresia(comunidadId, true)
    }
  }

  const allComunidades = [...userComunidades, ...COMUNIDADES]

  return (
    <>
      <div className="h-full overflow-y-auto border-l border-emerald-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/40">
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white">Comunidades</h2>
                <p className="text-[10px] text-emerald-200/60">Explora por género y estilo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
              style={{ backgroundColor: 'var(--rolex)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Crear
            </button>
          </div>

          <div className="space-y-3">
            {allComunidades.map((comunidad) => {
              const soyMiembro = !!miembroDe[comunidad.id]
              return (
                <div
                  key={comunidad.id}
                  className="rounded-xl border border-emerald-800/30 bg-slate-800/50 p-4 shadow-lg ring-1 ring-slate-700/50 transition hover:border-emerald-600/40 hover:bg-slate-800/80"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl shadow-lg ${getIconGradient(comunidad.color)}`}
                    >
                      {comunidad.icono}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate font-bold text-white">{comunidad.nombre}</h3>
                      <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {comunidad.descripcion}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Users className="h-3.5 w-3.5 shrink-0 text-emerald-500/80" />
                        <span>{comunidad.miembros} miembros</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrimaryAction(comunidad.id)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                        soyMiembro
                          ? 'border-2 border-emerald-500/50 bg-slate-900/80 text-emerald-300 hover:bg-slate-800'
                          : 'text-white shadow-md shadow-emerald-900/30 hover:opacity-95'
                      }`}
                      style={soyMiembro ? undefined : { backgroundColor: 'var(--rolex)' }}
                    >
                      {soyMiembro ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Ingresar al Chat
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Unirse a la Comunidad
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/comunidad/${comunidad.id}`)}
                      className="w-full rounded-lg border border-slate-600 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700/50"
                    >
                      Ver detalle
                    </button>
                    {soyMiembro && (
                      <button
                        type="button"
                        onClick={() => setMembresia(comunidad.id, false)}
                        className="w-full text-center text-[10px] font-medium text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
                      >
                        Dejar comunidad (demo)
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <CreateComunidadModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  )
}
