import { createClient } from '@supabase/supabase-js'

// Leer las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Valores placeholder para evitar errores durante el build
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.placeholder'

// Usar valores reales si existen, o valores placeholder para que el build no falle
const finalUrl = supabaseUrl || PLACEHOLDER_URL
const finalKey = supabaseAnonKey || PLACEHOLDER_KEY

// Advertir si se están usando valores placeholder
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables missing. Using placeholder values. ' +
    'Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for production.'
  )
}

// Inicializar el cliente (siempre, incluso con valores placeholder)
export const supabase = createClient(finalUrl, finalKey)
