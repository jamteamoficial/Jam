import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://latfctodcdslwcyjemim.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdGZjdG9kY2RzbHdjeWplbWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzMxOTYsImV4cCI6MjA4MzMwOTE5Nn0.kzTBVxhr5Y1bYN6gTUFU2eAhvw2VsYK0to-hoetOQfg'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Cliente singleton que usa cookies (SSR); usar en Client Components para que la sesión persista. */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
