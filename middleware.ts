import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { isProfileIncomplete } from '@/src/lib/profile/onboarding'
import { supabaseAnonKey, supabaseUrl } from '@/src/lib/supabase/env'

/**
 * Refresca la sesión de Supabase en cada request para que las cookies
 * coincidan entre servidor y cliente (OAuth + RLS).
 */
export async function middleware(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[middleware] Definir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicPath =
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (!user || isPublicPath) {
    return supabaseResponse
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, ciudad, instrumentos')
    .eq('id', user.id)
    .maybeSingle()

  const needsOnboarding = isProfileIncomplete(profile)
  const onboardingPath = '/bienvenida'

  if (needsOnboarding && pathname !== onboardingPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = onboardingPath
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  if (!needsOnboarding && pathname === onboardingPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
