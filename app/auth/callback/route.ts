import { NextResponse, type NextRequest } from 'next/server'

import { isFirstOAuthSignIn } from '@/src/lib/auth/is-first-oauth-signin'
import { createSupabaseRouteHandlerClient } from '@/src/lib/supabase/route-handler'

/**
 * OAuth PKCE: el code verifier viaja en cookies enviadas por el navegador.
 * El intercambio en servidor + Set-Cookie en la respuesta de redirect evita
 * "PKCE code verifier not found" (localStorage vs cookies / SSR).
 *
 * Usuarios nuevos (primer login OAuth) → /perfil?onboarding=1
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') ?? '/'
  const next = nextParam.startsWith('/') ? nextParam : `/${nextParam}`

  const oauthError = url.searchParams.get('error')
  const oauthDesc = url.searchParams.get('error_description')

  if (oauthError) {
    const msg = oauthDesc || oauthError
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin))
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Sesión incompleta. Vuelve a intentar con Google.')}`,
        url.origin
      )
    )
  }

  const successRedirect = new URL(next, url.origin)
  let response = NextResponse.redirect(successRedirect)

  const supabase = createSupabaseRouteHandlerClient(request, response)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    )
  }

  let redirectPath = next
  if (data.user && isFirstOAuthSignIn(data.user)) {
    redirectPath = '/perfil?onboarding=1'
  }
  response.headers.set('Location', new URL(redirectPath, url.origin).toString())

  return response
}
