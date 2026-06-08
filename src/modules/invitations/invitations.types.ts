import z from "zod";
import { Database } from "../../shared/supabase/types";
import { CreateInvitationSchema } from "./invitations.schemas";

export const InvitationType = {
  NEW_ORGANIZATION: "NEW_ORGANIZATION",
  ORGANIZATION: "ORGANIZATION",
  PLATFORM: "PLATFORM",
} as const;

export interface InvitationPreview {
  email: string;
  expiresAt: string;
  organizationName: string | null;
  type: InvitationType;
}
export interface InvitationSummary extends InvitationPreview {
  id: string;
  status: "PENDING";
  createdAt: string;
}

// Service
export type CreateInvitation = z.infer<typeof CreateInvitationSchema>;

export type CreateInvitationServiceInput = CreateInvitation & {
  actorUserId: string;
};

// rpc types (functions)
export type InvitationType =
  (typeof InvitationType)[keyof typeof InvitationType];

export type InvitationValidateResult =
  Database["public"]["Functions"]["validate_invitation"]["Returns"][0];

export type CreateInvitationInput =
  Database["public"]["Functions"]["create_invitation"]["Args"];

export type CreateInvitationResult =
  Database["public"]["Functions"]["create_invitation"]["Returns"][0];

export type AcceptInvitationInput =
  Database["public"]["Functions"]["accept_invitation"]["Args"];

export type AcceptedInvitation =
  Database["public"]["Functions"]["accept_invitation"]["Returns"][0];

export type CancelInvitationInput =
  Database["public"]["Functions"]["cancel_invitation"]["Args"];

export type ResendInvitationInput =
  Database["public"]["Functions"]["resend_invitation"]["Args"];

export type ResendInvitationResult =
  Database["public"]["Functions"]["resend_invitation"]["Returns"][0];

export interface ValidateInvitationServiceResult {
  email: string;
  type: InvitationType;
  organization_name: string | null;
  expires_at: string;
}

export interface CreateInvitationServiceResult {
  id: string;
  email: string;
  type: InvitationType;
  status: "PENDING";
  organization_name: string | null;
  expires_at: string;
  created_at: string;
}

export interface AcceptedInvitationServiceResult {
  user_id: string;
  invitation_id: string;
  organization_id: string | null;
  type: InvitationType;
  accepted_at: string;
}

