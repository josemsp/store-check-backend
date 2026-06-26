import { z } from "@hono/zod-openapi";

import { createSuccessSchema } from "../../shared/openapi/schemas";

const MemberStatusEnum = z
  .enum(["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"])
  .openapi("MemberStatus");

const OrganizationStatusEnum = z
  .enum(["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"])
  .openapi("OrganizationStatus");

const PlatformRoleEnum = z
  .enum(["ROOT", "SUPER_ADMIN", "SUPPORT"])
  .openapi("PlatformRole");

const SystemRoleEnum = z
  .enum(["OWNER", "MANAGER", "WAREHOUSE", "CASHIER", "EMPLOYEE"])
  .openapi("SystemRole");

const ProfileDataSchema = z.object({
  avatar_url: z.string(),
  email: z.string(),
  is_platform_admin: z.boolean(),
  joined_at: z.string(),
  location_ids: z.array(z.string()),
  location_names: z.array(z.string()),
  member_created_at: z.string(),
  member_id: z.string(),
  member_status: MemberStatusEnum,
  name: z.string(),
  organization_id: z.string(),
  organization_name: z.string(),
  organization_slug: z.string(),
  organization_status: OrganizationStatusEnum,
  permission_codes: z.array(z.string()),
  permission_ids: z.array(z.string()),
  phone: z.string(),
  platform_role: PlatformRoleEnum,
  role_codes: z.array(z.string()),
  role_ids: z.array(z.string()),
  role_names: z.array(z.string()),
  system_roles: z.array(SystemRoleEnum),
  user_id: z.string(),
});

export const ProfileResponseSchema = createSuccessSchema(
  "UserProfileResponse",
  ProfileDataSchema,
);

const PlatformUserDataSchema = z.object({
  // user_id: z.string().uuid(),
  // email: z.string().email(),
  // name: z.string().nullable(),
  // avatar_url: z.string().nullable(),
  // phone: z.string().nullable(),
  // created_at: z.string().datetime(),
  // is_platform_admin: z.boolean(),
  // platform_role: PlatformRoleEnum.nullable(),
  // member_status: MemberStatusEnum,
  // organization_id: z.string().uuid().nullable(),
  // organization_name: z.string().nullable(),
  avatar_url: z.string(),
  created_at: z.string(),
  email: z.string(),
  is_platform_admin: z.boolean(),
  member_statuses: MemberStatusEnum.array(),
  name: z.string(),
  organization_ids: z.string().array(),
  organization_names: z.string().array(),
  phone: z.string(),
  platform_role: PlatformRoleEnum,
  user_id: z.uuid(),
});

const SearchUsersDataSchema = z.object({
  data: z.array(PlatformUserDataSchema),
  total_count: z.number(),
});

export const SearchUsersResponseSchema = createSuccessSchema(
  "SearchUsersResponse",
  SearchUsersDataSchema,
);

export const SearchUsersQuerySchema = z.object({
  p_limit: z.coerce
    .number()
    .optional()
    .default(10)
    .openapi({
      param: { name: "p_limit", in: "query" },
      description: "Number of users per page.",
    }),
  p_offset: z.coerce
    .number()
    .optional()
    .default(0)
    .openapi({
      param: { name: "p_offset", in: "query" },
      description: "Number of users to skip.",
    }),
  p_search: z
    .string()
    .optional()
    .openapi({
      param: { name: "p_search", in: "query" },
      description: "Search term for name or email.",
    }),
  p_status: MemberStatusEnum.optional().openapi({
    param: { name: "p_status", in: "query" },
    description: "Filter by member status.",
  }),
});

const ProfileUpdateDataSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ProfileUpdateResponseSchema = createSuccessSchema(
  "ProfileUpdateResponse",
  ProfileUpdateDataSchema,
);

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const UserIdParamSchema = z.object({
  user_id: z
    .string()
    .uuid()
    .openapi({
      param: { name: "user_id", in: "path" },
      description: "User ID",
    }),
});
