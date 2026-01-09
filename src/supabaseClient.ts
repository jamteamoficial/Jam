import { createClient } from "@supabase/supabase-js";

// Validar que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
    'Please add it to your Vercel environment variables in Settings > Environment Variables.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Please add it to your Vercel environment variables in Settings > Environment Variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
