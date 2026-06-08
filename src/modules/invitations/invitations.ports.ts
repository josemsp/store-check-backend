import type {
  AcceptedInvitation,
  AcceptedInvitationServiceResult,
  AcceptInvitationInput,
  CancelInvitationInput,
  CreateInvitationInput,
  CreateInvitationResult,
  CreateInvitationServiceInput,
  CreateInvitationServiceResult,
  InvitationPreview,
  InvitationValidateResult,
  ResendInvitationInput,
  ResendInvitationResult,
  ValidateInvitationServiceResult,
} from "./invitations.types";

export interface InvitationRepository {
  validate(tokenHash: string): Promise<InvitationValidateResult | null>;
  create(input: CreateInvitationInput): Promise<CreateInvitationResult | null>;
  accept(input: AcceptInvitationInput): Promise<AcceptedInvitation | null>;
  cancel(input: CancelInvitationInput): Promise<void>;
  resend(input: ResendInvitationInput): Promise<ResendInvitationResult | null>;
}

export interface InvitationsServiceI {
  create(input: CreateInvitationServiceInput): Promise<CreateInvitationServiceResult>;
  validate(token: string): Promise<ValidateInvitationServiceResult>;
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

export interface AuthUserGateway {
  getUser(accessToken: string): Promise<{
    id: string;
    email: string;
    fullName: string;
  } | null>;
  createUser(input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ id: string }>;
  deleteUser(userId: string): Promise<void>;
}

export interface InvitationMailer {
  sendInvitation(input: {
    email: string;
    token: string;
    expiresAt: string;
    type: InvitationPreview["type"];
    organizationName: string | null;
  }): Promise<void>;
}
