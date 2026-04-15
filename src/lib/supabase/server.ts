import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from './env'

/** Server Components / Server Actions: lectura/escritura de cookies vía `next/headers`. */
export async function createClient() {
  assertSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // En Server Components puede fallar; el middleware refresca la sesión.
        }
      },
    },
  })
}
