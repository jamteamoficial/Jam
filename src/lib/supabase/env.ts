/**
 * Credenciales públicas del proyecto (única fuente de verdad para cliente + servidor).
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
function trimEnv(value: string | undefined): string {
  return (value ?? '').trim()
}

/** Project URL (Settings → API → Project URL) */
export const supabaseUrl = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)

/** Clave anon / public — nunca uses SUPABASE_SERVICE_ROLE en el cliente. */
export const supabaseAnonKey = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export function assertSupabaseEnv(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Añádelas en .env.local (Project Settings → API) y reinicia el servidor de desarrollo.'
    )
  }
}
