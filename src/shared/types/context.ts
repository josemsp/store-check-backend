import type { User } from "@supabase/supabase-js";

import type { createAdminSupabaseClient } from "../supabase/admin";
import type { createUserSupabaseClient } from "../supabase/client";
import type { Env } from "./env";
import { Database } from "../supabase/types";

export interface AppVariables {
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>;
  requestId: string;
  user: User;
  userSupabase: ReturnType<typeof createUserSupabaseClient>;
  currentUser: Database["public"]["Functions"]["get_current_user_profile"]["Returns"][0];
}

export interface AppBindings {
  Bindings: Env;
  Variables: AppVariables;
}
