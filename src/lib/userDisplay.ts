export function getDisplayName(fullName?: string | null, username?: string | null): string {
  const normalizedFullName = fullName?.trim()
  if (normalizedFullName) return normalizedFullName
  const normalizedUsername = username?.trim()
  if (!normalizedUsername) return 'Usuario'
  return normalizedUsername.replace(/_[a-f0-9]{8,}$/i, '')
}

export function getHandle(username?: string | null): string {
  const normalized = username?.trim()
  if (!normalized) return '@usuario'
  return `@${normalized.replace(/^@/, '')}`
}

export function getInitials(name?: string | null): string {
  const value = name?.trim()
  if (!value) return 'U'
  const parts = value.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
  return initials || 'U'
}
