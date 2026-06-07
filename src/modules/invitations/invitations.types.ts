export const InvitationType = {
  NEW_ORGANIZATION: 'NEW_ORGANIZATION',
  ORGANIZATION: 'ORGANIZATION',
  PLATFORM: 'PLATFORM',
} as const

export type InvitationType =
  (typeof InvitationType)[keyof typeof InvitationType]

export interface InvitationPreview {
  email: string
  expiresAt: string
  organizationName: string | null
  type: InvitationType
}

export interface InvitationSummary extends InvitationPreview {
  id: string
  status: 'PENDING'
  createdAt: string
}

export interface CreateInvitationInput {
  actorUserId: string
  email: string
  type: InvitationType
  organizationId?: string
  roleIds: string[]
  locationIds: string[]
  platformRole?: 'ROOT' | 'SUPER_ADMIN' | 'SUPPORT'
  newOrganization?: {
    name: string
    slug: string
  }
  expiresInDays: number
}

export interface AcceptInvitationInput {
  token: string
  password?: string
  fullName?: string
}

export interface AcceptedInvitation {
  userId: string
  invitationId: string
  organizationId: string | null
  type: InvitationType
  acceptedAt: string
}
