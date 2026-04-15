import type { User } from '@supabase/supabase-js'

/**
 * Primer inicio con proveedor OAuth: cuenta recién creada (created_at ≈ last_sign_in_at).
 * No aplica a usuarios que ya existían y vuelven a entrar.
 */
export function isFirstOAuthSignIn(user: User | null | undefined): boolean {
  if (!user?.created_at || !user.last_sign_in_at) return false
  const created = Date.parse(user.created_at)
  const lastIn = Date.parse(user.last_sign_in_at)
  if (Number.isNaN(created) || Number.isNaN(lastIn)) return false
  // Margen por desfase de reloj / red
  return Math.abs(lastIn - created) < 120_000
}
