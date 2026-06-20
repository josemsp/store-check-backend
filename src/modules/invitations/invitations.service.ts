import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type { Env } from "../../shared/types/env";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "../../shared/utils/invitation-token";
import type { AuthUserGateway } from "./invitations.auth";
import type { InvitationMailer } from "./invitations.mailer";
import type {
  InvitationRepository,
  InvitationSearch,
} from "./invitations.repository";
import type {
  AcceptedInvitationServiceResult,
  CreateInvitationServiceInput,
  CreateInvitationServiceResult,
  SearchOrganizationInvitations,
  SearchOrganizationInvitationsResult,
  SearchPlatformInvitations,
  SearchPlatformInvitationsResult,
  ValidateInvitationServiceResult,
} from "./invitations.types";

export interface InvitationsServiceI extends InvitationSearch {
  validate(token: string): Promise<ValidateInvitationServiceResult>;
  create(
    input: CreateInvitationServiceInput,
  ): Promise<CreateInvitationServiceResult>;
  accept(
    input: { token: string; password?: string; fullName?: string },
    accessToken?: string,
  ): Promise<AcceptedInvitationServiceResult>;
  cancel(actorUserId: string, invitationId: string): Promise<void>;
  resend(
    actorUserId: string,
    invitationId: string,
    expiresInDays?: number,
  ): Promise<CreateInvitationServiceResult>;
}

interface InvitationsServiceDependencies {
  repository: InvitationRepository;
  auth: AuthUserGateway;
  mailer: InvitationMailer;
  env: Env;
  now?: () => Date;
  generateToken?: () => string;
}

export class InvitationsService implements InvitationsServiceI {
  private readonly repository: InvitationRepository;
  private readonly auth: AuthUserGateway;
  private readonly mailer: InvitationMailer;
  private readonly env: Env;
  private readonly now: () => Date;
  private readonly generateToken: () => string;

  constructor(deps: InvitationsServiceDependencies) {
    this.repository = deps.repository;
    this.auth = deps.auth;
    this.mailer = deps.mailer;
    this.env = deps.env;
    this.now = deps.now ?? (() => new Date());
    this.generateToken = deps.generateToken ?? generateInvitationToken;
  }

  async validate(token: string): Promise<ValidateInvitationServiceResult> {
    const invitation = await this.repository.validate(
      await hashInvitationToken(token),
    );

    if (!invitation || !invitation.valid) {
      throw new AppError({
        code: ErrorCode.INVITATION_NOT_FOUND,
        message: "The invitation is invalid or no longer available.",
        status: 404,
      });
    }

    return {
      email: invitation.email,
      type: invitation.scope,
      organization_name: invitation.organization_name,
      expires_at: invitation.expires_at,
    };
  }

