import { createMiddleware } from 'hono/factory'

import type { AppBindings } from '../types/context'

export const requestContext = createMiddleware<AppBindings>(async (c, next) => {
  const requestId = c.req.header('x-request-id') ?? crypto.randomUUID()

  c.set('requestId', requestId)
  c.header('x-request-id', requestId)

  await next()
})
