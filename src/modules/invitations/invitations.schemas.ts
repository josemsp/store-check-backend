import { z } from "@hono/zod-openapi";

import { createSuccessSchema } from "../../shared/openapi/schemas";

export const InvitationTypeEnum = z
  .enum(["PLATFORM", "ORGANIZATION", "NEW_ORGANIZATION"])
  .openapi("InvitationTypeEnum");

export const InvitationStatusEnum = z
  .enum(["PENDING", "EXPIRED", "CANCELLED", "ACCEPTED"])
  .openapi("InvitationStatusEnum");

export const PlatformRoleEnum = z
  .enum(["ROOT", "SUPER_ADMIN", "SUPPORT"])
  .openapi("PlatformRoleEnum");

export const InvitationPreviewSchema = z
  .object({
    email: z.email(),
    type: InvitationTypeEnum,
    organizationName: z.string().nullable(),
    expiresAt: z.iso.datetime(),
  })
  .openapi("InvitationPreview");

export const InvitationSummarySchema = InvitationPreviewSchema.extend({
  id: z.uuid(),
  status: InvitationStatusEnum.default("PENDING"),
  createdAt: z.iso.datetime(),
}).openapi("InvitationSummary");

const InvitationPreviewResponseSchema = z.object({
  email: z.email(),
  type: InvitationTypeEnum,
  organization_name: z.string().nullable(),
  expires_at: z.iso.datetime(),
});

const InvitationSummaryResponseSchema = InvitationPreviewResponseSchema.extend({
  id: z.uuid(),
  status: InvitationStatusEnum.default("PENDING"),
  created_at: z.iso.datetime(),
});

export const ValidateInvitationQuerySchema = z.object({
  token: z
    .string()
    .min(20)
    .openapi({
      param: { name: "token", in: "query" },
      description: "Raw invitation token received by email.",
    }),
});

export const CreateInvitationSchema = z
  .object({
    email: z.email(),
    type: InvitationTypeEnum,
    organization_id: z.uuid().optional(),
    role_ids: z.array(z.uuid()).default([]),
    location_ids: z.array(z.uuid()).default([]),
    platform_role: PlatformRoleEnum.optional(),
    new_organization_name: z.string().trim().min(2).max(120).optional(),
    new_organization_slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
      .optional(),
    expires_in_days: z.int().min(1).max(30).optional().default(7),
  })
  .superRefine((value, context) => {
    if (value.type === "ORGANIZATION") {
      if (!value.organization_id) {
        context.addIssue({
          code: "custom",
          path: ["organization_id"],
          message: "organizationId is required for organization invitations.",
        });
      }
      if (value.role_ids.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["role_ids"],
          message: "At least one role is required.",
        });
      }
    }

    if (value.type === "NEW_ORGANIZATION" && !value.new_organization_name) {
      context.addIssue({
        code: "custom",
        path: ["new_organization_name"],
        message:
          "new_organization_name is required for NEW_ORGANIZATION invitations.",
      });
    }

    if (value.type === "PLATFORM" && !value.platform_role) {
      context.addIssue({
        code: "custom",
        path: ["platform_role"],
        message: "A platform role is required.",
      });
    }
  })
  .openapi("CreateInvitationRequest");

export const AcceptInvitationSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8).max(72).optional(),
    fullName: z.string().trim().min(2).max(120).optional(),
  })
  .openapi({
    description:
      "password and fullName are required when no existing Bearer session is provided.",
  })
  .openapi("AcceptInvitationRequest");

export const InvitationIdParamsSchema = z.object({
  id: z.uuid().openapi({
    param: { name: "id", in: "path" },
  }),
});

export const ResendInvitationSchema = z
  .object({
    expires_in_days: z.int().min(1).max(30).default(7),
  })
  .openapi("ResendInvitationRequest");

export const AcceptedInvitationSchema = z
  .object({
    userId: z.uuid(),
    invitationId: z.uuid(),
    organizationId: z.uuid().nullable(),
    type: InvitationTypeEnum,
    acceptedAt: z.iso.datetime(),
  })
  .openapi("AcceptedInvitation");

const AcceptedInvitationResponseSchema = z.object({
  user_id: z.uuid(),
  invitation_id: z.uuid(),
  organization_id: z.uuid().nullable(),
  type: InvitationTypeEnum,
  accepted_at: z.iso.datetime(),
});

export const CancelledInvitationSchema = z
  .object({
    cancelled: z.literal(true),
  })
  .openapi("CancelledInvitation");

export const ValidateInvitationResponseSchema = createSuccessSchema(
  "ValidateInvitationResponse",
  InvitationPreviewResponseSchema,
);
export const CreateInvitationResponseSchema = createSuccessSchema(
  "CreateInvitationResponse",
  InvitationSummaryResponseSchema,
);
export const AcceptInvitationResponseSchema = createSuccessSchema(
  "AcceptInvitationResponse",
  AcceptedInvitationResponseSchema,
);
export const CancelInvitationResponseSchema = createSuccessSchema(
  "CancelInvitationResponse",
  CancelledInvitationSchema,
);

export const SearchInvitationsQuerySchema = z.object({
  p_limit: z.number().optional().default(10),
  p_offset: z.number().optional().default(0),
  p_scope: InvitationTypeEnum.optional(),
  p_search: z.string().optional(),
  p_status: InvitationStatusEnum.optional(),
  p_organization_id: z.uuid().optional(),
});

const SearchPlatformSchema = z.object({
  accepted_at: z.string(),
  accepted_by_email: z.string(),
  accepted_by_name: z.string(),
  accepted_by_user_id: z.string(),
  created_at: z.string(),
  email: z.string(),
  expires_at: z.string(),
  id: z.string(),
  invited_by_email: z.string(),
  invited_by_name: z.string(),
  invited_by_user_id: z.string(),
  last_sent_at: z.string(),
  location_ids: z.array(z.string()),
  location_names: z.array(z.string()),
  new_organization_name: z.string(),
  new_organization_slug: z.string(),
  organization_id: z.string(),
  organization_name: z.string(),
  organization_slug: z.string(),
  platform_role: PlatformRoleEnum,
  role_ids: z.array(z.string()),
  role_names: z.array(z.string()),
  scope: InvitationTypeEnum,
  status: InvitationStatusEnum,
  total_count: z.number(),
  updated_at: z.string(),
});

const SearchOrganizationSchema = z.object({
  accepted_at: z.string(),
  accepted_by_email: z.string(),
  accepted_by_name: z.string(),
  accepted_by_user_id: z.string(),
  created_at: z.string(),
  email: z.string(),
  expires_at: z.string(),
  id: z.string(),
  invited_by_email: z.string(),
  invited_by_name: z.string(),
  invited_by_user_id: z.string(),
  last_sent_at: z.string(),
  location_ids: z.array(z.string()),
  location_names: z.array(z.string()),
  role_ids: z.array(z.string()),
  role_names: z.array(z.string()),
  status: InvitationStatusEnum,
  total_count: z.number(),
  updated_at: z.string(),
});

// returns SearchPlatformSchema or SearchOrganizationSchema
export const SearchInvitationsResponseSchema = createSuccessSchema(
  "SearchInvitationsResponse",
  z.union([z.array(SearchPlatformSchema), z.array(SearchOrganizationSchema)]),
);

export const RpcErrorSchema = z.object({
  message: z.string().optional(),
  details: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  code: z.string().optional(),
});
