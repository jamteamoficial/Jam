import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://latfctodcdslwcyjemim.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdGZjdG9kY2RzbHdjeWplbWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzMxOTYsImV4cCI6MjA4MzMwOTE5Nn0.kzTBVxhr5Y1bYN6gTUFU2eAhvw2VsYK0to-hoetOQfg'

export async function createClient() {
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
