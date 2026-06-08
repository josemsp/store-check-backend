import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../../../src/app'
import { testEnv } from '../../helpers/env'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('invitation HTTP contract', () => {
  it('validates an invitation using the public endpoint', async () => {
    const rpcFetch = vi.fn().mockResolvedValue(
      Response.json([
        {
          valid: true,
          email: 'owner@example.com',
          scope: 'NEW_ORGANIZATION',
          organization_name: 'New Store',
          expires_at: '2026-06-14T00:00:00.000Z',
        },
      ]),
    )
    vi.stubGlobal('fetch', rpcFetch)

    const response = await createApp().request(
      '/api/v1/invitations/validate?token=valid-raw-invitation-token',
      {},
      testEnv,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      success: true,
      data: {
        email: 'owner@example.com',
        type: 'NEW_ORGANIZATION',
        organization_name: 'New Store',
      },
    })
    expect(rpcFetch).toHaveBeenCalledWith(
      expect.stringContaining('/rest/v1/rpc/validate_invitation'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('protects invitation creation with Bearer authentication', async () => {
    const response = await createApp().request(
      '/api/v1/invitations',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'employee@example.com',
          type: 'ORGANIZATION',
          organizationId: '26a0a94d-aeda-4698-9417-d48171fe5181',
          roleIds: ['299f7722-a394-4f9f-b06a-3578a3430d08'],
        }),
      },
      testEnv,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED' },
    })
  })

  it('publishes stable invitation operations for Orval', async () => {
    const document = await (
      await createApp().request('/openapi.json', {}, testEnv)
    ).json<{
      components: {
        schemas: Record<string, unknown>
      }
      paths: Record<
        string,
        Record<string, { operationId?: string; security?: unknown[] }>
      >
    }>()

    expect(document.paths).toMatchObject({
      '/api/v1/invitations/validate': {
        get: { operationId: 'validateInvitation' },
      },
      '/api/v1/invitations': {
        post: {
          operationId: 'createInvitation',
          security: [{ BearerAuth: [] }],
        },
      },
      '/api/v1/invitations/accept': {
        post: { operationId: 'acceptInvitation' },
      },
      '/api/v1/invitations/{id}/cancel': {
        post: { operationId: 'cancelInvitation' },
      },
      '/api/v1/invitations/{id}/resend': {
        post: { operationId: 'resendInvitation' },
      },
    })

    const validateResponse = JSON.stringify(
      document.components.schemas.ValidateInvitationResponse,
    )
    const responseMeta = JSON.stringify(
      document.components.schemas.ResponseMeta,
    )

    expect(validateResponse).toContain('organization_name')
    expect(validateResponse).toContain('expires_at')
    expect(validateResponse).not.toContain('organizationName')
    expect(responseMeta).toContain('request_id')
    expect(responseMeta).not.toContain('requestId')
  })
})
