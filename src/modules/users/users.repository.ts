import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type {
  RpcName,
  SupabaseAdminClient,
  SupabaseClient,
} from "../../shared/types/db";
import type {
  OrganizationUser,
  PlatformUser,
  Profile,
  ProfileUpdate,
  SearchOrganizationUsersParams,
  SearchPlatformUsersParams,
  SearchUsersResult,
} from "./users.types";

export interface UserRepository {
  searchPlatformUsers(
    params: SearchPlatformUsersParams,
  ): Promise<SearchUsersResult<PlatformUser>>;
  searchOrganizationUsers(
    organizationId: string,
    params: SearchOrganizationUsersParams,
  ): Promise<SearchUsersResult<OrganizationUser>>;
  updateProfile(userId: string, input: ProfileUpdate): Promise<Profile>;
  deleteUser(userId: string): Promise<void>;
}

export class SupabaseUserRepository implements UserRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  async searchPlatformUsers(
    params: SearchPlatformUsersParams,
  ): Promise<SearchUsersResult<PlatformUser>> {
    const all = await this.callRpc<PlatformUser[]>("search_platform_users");

    const filtered = this.applyFilters(all, params);
    const total_count = filtered.length;

    const p_limit = params.p_limit ?? 10;
    const p_offset = params.p_offset ?? 0;
    const data = filtered.slice(p_offset, p_offset + p_limit);

    return { data, total_count };
  }

  async searchOrganizationUsers(
    organizationId: string,
    params: SearchOrganizationUsersParams,
  ): Promise<SearchUsersResult<OrganizationUser>> {
    const all = await this.callRpc<OrganizationUser[]>(
      "search_organization_users",
      { target_organization_id: organizationId },
    );

    const filtered = this.applyFilters(all, params);
    const total_count = filtered.length;

    const p_limit = params.p_limit ?? 10;
    const p_offset = params.p_offset ?? 0;
    const data = filtered.slice(p_offset, p_offset + p_limit);

    return { data, total_count };
  }

  async updateProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The profile could not be updated.",
        status: 500,
        cause: error,
      });
    }

    return data as unknown as Profile;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The user could not be deleted.",
        status: 500,
        cause: error,
      });
    }
  }

  private applyFilters<
    T extends { email: string; name?: string | null; member_status?: string },
  >(users: T[], params: { p_search?: string; p_status?: string }): T[] {
    let result = users;

    if (params.p_search) {
      const q = params.p_search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name ?? "").toLowerCase().includes(q),
      );
    }

    if (params.p_status) {
      result = result.filter((u) => u.member_status === params.p_status);
    }

    return result;
  }

  private async callRpc<T>(
    name: RpcName,
    args?: Record<string, unknown>,
  ): Promise<T> {
    const { data, error } = await this.supabase.rpc(name, args ?? {});

    if (error) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The user operation could not be completed.",
        status: 500,
        cause: error,
      });
    }

    return (data ?? []) as unknown as T;
  }
}
