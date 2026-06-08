import { z } from "@hono/zod-openapi";

import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import { createAdminSupabaseClient } from "../../shared/supabase/admin";
import type { InvitationRepository } from "./invitations.ports";
import {
  AcceptInvitationInput,
  CancelInvitationInput,
  CreateInvitationInput,
  ResendInvitationInput,
} from "./invitations.types";

const RpcErrorSchema = z.object({
  message: z.string().optional(),
  details: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  code: z.string().optional(),
});

export class SupabaseInvitationRepository implements InvitationRepository {
  constructor(
    private readonly supabase: ReturnType<typeof createAdminSupabaseClient>,
  ) {}

  async validate(tokenHash: string) {
    const { data, error } = await this.supabase.rpc("validate_invitation", {
      p_token_hash: tokenHash,
    });

    if (error) {
      throw this.throwRpcError(error);
    }

    const result = data?.[0];

    return result ?? null;
  }

  async create(input: CreateInvitationInput) {
    const { data, error } = await this.supabase.rpc("create_invitation", input);

    if (error) {
      throw this.throwRpcError(error);
    }

    const result = data?.[0];

    return result ?? null;
  }

  async accept(input: AcceptInvitationInput) {
    const { data, error } = await this.supabase.rpc("accept_invitation", input);

    if (error) {
      throw this.throwRpcError(error);
    }

    const result = data?.[0];

    return result ?? null;
  }

  async cancel(input: CancelInvitationInput): Promise<void> {
    const { error } = await this.supabase.rpc("cancel_invitation", input);

    if (error) {
      throw this.throwRpcError(error);
    }
  }

  async resend(input: ResendInvitationInput) {
    const { data, error } = await this.supabase.rpc("resend_invitation", input);

    if (error) {
      throw this.throwRpcError(error);
    }

    const result = data?.[0];

    return result ?? null;
  }

  private throwRpcError(payload: unknown): never {
    const parsed = RpcErrorSchema.safeParse(payload);
    const message = parsed.success
      ? (parsed.data.message ?? "Invitation operation failed.")
      : "Invitation operation failed.";

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
    } as const;
    const match = Object.entries(knownErrors).find(([key]) =>
      message.includes(key),
    );

    if (match) {
      const [, [status, code]] = match;
      throw new AppError({ code, message, status });
    }

    throw new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: "The invitation operation could not be completed.",
      status: 500,
      details: parsed.success ? parsed.data.code : undefined,
    });
  }
}
