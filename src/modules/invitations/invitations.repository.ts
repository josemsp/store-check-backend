import { z } from '@hono/zod-openapi'

import { AppError } from '../../shared/errors/app-error'
import { ErrorCode } from '../../shared/errors/error-codes'
import type { Env } from '../../shared/types/env'
import type { InvitationRepository } from './invitations.ports'
import {
  AcceptedInvitationSchema,
  InvitationPreviewSchema,
  InvitationSummarySchema,
} from './invitations.schemas'

const RpcErrorSchema = z.object({
  message: z.string().optional(),
  details: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  code: z.string().optional(),
})

const RpcInvitationPreviewSchema = z.object({
  email: z.email(),
  type: z.enum(['PLATFORM', 'ORGANIZATION', 'NEW_ORGANIZATION']),
  organization_name: z.string().nullable(),
  expires_at: z.iso.datetime(),
})

const RpcInvitationSummarySchema = RpcInvitationPreviewSchema.extend({
  id: z.uuid(),
  status: z.literal('PENDING'),
  created_at: z.iso.datetime(),
})

const RpcAcceptedInvitationSchema = z.object({
  user_id: z.uuid(),
  invitation_id: z.uuid(),
  organization_id: z.uuid().nullable(),
  type: z.enum(['PLATFORM', 'ORGANIZATION', 'NEW_ORGANIZATION']),
  accepted_at: z.iso.datetime(),
})

export class SupabaseInvitationRepository implements InvitationRepository {
  constructor(private readonly env: Env) {}

  async validate(tokenHash: string) {
    const result = await this.rpc(
      'validate_invitation',
      { p_token_hash: tokenHash },
      RpcInvitationPreviewSchema.nullable(),
    )

    return result
      ? InvitationPreviewSchema.parse({
          email: result.email,
          type: result.type,
          organizationName: result.organization_name,
          expiresAt: result.expires_at,
        })
      : null
  }

  async create(input: Parameters<InvitationRepository['create']>[0]) {
    const result = await this.rpc(
      'create_invitation',
      {
        p_actor_user_id: input.actorUserId,
        p_email: input.email.toLowerCase(),
        p_type: input.type,
        p_organization_id: input.organizationId ?? null,
        p_role_ids: input.roleIds,
        p_location_ids: input.locationIds,
        p_platform_role: input.platformRole ?? null,
        p_new_organization: input.newOrganization ?? null,
        p_token_hash: input.tokenHash,
        p_expires_at: input.expiresAt,
      },
      RpcInvitationSummarySchema,
    )

    return this.toSummary(result)
  }

  async accept(input: Parameters<InvitationRepository['accept']>[0]) {
    const result = await this.rpc(
      'accept_invitation',
      {
        p_token_hash: input.tokenHash,
        p_user_id: input.userId,
        p_full_name: input.fullName,
      },
      RpcAcceptedInvitationSchema,
    )

    return AcceptedInvitationSchema.parse({
      userId: result.user_id,
      invitationId: result.invitation_id,
      organizationId: result.organization_id,
      type: result.type,
      acceptedAt: result.accepted_at,
    })
  }

  async cancel(
    input: Parameters<InvitationRepository['cancel']>[0],
  ): Promise<void> {
    await this.rpc(
      'cancel_invitation',
      {
        p_actor_user_id: input.actorUserId,
        p_invitation_id: input.invitationId,
      },
      z.boolean(),
    )
  }

  async resend(input: Parameters<InvitationRepository['resend']>[0]) {
    const result = await this.rpc(
      'resend_invitation',
      {
        p_actor_user_id: input.actorUserId,
        p_invitation_id: input.invitationId,
        p_token_hash: input.tokenHash,
        p_expires_at: input.expiresAt,
      },
      RpcInvitationSummarySchema,
    )

    return this.toSummary(result)
  }

  private toSummary(result: z.infer<typeof RpcInvitationSummarySchema>) {
    return InvitationSummarySchema.parse({
      id: result.id,
      email: result.email,
      type: result.type,
      status: result.status,
      organizationName: result.organization_name,
      expiresAt: result.expires_at,
      createdAt: result.created_at,
    })
  }

  private async rpc<TSchema extends z.ZodType>(
    functionName: string,
    body: Record<string, unknown>,
    schema: TSchema,
  ): Promise<z.infer<TSchema>> {
    const response = await fetch(
      `${this.env.SUPABASE_URL}/rest/v1/rpc/${functionName}`,
      {
        method: 'POST',
        headers: {
          apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )
    const payload: unknown = await response.json()

    if (!response.ok) {
      this.throwRpcError(payload)
    }

    return schema.parse(payload)
  }

  private throwRpcError(payload: unknown): never {
    const parsed = RpcErrorSchema.safeParse(payload)
    const message = parsed.success
      ? (parsed.data.message ?? 'Invitation operation failed.')
      : 'Invitation operation failed.'

    const knownErrors = {
      INVITATION_ALREADY_ACCEPTED: [409, ErrorCode.INVITATION_ALREADY_ACCEPTED],
      INVITATION_ALREADY_PENDING: [409, ErrorCode.INVITATION_ALREADY_PENDING],
      INVITATION_CANCELLED: [409, ErrorCode.INVITATION_CANCELLED],
      INVITATION_EXPIRED: [410, ErrorCode.INVITATION_EXPIRED],
      INVITATION_NOT_FOUND: [404, ErrorCode.INVITATION_NOT_FOUND],
      INVITATION_NOT_PENDING: [409, ErrorCode.INVITATION_NOT_PENDING],
      INVITATION_EMAIL_MISMATCH: [403, ErrorCode.FORBIDDEN],
      ORGANIZATION_SLUG_UNAVAILABLE: [409, ErrorCode.INVALID_REQUEST],
      ORGANIZATION_DETAILS_REQUIRED: [422, ErrorCode.VALIDATION_ERROR],
      PLATFORM_ROLE_REQUIRED: [422, ErrorCode.VALIDATION_ERROR],
      INVALID_EXPIRATION: [422, ErrorCode.VALIDATION_ERROR],
      INVALID_LOCATION: [422, ErrorCode.VALIDATION_ERROR],
      INVALID_ROLE: [422, ErrorCode.VALIDATION_ERROR],
      ROLE_REQUIRED: [422, ErrorCode.VALIDATION_ERROR],
      FORBIDDEN: [403, ErrorCode.FORBIDDEN],
    } as const
    const match = Object.entries(knownErrors).find(([key]) =>
      message.includes(key),
    )

    if (match) {
      const [, [status, code]] = match
      throw new AppError({ code, message, status })
    }

    throw new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'The invitation operation could not be completed.',
      status: 500,
      details: parsed.success ? parsed.data.code : undefined,
    })
  }
}
