/**
 * Tokens de color de comunidad (coinciden con la columna `communities.color` en Supabase).
 * `purple` = "Marca (naranja)" en la UI (gradiente rolex).
 */
export const DEFAULT_COMMUNITY_COLOR_TOKEN = 'purple'

export const COMMUNITY_COLOR_OPTIONS = [
  { value: 'purple', label: 'Marca (naranja)', gradient: 'from-rolex to-rolex-light' },
  { value: 'blue', label: 'Azul', gradient: 'from-blue-600 to-blue-700' },
  { value: 'red', label: 'Rojo', gradient: 'from-red-500 to-red-700' },
  { value: 'green', label: 'Verde', gradient: 'from-green-500 to-green-600' },
  { value: 'yellow', label: 'Amarillo', gradient: 'from-yellow-400 to-yellow-500' },
  { value: 'orange', label: 'Naranja', gradient: 'from-orange-500 to-orange-600' },
  { value: 'indigo', label: 'Índigo', gradient: 'from-rolex to-rolex-light' },
  { value: 'pink', label: 'Rosa', gradient: 'from-rolex to-rolex-light' },
  { value: 'teal', label: 'Verde azulado', gradient: 'from-teal-500 to-teal-600' },
] as const

const TOKEN_SET = new Set<string>(COMMUNITY_COLOR_OPTIONS.map((o) => o.value))

export function resolveCommunityColorToken(value: string | null | undefined): string {
  const v = value?.trim()
  if (v && TOKEN_SET.has(v)) return v
  return DEFAULT_COMMUNITY_COLOR_TOKEN
}

export function getCommunityIconGradientClass(color: string | null | undefined): string {
  const token = resolveCommunityColorToken(color)
  const opt = COMMUNITY_COLOR_OPTIONS.find((o) => o.value === token)
  return opt?.gradient ?? COMMUNITY_COLOR_OPTIONS[0].gradient
}
