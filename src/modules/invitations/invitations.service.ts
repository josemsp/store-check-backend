import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "../../shared/utils/invitation-token";
import type {
  AuthUserGateway,
  InvitationMailer,
  InvitationRepository,
  InvitationsServiceI,
} from "./invitations.ports";
import type {
  AcceptedInvitationServiceResult,
  CreateInvitationInput,
  CreateInvitationServiceInput,
  CreateInvitationServiceResult,
  ValidateInvitationServiceResult,
} from "./invitations.types";

interface InvitationsServiceDependencies {
  repository: InvitationRepository;
  auth: AuthUserGateway;
  mailer: InvitationMailer;
  now?: () => Date;
  generateToken?: () => string;
}

export class InvitationsService implements InvitationsServiceI {
  private readonly repository: InvitationRepository;
  private readonly auth: AuthUserGateway;
  private readonly mailer: InvitationMailer;
  private readonly now: () => Date;
  private readonly generateToken: () => string;

  constructor({
    repository,
    auth,
    mailer,
    now = () => new Date(),
    generateToken = generateInvitationToken,
  }: InvitationsServiceDependencies) {
    this.repository = repository;
    this.auth = auth;
    this.mailer = mailer;
    this.now = now;
    this.generateToken = generateToken;
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
    const expiresAt = this.expiresAt(input.expiresInDays);
    const p_token_hash = await hashInvitationToken(token);

    const args: CreateInvitationInput = {
      p_email: input.email,
      p_expires_at: expiresAt,
      p_invited_by_user_id: input.actorUserId,
      p_scope: input.type,
      p_token_hash,
    };

    if (input.locationIds !== undefined) {
      args.p_location_ids = input.locationIds;
    }
    if (input.newOrganization !== undefined) {
      args.p_new_organization = input.newOrganization;
    }
    if (input.organizationId !== undefined) {
      args.p_organization_id = input.organizationId;
    }
    if (input.platformRole !== undefined) {
      args.p_platform_role = input.platformRole;
    }
    if (input.roleIds !== undefined) {
      args.p_role_ids = input.roleIds;
    }

    const invitation = await this.repository.create(args);

    if (!invitation) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "The invitation could not be created.",
        status: 500,
      });
    }

    try {
      await this.mailer.sendInvitation({
        email: invitation.email,
        token,
        expiresAt: invitation.expires_at,
        type: invitation.scope,
        organizationName: invitation.organization_name,
      });
    } catch (error) {
      try {
        await this.repository.cancel({
          p_invited_by_user_id: input.actorUserId,
          p_invitation_id: invitation.id,
        });
      } catch (compensationError) {
        console.error("Failed to compensate invitation creation", {
          compensationError,
          invitationId: invitation.id,
        });
      }

      throw error;
    }

    return {
      id: invitation.id,
      email: invitation.email,
      type: invitation.scope,
      status: invitation.status as "PENDING",
      organization_name: invitation.organization_name,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
    };
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

    if (!existingUser && (!input.password || !input.fullName)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: "password and fullName are required to create a new account.",
        status: 422,
      });
    }

    let user: { id: string };
    let fullName: string;
    let createdUser = false;

    if (existingUser) {
      user = existingUser;
      fullName = existingUser.fullName;
    } else {
      user = await this.auth.createUser({
        email: invitation.email,
        password: input.password as string,
        fullName: input.fullName as string,
      });
      fullName = input.fullName as string;
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

  async cancel(actorUserId: string, invitationId: string): Promise<void> {
    await this.repository.cancel({
      p_invited_by_user_id: actorUserId,
      p_invitation_id: invitationId,
    });
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

    await this.mailer.sendInvitation({
      email: invitation.email,
      token,
      expiresAt: invitation.expires_at,
      type: invitation.scope,
      organizationName: invitation.organization_name,
    });

    return {
      id: invitation.id,
      email: invitation.email,
      type: invitation.scope,
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
