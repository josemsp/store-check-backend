import { createMiddleware } from 'hono/factory'

import { createAdminSupabaseClient } from '../supabase/admin'
import type { AppBindings } from '../types/context'

export const supabaseContext = createMiddleware<AppBindings>(
  async (c, next) => {
    c.set('adminSupabase', createAdminSupabaseClient(c.env))
    await next()
  },
)
