'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

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
}: FeedToolbarProps) {
  const [open, setOpen] = useState(false)
  const hasActiveFilters =
    instrument !== 'Todos' || estado !== 'Todos' || ciudad.trim() !== ''

  return (
    <div className="border-b border-rolex/15 bg-white/90 px-3 py-3 backdrop-blur-md md:px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por usuario, texto o ciudad…"
            className="w-full rounded-xl border-2 border-rolex/20 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-rolex focus:ring-2 focus:ring-rolex/20"
            aria-label="Buscar en el feed"
          />
        </div>
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
