import type {
  AcceptedInvitation,
  CreateInvitationInput,
  InvitationPreview,
  InvitationSummary,
} from './invitations.types'

export interface InvitationRepository {
  validate(tokenHash: string): Promise<InvitationPreview | null>
  create(
    input: CreateInvitationInput & {
      tokenHash: string
      expiresAt: string
    },
  ): Promise<InvitationSummary>
  accept(input: {
    tokenHash: string
    userId: string
    fullName: string
  }): Promise<AcceptedInvitation>
  cancel(input: {
    actorUserId: string
    invitationId: string
  }): Promise<void>
  resend(input: {
    actorUserId: string
    invitationId: string
    tokenHash: string
    expiresAt: string
  }): Promise<InvitationSummary>
}

export interface AuthUserGateway {
  getUser(accessToken: string): Promise<{
    id: string
    email: string
    fullName: string
  } | null>
  createUser(input: {
    email: string
    password: string
    fullName: string
  }): Promise<{ id: string }>
  deleteUser(userId: string): Promise<void>
}

export interface InvitationMailer {
  sendInvitation(input: {
    email: string
    token: string
    expiresAt: string
    type: InvitationPreview['type']
    organizationName: string | null
  }): Promise<void>
}
