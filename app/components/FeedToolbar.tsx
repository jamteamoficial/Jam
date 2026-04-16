'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, User } from 'lucide-react'

import { searchProfiles, type ProfileSearchRow } from '@/src/lib/supabase/searchUsers'

export const INSTRUMENT_FILTERS = [
  'Todos',
  'Guitarra',
  'Bajo',
  'Batería',
  'Voces',
  'Piano',
  'Producción',
  'DJ',
  'Banda',
] as const

export const ESTADO_FILTERS = [
  'Todos',
  'Buscando banda',
  'Buscando Jam',
  'Disponible para tocar',
  'En proyecto',
] as const

interface FeedToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  instrument: string
  onInstrumentChange: (v: string) => void
  ciudad: string
  onCiudadChange: (v: string) => void
  estado: string
  onEstadoChange: (v: string) => void
  onClearFilters: () => void
  /** Si hay sesión, se pueden buscar perfiles reales en Supabase */
  isAuthenticated?: boolean
}

export default function FeedToolbar({
  searchQuery,
  onSearchChange,
  instrument,
  onInstrumentChange,
  ciudad,
  onCiudadChange,
  estado,
  onEstadoChange,
  onClearFilters,
  isAuthenticated = false,
}: FeedToolbarProps) {
  const [open, setOpen] = useState(false)
  const [peopleResults, setPeopleResults] = useState<ProfileSearchRow[]>([])
  const [peopleLoading, setPeopleLoading] = useState(false)
  const [peopleError, setPeopleError] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hasActiveFilters =
    instrument !== 'Todos' || estado !== 'Todos' || ciudad.trim() !== ''

  useEffect(() => {
    if (!isAuthenticated || !open) {
      setPeopleResults([])
      setPeopleError(null)
      return
    }
    const q = searchQuery.trim()
    if (q.length < 2) {
      setPeopleResults([])
      setPeopleError(null)
      return
    }
    const t = window.setTimeout(() => {
      setPeopleLoading(true)
      setPeopleError(null)
      void searchProfiles(q).then(({ data, error }) => {
        setPeopleLoading(false)
        if (error) {
          setPeopleError(error.message)
          setPeopleResults([])
          return
        }
        setPeopleResults(data ?? [])
      })
    }, 380)
    return () => window.clearTimeout(t)
  }, [searchQuery, isAuthenticated, open])

  return (
    <div className="border-b border-rolex/15 bg-white/90 px-3 py-3 backdrop-blur-md md:px-4">
      <div className="mx-auto flex max-w-4xl justify-end">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${
              open || hasActiveFilters
                ? 'border-[var(--rolex)] bg-rolex/10 text-[var(--rolex)]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-rolex/40'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="rounded-full bg-[var(--rolex)] px-1.5 py-0.5 text-[10px] text-white">!</span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              title="Quitar filtros"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-3 max-w-4xl rounded-xl border-2 border-rolex/20 bg-white p-4 shadow-lg">
          <div className="mb-4">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Buscar
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    searchInputRef.current?.blur()
                  }
                }}
                placeholder="Publicaciones, ciudad en posts…"
                className="w-full rounded-xl border-2 border-rolex/20 py-2.5 pl-10 pr-12 text-sm outline-none transition focus:border-rolex focus:ring-2 focus:ring-rolex/20"
                aria-label="Buscar en el feed"
              />
              <button
                type="button"
                title="Buscar"
                aria-label="Confirmar búsqueda"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white shadow-sm transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--rolex)' }}
                onClick={() => searchInputRef.current?.blur()}
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            {isAuthenticated ? (
              <div className="mt-4 border-t border-rolex/15 pt-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <User className="h-3.5 w-3.5" />
                  Personas (cuentas reales)
                </p>
                <p className="mb-2 text-xs text-gray-500">
                  Escribe al menos 2 caracteres para buscar por nombre, usuario, ciudad o instrumentos.
                </p>
                {peopleLoading && (
                  <p className="text-sm text-gray-500">Buscando personas…</p>
                )}
                {peopleError && (
                  <p className="text-sm text-amber-700" role="alert">
                    {peopleError.includes('relation') || peopleError.includes('column')
                      ? 'Configura la tabla profiles en Supabase (migración 002) o revisa tu conexión.'
                      : peopleError}
                  </p>
                )}
                {!peopleLoading && searchQuery.trim().length >= 2 && peopleResults.length === 0 && !peopleError && (
                  <p className="text-sm text-gray-500">No hay usuarios que coincidan.</p>
                )}
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {peopleResults.map((p) => {
                    const label =
                      p.full_name?.trim() ||
                      p.username?.replace(/_[a-f0-9]{10}$/i, '') ||
                      p.email?.split('@')[0] ||
                      'Usuario'
                    const instrumentos = (p.instrumentos ?? []).slice(0, 2).join(', ')
                    const sub = [p.username ? `@${p.username}` : null, p.ciudad, instrumentos]
                      .filter(Boolean)
                      .join(' · ')
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/usuario/${encodeURIComponent(p.id)}`}
                          className="flex flex-col rounded-lg border border-rolex/15 bg-rolex/5 px-3 py-2 text-left text-sm transition hover:bg-rolex/10"
                        >
                          <span className="font-semibold text-gray-900">{label}</span>
                          {sub && <span className="truncate text-xs text-gray-500">{sub}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                Inicia sesión para buscar perfiles de otros músicos.
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Instrumento
              </label>
              <select
                value={instrument}
                onChange={(e) => onInstrumentChange(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 py-2 px-2 text-sm outline-none focus:border-rolex"
              >
                {INSTRUMENT_FILTERS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Ciudad
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => onCiudadChange(e.target.value)}
                placeholder="Ej: Santiago"
                className="w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-sm outline-none focus:border-rolex"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => onEstadoChange(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 py-2 px-2 text-sm outline-none focus:border-rolex"
              >
                {ESTADO_FILTERS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
