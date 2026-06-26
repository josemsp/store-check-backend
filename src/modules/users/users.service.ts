import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type {
  CurrentUserProfile,
  PlatformUser,
  Profile,
  ProfileUpdate,
  SearchOrganizationUsersParams,
  SearchPlatformUsersParams,
  SearchUsersResult,
} from "./users.types";
import type { UserRepository } from "./users.repository";

export interface UpdateProfileInput {
  name?: string | undefined;
  avatar_url?: string | null | undefined;
  phone?: string | null | undefined;
}

export interface UsersServiceI {
  getMyProfile(currentUser: CurrentUserProfile): CurrentUserProfile;
  listUsers(
    currentUser: CurrentUserProfile,
    params: SearchPlatformUsersParams,
  ): Promise<SearchUsersResult<PlatformUser>>;
  updateProfile(
    currentUser: CurrentUserProfile,
    input: UpdateProfileInput,
  ): Promise<Profile>;
  deleteUser(actor: CurrentUserProfile, userId: string): Promise<void>;
}

export class UsersService implements UsersServiceI {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  getMyProfile(currentUser: CurrentUserProfile): CurrentUserProfile {
    return currentUser;
  }

  async listUsers(
    currentUser: CurrentUserProfile,
    params: SearchPlatformUsersParams,
  ): Promise<SearchUsersResult<PlatformUser>> {
    const isPlatformAdmin =
      currentUser.platform_role === "ROOT" ||
      currentUser.platform_role === "SUPER_ADMIN";

    if (isPlatformAdmin) {
      return this.repository.searchPlatformUsers(params);
    }

    const orgParams: SearchOrganizationUsersParams = {
      ...params,
    };

    const result = await this.repository.searchOrganizationUsers(
      currentUser.organization_id,
      orgParams,
    );

    return result as unknown as SearchUsersResult<PlatformUser>;
  }

  async updateProfile(
    currentUser: CurrentUserProfile,
    input: UpdateProfileInput,
  ): Promise<Profile> {
    const cleanedInput = Object.fromEntries(
      Object.entries(input).filter(([_, v]) => v !== undefined),
    ) as ProfileUpdate;

    const profile = await this.repository.updateProfile(
      currentUser.user_id,
      cleanedInput,
    );

    if (!profile) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: "Profile not found.",
        status: 404,
      });
    }

    return profile;
  }

  async deleteUser(
    actor: CurrentUserProfile,
    userId: string,
  ): Promise<void> {
    if (
      actor.platform_role !== "ROOT" &&
      actor.platform_role !== "SUPER_ADMIN"
    ) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message:
          "Only platform administrators can delete users.",
        status: 403,
      });
    }

    await this.repository.deleteUser(userId);
  }
}