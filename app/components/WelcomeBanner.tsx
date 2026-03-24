'use client'

import { Music2 } from 'lucide-react'
import GoogleLogin from '@/components/GoogleLogin'

/**
 * Hero / landing solo para visitantes no autenticados.
 */
export default function WelcomeBanner() {
  return (
    <section
      className="relative overflow-hidden border-b-2 border-rolex/20 bg-gradient-to-br from-[#0f2918] via-[#1A6329] to-[#145023] text-white"
      aria-labelledby="welcome-heading"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-lime-300 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 py-10 md:flex md:items-center md:justify-between md:gap-10 md:py-14">
        <div className="mb-8 md:mb-0 md:max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Music2 className="h-3.5 w-3.5" />
            Solo para músicos
          </div>
          <h1
            id="welcome-heading"
            className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl"
          >
            JAM: La red donde los músicos conectan y crean
          </h1>
          <p className="mt-4 text-base text-emerald-100/95 md:text-lg">
            Comparte tus videos, encuentra banda, jam sessions y comunidades por estilo.
            Todo en un solo lugar, con la misma pasión por la música.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-4 md:max-w-sm">
          <GoogleLogin variant="hero" label="Únete ahora" />
          <a
            href="#feed-main"
            className="text-center text-sm font-medium text-emerald-200/90 underline-offset-4 hover:underline"
          >
            Ver el feed sin cuenta
          </a>
          <p className="text-center text-xs text-emerald-200/80 md:text-left">
            Inicia sesión con Google para publicar, dar JAM y chatear.
          </p>
        </div>
      </div>
    </section>
  )
}
