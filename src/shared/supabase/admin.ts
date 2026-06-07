import { createClient } from "@supabase/supabase-js";

import type { Env } from "../types/env";
import { Database } from "./types";

export function createAdminSupabaseClient(env: Env) {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
