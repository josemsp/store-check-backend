import { createClient } from '@supabase/supabase-js'

import type { Env } from '../types/env'

export function createUserSupabaseClient(
  env: Env,
  accessToken?: string,
){
  const globalOptions = accessToken
    ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    : {}

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    ...globalOptions,
  })
}
