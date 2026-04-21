'use client'

import { useState, useEffect } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'

export type LazyVideoVariant = 'feed' | 'detail'

interface LazyVideoProps {
  src: string
  poster?: string | null
  title?: string
  className?: string
  /** `feed`: autoplay en bucle, sin barra de controles; botón silencio/sonido. `detail`: clic para reproducir con controles. */
  variant?: LazyVideoVariant
}

function FeedAutoplayVideo({
  src,
  poster,
  title,
  className,
}: {
  src: string
  poster?: string | null
  title?: string
  className: string
}) {
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    setMuted(true)
  }, [src])

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMuted((m) => !m)
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner ${className}`}>
      <video
        src={src}
        poster={poster?.trim() ? poster : undefined}
        className="h-full w-full object-cover"
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        title={title}
      >
        Tu navegador no soporta video HTML5.
      </video>
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
      >
        {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  )
}

/**
 * Video 16:9. En el feed: autoplay + loop + muted + playsInline, sin controles nativos; botón sonido.
 * En detalle: miniatura opcional hasta que el usuario pulse reproducir.
 */
export default function LazyVideo({
  src,
  poster,
  title,
  className = '',
  variant = 'detail',
}: LazyVideoProps) {
  const [playing, setPlaying] = useState(variant === 'feed')

  if (variant === 'feed') {
    return <FeedAutoplayVideo src={src} poster={poster} title={title} className={className} />
  }

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner ${className}`}
    >
      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rolex)]"
          aria-label={title ? `Reproducir: ${title}` : 'Reproducir video'}
        >
          {poster?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          ) : (
            <video
              src={src}
              className="h-full w-full object-cover opacity-90"
              muted
              playsInline
              preload="metadata"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
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
