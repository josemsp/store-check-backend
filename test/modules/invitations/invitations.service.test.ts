import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../src/shared/errors/app-error'
import { InvitationsService } from '../../../src/modules/invitations/invitations.service'
import type {
  AuthUserGateway,
  InvitationMailer,
  InvitationRepository,
} from '../../../src/modules/invitations/invitations.ports'

function createRepository(
  overrides: Partial<InvitationRepository> = {},
): InvitationRepository {
  return {
    accept: vi.fn(),
    cancel: vi.fn(),
    create: vi.fn(),
    resend: vi.fn(),
    validate: vi.fn(),
    ...overrides,
  }
}

function createAuthGateway(
  overrides: Partial<AuthUserGateway> = {},
): AuthUserGateway {
  return {
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    getUser: vi.fn(),
    ...overrides,
  }
}

const mailer: InvitationMailer = {
  sendInvitation: vi.fn(),
}

describe('InvitationsService', () => {
  it('validates a raw token through its hash and returns only safe data', async () => {
    const validate = vi.fn().mockResolvedValue({
      email: 'owner@example.com',
      expiresAt: '2026-06-14T00:00:00.000Z',
      organizationName: 'Store Check',
      type: 'NEW_ORGANIZATION',
    })
    const service = new InvitationsService({
      auth: createAuthGateway(),
      mailer,
      repository: createRepository({ validate }),
    })

    const result = await service.validate('raw-secret-token')

    expect(validate).toHaveBeenCalledOnce()
    expect(validate).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/u),
    )
    expect(validate).not.toHaveBeenCalledWith('raw-secret-token')
    expect(result).toEqual({
      email: 'owner@example.com',
      expiresAt: '2026-06-14T00:00:00.000Z',
      organizationName: 'Store Check',
      type: 'NEW_ORGANIZATION',
    })
  })

  it('deletes the Auth user when invitation acceptance fails', async () => {
    const deleteUser = vi
      .fn<AuthUserGateway['deleteUser']>()
      .mockResolvedValue(undefined)
    const auth = createAuthGateway({
      createUser: vi.fn().mockResolvedValue({ id: 'user-id' }),
      deleteUser,
    })
    const repository = createRepository({
      accept: vi
        .fn()
        .mockRejectedValue(
          new AppError({
            code: 'INVITATION_EXPIRED',
            message: 'The invitation has expired.',
            status: 410,
          }),
        ),
      validate: vi.fn().mockResolvedValue({
        email: 'employee@example.com',
        expiresAt: '2026-06-14T00:00:00.000Z',
        organizationName: 'Store Check',
        type: 'ORGANIZATION',
      }),
    })
    const service = new InvitationsService({
      auth,
      mailer,
      repository,
    })

    await expect(
      service.accept({
        fullName: 'Maria Perez',
        password: 'secure-password',
        token: 'raw-secret-token',
      }),
    ).rejects.toMatchObject({ code: 'INVITATION_EXPIRED' })
    expect(deleteUser).toHaveBeenCalledWith('user-id')
  })

  it('accepts another organization for an existing authenticated user', async () => {
    const createUser = vi.fn<AuthUserGateway['createUser']>()
    const deleteUser = vi.fn<AuthUserGateway['deleteUser']>()
    const accept = vi.fn<InvitationRepository['accept']>().mockResolvedValue({
      userId: 'user-id',
      invitationId: 'invitation-id',
      organizationId: 'organization-id',
      type: 'ORGANIZATION',
      acceptedAt: '2026-06-07T00:00:00.000Z',
    })
    const service = new InvitationsService({
      auth: createAuthGateway({
        createUser,
        deleteUser,
        getUser: vi.fn().mockResolvedValue({
          id: 'user-id',
          email: 'employee@example.com',
          fullName: 'Existing User',
        }),
      }),
      mailer,
      repository: createRepository({
        accept,
        validate: vi.fn().mockResolvedValue({
          email: 'employee@example.com',
          expiresAt: '2026-06-14T00:00:00.000Z',
          organizationName: 'Second Organization',
          type: 'ORGANIZATION',
        }),
      }),
    })

    await service.accept(
      { token: 'raw-secret-token' },
      'existing-access-token',
    )

    expect(createUser).not.toHaveBeenCalled()
    expect(deleteUser).not.toHaveBeenCalled()
    const acceptedInput = accept.mock.calls[0]?.[0]

    expect(acceptedInput?.tokenHash).toMatch(/^[a-f0-9]{64}$/u)
    expect(acceptedInput).toMatchObject({
      userId: 'user-id',
      fullName: 'Existing User',
    })
  })

  it('requires registration data when no existing session is provided', async () => {
    const service = new InvitationsService({
      auth: createAuthGateway(),
      mailer,
      repository: createRepository({
        validate: vi.fn().mockResolvedValue({
          email: 'employee@example.com',
          expiresAt: '2026-06-14T00:00:00.000Z',
          organizationName: 'Store Check',
          type: 'ORGANIZATION',
        }),
      }),
    })

    await expect(
      service.accept({ token: 'raw-secret-token' }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 422,
    })
  })

  it('creates an invitation without returning or persisting its raw token', async () => {
    const create = vi.fn<InvitationRepository['create']>().mockResolvedValue({
      id: 'invitation-id',
      email: 'owner@example.com',
      expiresAt: '2026-06-14T00:00:00.000Z',
      organizationName: 'New Store',
      type: 'NEW_ORGANIZATION',
      status: 'PENDING',
      createdAt: '2026-06-07T00:00:00.000Z',
    })
    const sendInvitation = vi.fn().mockResolvedValue(undefined)
    const service = new InvitationsService({
      auth: createAuthGateway(),
      generateToken: () => 'raw-secret-token',
      mailer: { sendInvitation },
      now: () => new Date('2026-06-07T00:00:00.000Z'),
      repository: createRepository({ create }),
    })

    const result = await service.create({
      actorUserId: 'admin-id',
      email: 'owner@example.com',
      type: 'NEW_ORGANIZATION',
      roleIds: [],
      locationIds: [],
      newOrganization: {
        name: 'New Store',
        slug: 'new-store',
      },
      expiresInDays: 7,
    })

    const persistedInvitation = create.mock.calls[0]?.[0]

    expect(persistedInvitation?.tokenHash).toMatch(/^[a-f0-9]{64}$/u)
    expect(persistedInvitation?.expiresAt).toBe(
      '2026-06-14T00:00:00.000Z',
    )
    expect(create).not.toHaveBeenCalledWith(
      expect.objectContaining({ token: 'raw-secret-token' }),
    )
    expect(sendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'raw-secret-token' }),
    )
    expect(result).not.toHaveProperty('token')
    expect(result).not.toHaveProperty('tokenHash')
  })

  it('cancels a new invitation when email delivery fails', async () => {
    const cancel = vi
      .fn<InvitationRepository['cancel']>()
      .mockResolvedValue(undefined)
    const service = new InvitationsService({
      auth: createAuthGateway(),
      generateToken: () => 'raw-secret-token',
      mailer: {
        sendInvitation: vi
          .fn()
          .mockRejectedValue(new Error('Email provider unavailable')),
      },
      repository: createRepository({
        cancel,
        create: vi.fn().mockResolvedValue({
          id: 'invitation-id',
          email: 'owner@example.com',
          expiresAt: '2026-06-14T00:00:00.000Z',
          organizationName: 'New Store',
          type: 'NEW_ORGANIZATION',
          status: 'PENDING',
          createdAt: '2026-06-07T00:00:00.000Z',
        }),
      }),
    })

    await expect(
      service.create({
        actorUserId: 'admin-id',
        email: 'owner@example.com',
        type: 'NEW_ORGANIZATION',
        roleIds: [],
        locationIds: [],
        newOrganization: {
          name: 'New Store',
          slug: 'new-store',
        },
        expiresInDays: 7,
      }),
    ).rejects.toThrow('Email provider unavailable')
    expect(cancel).toHaveBeenCalledWith({
      actorUserId: 'admin-id',
      invitationId: 'invitation-id',
    })
  })
})
