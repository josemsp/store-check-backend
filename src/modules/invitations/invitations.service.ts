import { AppError } from '../../shared/errors/app-error'
import { ErrorCode } from '../../shared/errors/error-codes'
import {
  generateInvitationToken,
  hashInvitationToken,
} from '../../shared/utils/invitation-token'
import type {
  AuthUserGateway,
  InvitationMailer,
  InvitationRepository,
} from './invitations.ports'
import type {
  AcceptedInvitation,
  AcceptInvitationInput,
  CreateInvitationInput,
  InvitationPreview,
  InvitationSummary,
} from './invitations.types'

interface InvitationsServiceDependencies {
  repository: InvitationRepository
  auth: AuthUserGateway
  mailer: InvitationMailer
  now?: () => Date
  generateToken?: () => string
}

export class InvitationsService {
  private readonly repository: InvitationRepository
  private readonly auth: AuthUserGateway
  private readonly mailer: InvitationMailer
  private readonly now: () => Date
  private readonly generateToken: () => string

  constructor({
    repository,
    auth,
    mailer,
    now = () => new Date(),
    generateToken = generateInvitationToken,
  }: InvitationsServiceDependencies) {
    this.repository = repository
    this.auth = auth
    this.mailer = mailer
    this.now = now
    this.generateToken = generateToken
  }

  async validate(token: string): Promise<InvitationPreview> {
    const invitation = await this.repository.validate(
      await hashInvitationToken(token),
    )

    if (!invitation) {
      throw new AppError({
        code: ErrorCode.INVITATION_NOT_FOUND,
        message: 'The invitation is invalid or no longer available.',
        status: 404,
      })
    }

    return invitation
  }

  async create(input: CreateInvitationInput): Promise<InvitationSummary> {
    const token = this.generateToken()
    const expiresAt = this.expiresAt(input.expiresInDays)
    const invitation = await this.repository.create({
      ...input,
      tokenHash: await hashInvitationToken(token),
      expiresAt,
    })

    try {
      await this.mailer.sendInvitation({
        email: invitation.email,
        token,
        expiresAt: invitation.expiresAt,
        type: invitation.type,
        organizationName: invitation.organizationName,
      })
    } catch (error) {
      try {
        await this.repository.cancel({
          actorUserId: input.actorUserId,
          invitationId: invitation.id,
        })
      } catch (compensationError) {
        console.error('Failed to compensate invitation creation', {
          compensationError,
          invitationId: invitation.id,
        })
      }

      throw error
    }

    return invitation
  }

  async accept(
    input: AcceptInvitationInput,
    accessToken?: string,
  ): Promise<AcceptedInvitation> {
    const tokenHash = await hashInvitationToken(input.token)
    const invitation = await this.repository.validate(tokenHash)

    if (!invitation) {
      throw new AppError({
        code: ErrorCode.INVITATION_NOT_FOUND,
        message: 'The invitation is invalid or no longer available.',
        status: 404,
      })
    }

    const existingUser = accessToken
      ? await this.auth.getUser(accessToken)
      : null

    if (
      existingUser
      && existingUser.email.toLowerCase() !== invitation.email.toLowerCase()
    ) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'The authenticated user does not match the invitation email.',
        status: 403,
      })
    }

    if (!existingUser && (!input.password || !input.fullName)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message:
          'password and fullName are required to create a new account.',
        status: 422,
      })
    }

    let user: { id: string }
    let fullName: string
    let createdUser = false

    if (existingUser) {
      user = existingUser
      fullName = existingUser.fullName
    } else {
      user = await this.auth.createUser({
        email: invitation.email,
        password: input.password as string,
        fullName: input.fullName as string,
      })
      fullName = input.fullName as string
      createdUser = true
    }

    try {
      return await this.repository.accept({
        tokenHash,
        userId: user.id,
        fullName,
      })
    } catch (error) {
      if (createdUser) {
        await this.auth.deleteUser(user.id)
      }
      throw error
    }
  }

  async cancel(actorUserId: string, invitationId: string): Promise<void> {
    await this.repository.cancel({ actorUserId, invitationId })
  }

  async resend(
    actorUserId: string,
    invitationId: string,
    expiresInDays = 7,
  ): Promise<InvitationSummary> {
    const token = this.generateToken()
    const invitation = await this.repository.resend({
      actorUserId,
      invitationId,
      tokenHash: await hashInvitationToken(token),
      expiresAt: this.expiresAt(expiresInDays),
    })

    await this.mailer.sendInvitation({
      email: invitation.email,
      token,
      expiresAt: invitation.expiresAt,
      type: invitation.type,
      organizationName: invitation.organizationName,
    })

    return invitation
  }

  private expiresAt(expiresInDays: number): string {
    return new Date(
      this.now().getTime() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString()
  }
}
