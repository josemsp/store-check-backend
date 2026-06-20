import { createAdminSupabaseClient } from "../supabase/admin";
import type { createUserSupabaseClient } from "../supabase/client";

export type SupabaseClient = ReturnType<typeof createUserSupabaseClient>;
export type SupabaseAdminClient = ReturnType<typeof createAdminSupabaseClient>;

export type RpcName = Parameters<SupabaseClient["rpc"]>[0];
