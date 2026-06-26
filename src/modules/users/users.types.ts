import type { Database } from "../../shared/supabase/types";

export type CurrentUserProfile =
  Database["public"]["Functions"]["get_current_user"]["Returns"][0];

export type PlatformUser =
  Database["public"]["Functions"]["search_platform_users"]["Returns"][0];

export type OrganizationUser =
  Database["public"]["Functions"]["search_organization_users"]["Returns"][0];

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type MemberStatus = Database["public"]["Enums"]["member_status"];

export interface SearchPlatformUsersParams {
  p_search?: string;
  p_status?: MemberStatus;
  p_limit?: number;
  p_offset?: number;
}

export interface SearchOrganizationUsersParams {
  p_search?: string;
  p_status?: MemberStatus;
  p_limit?: number;
  p_offset?: number;
}

export interface SearchUsersResult<T> {
  data: T[];
  total_count: number;
}
