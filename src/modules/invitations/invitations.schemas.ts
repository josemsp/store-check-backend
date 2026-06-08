import { z } from '@hono/zod-openapi'

import { createSuccessSchema } from '../../shared/openapi/schemas'

export const InvitationTypeSchema = z
  .enum(['PLATFORM', 'ORGANIZATION', 'NEW_ORGANIZATION'])
  .openapi('InvitationType')

export const InvitationStatusSchema = z.literal('PENDING')

export const InvitationPreviewSchema = z
  .object({
    email: z.email(),
    type: InvitationTypeSchema,
    organizationName: z.string().nullable(),
    expiresAt: z.iso.datetime(),
  })
  .openapi('InvitationPreview')

export const InvitationSummarySchema = InvitationPreviewSchema.extend({
  id: z.uuid(),
  status: InvitationStatusSchema,
  createdAt: z.iso.datetime(),
}).openapi('InvitationSummary')

const InvitationPreviewResponseSchema = z.object({
  email: z.email(),
  type: InvitationTypeSchema,
  organization_name: z.string().nullable(),
  expires_at: z.iso.datetime(),
})

const InvitationSummaryResponseSchema =
  InvitationPreviewResponseSchema.extend({
    id: z.uuid(),
    status: InvitationStatusSchema,
    created_at: z.iso.datetime(),
  })

export const ValidateInvitationQuerySchema = z.object({
  token: z.string().min(20).openapi({
    param: { name: 'token', in: 'query' },
    description: 'Raw invitation token received by email.',
  }),
})

export const CreateInvitationSchema = z
  .object({
    email: z.email(),
    type: InvitationTypeSchema,
    organizationId: z.uuid().optional(),
    roleIds: z.array(z.uuid()).default([]),
    locationIds: z.array(z.uuid()).default([]),
    platformRole: z.enum(['ROOT', 'SUPER_ADMIN', 'SUPPORT']).optional(),
    newOrganization: z
      .object({
        name: z.string().trim().min(2).max(120),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(80)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
      })
      .optional(),
    expiresInDays: z.int().min(1).max(30).default(7),
  })
  .superRefine((value, context) => {
    if (value.type === 'ORGANIZATION') {
      if (!value.organizationId) {
        context.addIssue({
          code: 'custom',
          path: ['organizationId'],
          message: 'organizationId is required for organization invitations.',
        })
      }
      if (value.roleIds.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['roleIds'],
          message: 'At least one role is required.',
        })
      }
    }

    if (value.type === 'NEW_ORGANIZATION' && !value.newOrganization) {
      context.addIssue({
        code: 'custom',
        path: ['newOrganization'],
        message: 'New organization details are required.',
      })
    }

    if (value.type === 'PLATFORM' && !value.platformRole) {
      context.addIssue({
        code: 'custom',
        path: ['platformRole'],
        message: 'A platform role is required.',
      })
    }
  })
  .openapi('CreateInvitationRequest')

export const AcceptInvitationSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8).max(72).optional(),
    fullName: z.string().trim().min(2).max(120).optional(),
  })
  .openapi({
    description:
      'password and fullName are required when no existing Bearer session is provided.',
  })
  .openapi('AcceptInvitationRequest')

export const InvitationIdParamsSchema = z.object({
  id: z.uuid().openapi({
    param: { name: 'id', in: 'path' },
  }),
})

export const ResendInvitationSchema = z
  .object({
    expiresInDays: z.int().min(1).max(30).default(7),
  })
  .openapi('ResendInvitationRequest')

export const AcceptedInvitationSchema = z
  .object({
    userId: z.uuid(),
    invitationId: z.uuid(),
    organizationId: z.uuid().nullable(),
    type: InvitationTypeSchema,
    acceptedAt: z.iso.datetime(),
  })
  .openapi('AcceptedInvitation')

const AcceptedInvitationResponseSchema = z.object({
  user_id: z.uuid(),
  invitation_id: z.uuid(),
  organization_id: z.uuid().nullable(),
  type: InvitationTypeSchema,
  accepted_at: z.iso.datetime(),
})

export const CancelledInvitationSchema = z
  .object({
    cancelled: z.literal(true),
  })
  .openapi('CancelledInvitation')

export const ValidateInvitationResponseSchema = createSuccessSchema(
  'ValidateInvitationResponse',
  InvitationPreviewResponseSchema,
)
export const CreateInvitationResponseSchema = createSuccessSchema(
  'CreateInvitationResponse',
  InvitationSummaryResponseSchema,
)
export const AcceptInvitationResponseSchema = createSuccessSchema(
  'AcceptInvitationResponse',
  AcceptedInvitationResponseSchema,
)
export const CancelInvitationResponseSchema = createSuccessSchema(
  'CancelInvitationResponse',
  CancelledInvitationSchema,
)