  async create(
    input: CreateInvitationServiceInput,
  ): Promise<CreateInvitationServiceResult> {
    const token = this.generateToken();
    const p_expires_at = this.expiresAt(input.expires_in_days || 7);
    const p_token_hash = await hashInvitationToken(token);

    const invitation = await this.repository.create({
      p_email: input.email,
      p_expires_at,
      p_scope: input.type,
      p_token_hash,
      ...(input.location_ids !== undefined && {
        p_location_ids: input.location_ids,
      }),
      ...(input.new_organization_name !== undefined && {
        p_new_organization_name: input.new_organization_name,
      }),
      ...(input.new_organization_slug !== undefined && {
        p_new_organization_slug: input.new_organization_slug,
      }),
      ...(input.organization_id !== undefined && {
        p_organization_id: input.organization_id,
      }),
      ...(input.platform_role !== undefined && {
        p_platform_role: input.platform_role,
      }),
      ...(input.role_ids !== undefined && { p_role_ids: input.role_ids }),
    });
    console.log("invitation", invitation);

    if (!invitation) {
      console.log("no invitation");
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The invitation could not be created.",
        status: 500,
      });
    }

    try {
      console.log("action link");
      const actionLink = await this.repository.getLink({
        email: invitation.email,
        redirectTo: `${this.env.FRONTEND_URL}/invitations/accept`,
        data: {
          owner_id: invitation.invited_by_user_id,
          role: invitation.scope,
          invitation_token: token,
        },
      });
      console.log("actionLink", actionLink);

      await this.mailer.sendInvitation({
        email: invitation.email,
        actionLink,
        expiresAt: invitation.expires_at,
        type: invitation.scope,
        organizationName: invitation.organization_name,
      });
    } catch (error) {
      console.log("error", error);
      try {
        await this.repository.cancel({ p_invitation_id: invitation.id });
      } catch (compensationError) {
        console.error("Failed to compensate invitation creation", {
          compensationError,
          invitationId: invitation.id,
        });
      }

      throw error;
    }

    return this.toServiceResult(invitation);
  }

  async accept(
    input: { token: string; password?: string; fullName?: string },
    accessToken?: string,
  ): Promise<AcceptedInvitationServiceResult> {
    const tokenHash = await hashInvitationToken(input.token);
    const invitation = await this.repository.validate(tokenHash);

    if (!invitation) {
      throw new AppError({
        code: ErrorCode.INVITATION_NOT_FOUND,
        message: "The invitation is invalid or no longer available.",
        status: 404,
      });
    }

    const existingUser = accessToken
      ? await this.auth.getUser(accessToken)
      : null;

    if (
      existingUser &&
      existingUser.email.toLowerCase() !== invitation.email.toLowerCase()
    ) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: "The authenticated user does not match the invitation email.",
        status: 403,
      });
    }

    let user: { id: string };
    let fullName: string;
    let createdUser = false;

    if (existingUser) {
      user = existingUser;
      fullName = existingUser.fullName;
    } else {
      if (!input.password || !input.fullName) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message:
            "password and fullName are required to create a new account.",
          status: 422,
        });
      }

      user = await this.auth.createUser({
        email: invitation.email,
        password: input.password,
        fullName: input.fullName,
      });
      fullName = input.fullName;
      createdUser = true;
    }

    try {
      const result = await this.repository.accept({
        p_token_hash: tokenHash,
        p_user_id: user.id,
        p_full_name: fullName,
      });

      if (!result) {
        throw new AppError({
          code: ErrorCode.INVITATION_NOT_FOUND,
          message: "The invitation could not be accepted.",
          status: 404,
        });
      }

      return {
        user_id: result.user_id,
        invitation_id: result.invitation_id,
        organization_id: result.organization_id,
        type: result.scope,
        accepted_at: result.accepted_at,
      };
    } catch (error) {
      if (createdUser) {
        await this.auth.deleteUser(user.id);
      }
      throw error;
    }
  }

  async cancel(invitationId: string): Promise<void> {
    await this.repository.cancel({ p_invitation_id: invitationId });
  }

  async resend(
    actorUserId: string,
    invitationId: string,
    expiresInDays = 7,
  ): Promise<CreateInvitationServiceResult> {
    const token = this.generateToken();
    const invitation = await this.repository.resend({
      p_invited_by_user_id: actorUserId,
      p_invitation_id: invitationId,
      p_token_hash: await hashInvitationToken(token),
      p_expires_at: this.expiresAt(expiresInDays),
    });

    if (!invitation) {
      throw new AppError({
        code: ErrorCode.INVITATION_NOT_FOUND,
        message: "The invitation could not be resent.",
        status: 404,
      });
    }

    const actionLink = await this.repository.getLink({
      email: invitation.email,
      redirectTo: `${this.env.FRONTEND_URL}/invitations/accept`,
      data: {
        owner_id: invitation.invited_by_user_id,
        role: invitation.scope,
        invitation_token: token,
      },
    });

    await this.mailer.sendInvitation({
      email: invitation.email,
      actionLink,
      expiresAt: invitation.expires_at,
      type: invitation.scope,
      organizationName: invitation.organization_name,
    });

    return this.toServiceResult(invitation);
  }

  async searchByPlatform(
    input: SearchPlatformInvitations,
  ): Promise<SearchPlatformInvitationsResult> {
    return this.repository.searchByPlatform(input);
  }

  async searchByOrganization(
    input: SearchOrganizationInvitations,
  ): Promise<SearchOrganizationInvitationsResult> {
    return this.repository.searchByOrganization(input);
  }

  private toServiceResult(invitation: {
    id: string;
    email: string;
    scope: string;
    status: string;
    organization_name: string;
    expires_at: string;
    created_at: string;
  }): CreateInvitationServiceResult {
    return {
      id: invitation.id,
      email: invitation.email,
      type: invitation.scope as CreateInvitationServiceResult["type"],
      status: invitation.status as "PENDING",
      organization_name: invitation.organization_name,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
    };
  }

  private expiresAt(expiresInDays: number): string {
    return new Date(
      this.now().getTime() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString();
  }
}
