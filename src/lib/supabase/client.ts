import { createBrowserClient } from '@supabase/ssr'

import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from './env'

/**
 * Cliente browser: @supabase/ssr usa `document.cookie` (PKCE + sesión), no localStorage,
 * alineado con el servidor y el callback en Route Handler.
 */
export function createClient() {
  assertSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Singleton para módulos que importan `supabase` directamente. */
export const supabase = (() => {
  assertSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
})()
