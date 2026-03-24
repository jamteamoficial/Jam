'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80&auto=format&fit=crop'

interface LazyVideoProps {
  src: string
  poster?: string | null
  title?: string
  className?: string
}

/**
 * Video en contenedor 16:9 con miniatura hasta que el usuario pulse reproducir.
 */
export default function LazyVideo({ src, poster, title, className = '' }: LazyVideoProps) {
  const [playing, setPlaying] = useState(false)
  const thumb = poster || DEFAULT_POSTER

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black shadow-inner aspect-video ${className}`}
    >
      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rolex)]"
          aria-label={title ? `Reproducir: ${title}` : 'Reproducir video'}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/45">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[var(--rolex)] shadow-lg transition group-hover:scale-110">
              <Play className="ml-1 h-8 w-8 fill-current" />
            </span>
          </div>
        </button>
      ) : (
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-contain md:object-cover"
          preload="metadata"
        >
          Tu navegador no soporta video HTML5.
        </video>
      )}
    </div>
  )
}
