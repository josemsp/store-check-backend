import z from "zod";
import { Database } from "../../shared/supabase/types";
import { CreateInvitationSchema } from "./invitations.schemas";

// Service
export type CreateInvitation = z.infer<typeof CreateInvitationSchema>;

export type CreateInvitationServiceInput = {
  email: CreateInvitationInput["p_email"];
  expires_in_days?: number;
  location_ids?: CreateInvitationInput["p_location_ids"];
  new_organization_name: CreateInvitationInput["p_new_organization_name"];
  new_organization_slug: CreateInvitationInput["p_new_organization_slug"];
  organization_id?: CreateInvitationInput["p_organization_id"];
  platform_role?: CreateInvitationInput["p_platform_role"];
  role_ids?: CreateInvitationInput["p_role_ids"];
  type: CreateInvitationInput["p_scope"];
};

type InvitationStatus = Database["public"]["Enums"]["invitation_status"];

export type SearchPlatformInvitations =
  Database["public"]["Functions"]["search_platform_invitations"]["Args"];

export type SearchPlatformInvitationsResult =
  Database["public"]["Functions"]["search_platform_invitations"]["Returns"];

export type SearchOrganizationInvitations =
  Database["public"]["Functions"]["search_organization_invitations"]["Args"];

export type SearchOrganizationInvitationsResult =
  Database["public"]["Functions"]["search_organization_invitations"]["Returns"];

// rpc types (functions)
export type InvitationType = Database["public"]["Enums"]["invitation_scope"];

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
  id: ResendInvitationResult["id"];
  email: ResendInvitationResult["email"];
  type: InvitationType;
  status: "PENDING";
  organization_name: ResendInvitationResult["organization_name"];
  expires_at: ResendInvitationResult["expires_at"];
  created_at: ResendInvitationResult["created_at"];
}

export interface AcceptedInvitationServiceResult {
  user_id: string;
  invitation_id: string;
  organization_id: string | null;
  type: InvitationType;
  accepted_at: string;
}
