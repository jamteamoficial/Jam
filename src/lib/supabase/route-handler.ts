import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from './env'

/**
 * Cliente Supabase para Route Handlers: lee cookies del request (PKCE + sesión)
 * y escribe la sesión en la respuesta (redirect) para que el navegador las persista.
 */
export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse
) {
  assertSupabaseEnv()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}
