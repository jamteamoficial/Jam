import { createClient } from '@/src/lib/supabase/client'

function escapeIlike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export type ProfileSearchRow = {
  id: string
  email: string | null
  full_name: string | null
  username: string | null
  ciudad: string | null
  bio: string | null
  instrumentos: string[] | null
}

/**
 * Columnas existentes en public.profiles (evita error "column does not exist").
 * Si añades avatar_url o ciudad en Supabase, inclúyelas aquí.
 */
const SEARCH_SELECT =
  'id, email, full_name, username, ciudad, bio, instrumentos'

function mergeById(rows: ProfileSearchRow[]): ProfileSearchRow[] {
  const map = new Map<string, ProfileSearchRow>()
  for (const r of rows) {
    if (r?.id) map.set(r.id, r)
  }
  return Array.from(map.values()).slice(0, 15)
}

/**
 * Busca en public.profiles: email, full_name, username, bio (ILIKE).
 * instrumentos es text[]: no usamos .ilike directo sobre el array (rompe en PostgREST);
 * se puede acotar por nombre de instrumento vía RPC en el futuro.
 */
export async function searchProfiles(query: string): Promise<{
  data: ProfileSearchRow[] | null
  error: Error | null
}> {
  const q = query.trim()
  if (q.length < 2) {
    return { data: [], error: null }
  }

  const supabase = createClient()
  const pattern = `%${escapeIlike(q)}%`

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('[searchProfiles] auth.getSession error', sessionError)
  }
  if (!session) {
    console.error(
      '[searchProfiles] Sin sesión: el cliente no tiene JWT. RLS (authenticated) bloqueará el SELECT.'
    )
  } else {
    console.log('[searchProfiles] Sesión OK, uid:', session.user.id)
  }

  const textColumns = ['email', 'full_name', 'username', 'bio', 'ciudad'] as const

  async function queryIlike(column: (typeof textColumns)[number]): Promise<ProfileSearchRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(SEARCH_SELECT)
      .ilike(column, pattern)
      .limit(15)

    console.log('[searchProfiles] request', { column, pattern, hasError: !!error })

    if (error) {
      console.error('[searchProfiles] Supabase error', column, error)
      throw error
    }

    console.log('[searchProfiles] data', data)
    return (data as ProfileSearchRow[]) ?? []
  }

  try {
    const chunks = await Promise.all(textColumns.map((col) => queryIlike(col)))
    const merged = mergeById(chunks.flat()).filter((row) => {
      const hayTexto = [
        row.email ?? '',
        row.full_name ?? '',
        row.username ?? '',
        row.bio ?? '',
        row.ciudad ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase())
      const hayInstrumento = (row.instrumentos ?? []).some((inst) =>
        inst.toLowerCase().includes(q.toLowerCase())
      )
      return hayTexto || hayInstrumento
    })
    console.log('[searchProfiles] combinado', merged.length, merged)
    return { data: merged, error: null }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[searchProfiles] error', err)
    return { data: null, error: err }
  }
}
