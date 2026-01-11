import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Variable para almacenar el cliente (Singleton pattern)
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Obtiene el cliente de Supabase de forma lazy.
 * Solo se inicializa cuando se llama por primera vez.
 * Esto evita errores durante el build time de Next.js.
 */
export function getSupabaseClient(): SupabaseClient {
  // Si ya existe el cliente, retornarlo
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Obtener las variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si estamos en build time o faltan las vars, lanzar error descriptivo
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    console.warn(`Supabase vars missing: ${missingVars.join(', ')} - Client not initialized correctly`);
    throw new Error(
      `Missing environment variables: ${missingVars.join(', ')}. ` +
      'Please add them to your Vercel environment variables in Settings > Environment Variables.'
    );
  }

  // Crear el cliente solo cuando realmente se necesita
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClientInstance;
}

/**
 * Exportación para compatibilidad hacia atrás.
 * Usa getSupabaseClient() internamente para lazy initialization.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    
    // Si es una función, bindearla al cliente
    if (typeof value === 'function') {
      return value.bind(client);
    }
    
    return value;
  }
});
