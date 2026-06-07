import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'

import { requestContext } from '../../src/shared/middlewares/request-context.middleware'
import type { AppBindings } from '../../src/shared/types/context'
import { successResponse } from '../../src/shared/utils/response'

describe('response helpers', () => {
  it('includes pagination metadata in successful responses', async () => {
    const app = new Hono<AppBindings>()
    app.use('*', requestContext)
    app.get('/', (c) =>
      successResponse(c, [{ id: 'item-1' }], 200, {
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 25,
          totalPages: 3,
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
        requestId: 'request-pagination',
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 25,
          totalPages: 3,
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
        requestId: 'request-without-pagination',
      },
    })
  })
})
