import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdminEnv } from '@/lib/supabase/env'

export function createAdminClient() {
  const env = getSupabaseAdminEnv()

  if (!env) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your .env.local file.'
    )
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
