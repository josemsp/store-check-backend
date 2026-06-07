import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

import { healthRoutes } from './modules/health/health.routes'
import { invitationsRoutes } from './modules/invitations/invitations.routes'
import { ErrorCode } from './shared/errors/error-codes'
import { handleError } from './shared/middlewares/error.middleware'
import { requestContext } from './shared/middlewares/request-context.middleware'
import { supabaseContext } from './shared/middlewares/supabase.middleware'
import {
  API_DOCS_PATH,
  API_PREFIX,
  OPENAPI_DOCUMENT,
  OPENAPI_PATH,
} from './shared/openapi/api-contract'
import { ApiFailureSchema } from './shared/openapi/schemas'
import type { AppBindings } from './shared/types/context'
import type { Env } from './shared/types/env'
import { errorResponse } from './shared/utils/response'

function getAllowedOrigins(value?: string): string[] {
  return value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []
}

export function createApp(): OpenAPIHono<AppBindings> {
  const app = new OpenAPIHono<AppBindings>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          ErrorCode.VALIDATION_ERROR,
          'The request data is invalid.',
          422,
          result.error.issues,
        )
      }

      return undefined
    },
  })

  app.use('*', requestContext)
  app.use('*', supabaseContext)
  app.use('*', secureHeaders())
  app.use(
    '*',
    cors({
      allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id'],
      origin: (origin, c) => {
        const allowedOrigins = getAllowedOrigins(
          (c.env as Env).CORS_ORIGINS,
        )
        return allowedOrigins.includes(origin) ? origin : null
      },
    }),
  )

  app.openAPIRegistry.registerComponent(
    'securitySchemes',
    'BearerAuth',
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Supabase Auth access token.',
    },
  )
  app.openAPIRegistry.register('ApiFailure', ApiFailureSchema)

  app.route(`${API_PREFIX}/health`, healthRoutes)
  app.route(`${API_PREFIX}/invitations`, invitationsRoutes)

  app.doc31(OPENAPI_PATH, (c) => ({
    ...OPENAPI_DOCUMENT,
    tags: OPENAPI_DOCUMENT.tags.map((tag) => ({ ...tag })),
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: 'Current environment',
      },
    ],
  }))
  app.get(
    API_DOCS_PATH,
    swaggerUI({
      url: OPENAPI_PATH,
      persistAuthorization: true,
    }),
  )

  app.notFound((c) =>
    errorResponse(
      c,
      ErrorCode.NOT_FOUND,
      'The requested resource was not found.',
      404,
    ),
  )
  app.onError(handleError)

  return app
}

export const app = createApp()
