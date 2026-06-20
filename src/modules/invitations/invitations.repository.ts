import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type {
  AcceptInvitationInput,
  AcceptedInvitation,
  CancelInvitationInput,
  CreateInvitationInput,
  CreateInvitationResult,
  InvitationValidateResult,
  ResendInvitationInput,
  ResendInvitationResult,
  SearchOrganizationInvitations,
  SearchOrganizationInvitationsResult,
  SearchPlatformInvitations,
  SearchPlatformInvitationsResult,
} from "./invitations.types";
import { RpcErrorSchema } from "./invitations.schemas";
import {
  RpcName,
  SupabaseAdminClient,
  SupabaseClient,
} from "../../shared/types/db";

export interface InvitationSearch {
  searchByPlatform(
    params: SearchPlatformInvitations,
  ): Promise<SearchPlatformInvitationsResult>;
  searchByOrganization(
    params: SearchOrganizationInvitations,
  ): Promise<SearchOrganizationInvitationsResult>;
}

export interface GetLinkParams {
  email: string;
  redirectTo: string;
  data: Record<string, unknown>;
}

export interface InvitationRepository extends InvitationSearch {
  validate(tokenHash: string): Promise<InvitationValidateResult | null>;
  create(input: CreateInvitationInput): Promise<CreateInvitationResult | null>;
  accept(input: AcceptInvitationInput): Promise<AcceptedInvitation | null>;
  cancel(input: CancelInvitationInput): Promise<void>;
  resend(input: ResendInvitationInput): Promise<ResendInvitationResult | null>;
  getLink(params: GetLinkParams): Promise<string>;
}

export class SupabaseInvitationRepository implements InvitationRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  async validate(tokenHash: string): Promise<InvitationValidateResult | null> {
    return this.callRpc(
      "validate_invitation",
      { p_token_hash: tokenHash },
      true,
    );
  }

  async create(
    input: CreateInvitationInput,
  ): Promise<CreateInvitationResult | null> {
    return this.callRpc("create_invitation", input, true);
  }

  async accept(
    input: AcceptInvitationInput,
  ): Promise<AcceptedInvitation | null> {
    return this.callRpc("accept_invitation", input, true);
  }

  async cancel(input: CancelInvitationInput): Promise<void> {
    await this.callRpc("cancel_invitation", input);
  }

  async resend(
    input: ResendInvitationInput,
  ): Promise<ResendInvitationResult | null> {
    return this.callRpc("resend_invitation", input, true);
  }

  async getLink(params: GetLinkParams): Promise<string> {
    const { data, error } = await this.supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: params.email,
      options: {
        redirectTo: params.redirectTo,
        data: params.data,
      },
    });

    if (error) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The invitation operation could not be completed.",
        status: 500,
        cause: error,
      });
    }

    return data.properties.action_link;
  }

  async searchByPlatform(
    params: SearchPlatformInvitations,
  ): Promise<SearchPlatformInvitationsResult> {
    return this.callRpc("search_platform_invitations", {
      p_limit: params.p_limit ?? 50,
      p_offset: params.p_offset ?? 0,
      ...(params.p_search && { p_search: params.p_search }),
      ...(params.p_scope && { p_scope: params.p_scope }),
      ...(params.p_status && { p_status: params.p_status }),
    });
  }

  async searchByOrganization(
    params: SearchOrganizationInvitations,
  ): Promise<SearchOrganizationInvitationsResult> {
    return this.callRpc("search_organization_invitations", {
      p_organization_id: params.p_organization_id,
      p_limit: params.p_limit ?? 50,
      p_offset: params.p_offset ?? 0,
      ...(params.p_search && { p_search: params.p_search }),
      ...(params.p_status && { p_status: params.p_status }),
    });
  }

  private async callRpc<T>(
    name: RpcName,
    args: Record<string, unknown>,
    single?: false,
  ): Promise<T>;
  private async callRpc<T>(
    name: RpcName,
    args: Record<string, unknown>,
    single: true,
  ): Promise<T | null>;
  private async callRpc<T>(
    name: RpcName,
    args: Record<string, unknown>,
    single?: boolean,
  ): Promise<T | null> {
    const { data, error } = await this.supabase.rpc(name, args);

    if (error) {
      throw this.throwRpcError(error);
    }

    if (single) {
      return (data as T[])?.[0] ?? null;
    }

    return data as T;
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
