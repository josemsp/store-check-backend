import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'

import { requestContext } from '../../src/shared/middlewares/request-context.middleware'
import type { AppBindings } from '../../src/shared/types/context'
import {
  errorResponse,
  successResponse,
} from '../../src/shared/utils/response'

describe('response helpers', () => {
  it('includes pagination metadata in successful responses', async () => {
    const app = new Hono<AppBindings>()
    app.use('*', requestContext)
    app.get('/', (c) =>
      successResponse(c, [{ id: 'item-1' }], 200, {
        pagination: {
          page: 2,
          page_size: 10,
          total_items: 25,
          total_pages: 3,
        },
      }),
    )

    const response = await app.request('/', {
      headers: { 'x-request-id': 'request-pagination' },
    })

    expect(await response.json()).toEqual({
      success: true,
      data: [{ id: 'item-1' }],
      meta: {
        request_id: 'request-pagination',
        pagination: {
          page: 2,
          page_size: 10,
          total_items: 25,
          total_pages: 3,
        },
      },
    })
  })

  it('omits pagination metadata when it is not provided', async () => {
    const app = new Hono<AppBindings>()
    app.use('*', requestContext)
    app.get('/', (c) => successResponse(c, { id: 'item-1' }, 200))

    const response = await app.request('/', {
      headers: { 'x-request-id': 'request-without-pagination' },
    })

    expect(await response.json()).toEqual({
      success: true,
      data: { id: 'item-1' },
      meta: {
        request_id: 'request-without-pagination',
      },
    })
  })

  it('converts nested response data keys to snake_case', async () => {
    const app = new Hono<AppBindings>()
    app.use('*', requestContext)
    app.get('/', (c) =>
      successResponse(
        c,
        {
          invitationId: 'invitation-1',
          organization: {
            createdAt: '2026-06-07T00:00:00.000Z',
          },
        },
        200,
      ),
    )

    const response = await app.request('/')

    expect(await response.json()).toMatchObject({
      data: {
        invitation_id: 'invitation-1',
        organization: {
          created_at: '2026-06-07T00:00:00.000Z',
        },
      },
    })
  })

  it('converts nested error details keys to snake_case', async () => {
    const app = new Hono<AppBindings>()
    app.use('*', requestContext)
    app.get('/', (c) =>
      errorResponse(c, 'INVALID_REQUEST', 'Invalid request.', 422, {
        fieldErrors: {
          organizationId: ['The organization is required.'],
        },
      }),
    )

    const response = await app.request('/')

    expect(await response.json()).toMatchObject({
      error: {
        details: {
          field_errors: {
            organization_id: ['The organization is required.'],
          },
        },
      },
    })
  })
})
