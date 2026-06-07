import type { User } from '@supabase/supabase-js'

import type { createAdminSupabaseClient } from '../supabase/admin'
import type { createUserSupabaseClient } from '../supabase/client'
import type { Env } from './env'

export interface AppVariables {
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>
  requestId: string
  user: User
  userSupabase: ReturnType<typeof createUserSupabaseClient>
}

export interface AppBindings {
  Bindings: Env
  Variables: AppVariables
}
