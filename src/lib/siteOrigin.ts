/**
 * Origen público del sitio (Vercel preview, producción o local).
 * Úsalo en el cliente para OAuth / redirects; en servidor preferir `NEXT_PUBLIC_SITE_URL` si existe.
 */
export function getBrowserSiteOrigin(): string {
  if (typeof window === 'undefined') {
    return (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  }
  return window.location.origin
}

export function getAuthCallbackUrl(): string {
  const base = getBrowserSiteOrigin()
  if (base) return `${base}/auth/callback`
  return '/auth/callback'
}
