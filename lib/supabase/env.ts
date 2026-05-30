function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

export function getSupabaseUrl(): string | undefined {
  return readEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
}

export function getSupabaseAnonKey(): string | undefined {
  return readEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_KEY'
  )
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY')
}

export function getSupabaseEnv() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

export function getSupabaseAdminEnv() {
  const url = getSupabaseUrl()
  const serviceRoleKey = getSupabaseServiceRoleKey()

  if (!url || !serviceRoleKey) {
    return null
  }

  return { url, serviceRoleKey }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null || getSupabaseAdminEnv() !== null
}
