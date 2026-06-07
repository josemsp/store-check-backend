import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../src/app'
import { testEnv } from './helpers/env'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('application', () => {
  it('returns service health using the standard response envelope', async () => {
    const databaseFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json([]),
    )
    vi.stubGlobal('fetch', databaseFetch)

    const app = createApp()
    const response = await app.request(
      '/api/v1/health',
      { headers: { 'x-request-id': 'request-123' } },
      testEnv,
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBe('request-123')
    expect(body).toMatchObject({
      success: true,
      data: {
        database: {
          status: 'ok',
        },
        service: 'store-check-backend',
        status: 'ok',
      },
      meta: {
        requestId: 'request-123',
      },
    })
    const databaseRequest = databaseFetch.mock.calls[0]
    const databaseHeaders = new Headers(databaseRequest?.[1]?.headers)

    expect(databaseRequest?.[0]).toBe(
      'https://example.supabase.co/rest/v1/profiles?select=id&limit=1',
    )
    expect(databaseHeaders.get('apikey')).toBe('test-service-role-key')
  })

  it('reports service unavailable when the database cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json(
          { message: 'Database unavailable' },
          { status: 503 },
        ),
      ),
    )

    const response = await createApp().request(
      '/api/v1/health',
      { headers: { 'x-request-id': 'request-503' } },
      testEnv,
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'The database is unavailable.',
      },
      meta: {
        requestId: 'request-503',
      },
    })
  })

  it('returns a standard not-found error', async () => {
    const app = createApp()
    const response = await app.request('/missing', {}, testEnv)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
      },
    })
  })

  it('only allows configured CORS origins', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([])))

    const app = createApp()
    const response = await app.request(
      '/api/v1/health',
      { headers: { origin: 'http://localhost:5173' } },
      testEnv,
    )

    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    )
  })

  it('publishes a stable OpenAPI contract for client generation', async () => {
    const app = createApp()
    const response = await app.request('/openapi.json', {}, testEnv)
    const document = await response.json()

    expect(response.status).toBe(200)
    expect(document).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Store Check API',
        version: '0.1.0',
      },
      paths: {
        '/api/v1/health': {
          get: {
            operationId: 'getHealth',
            tags: ['System'],
          },
        },
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
    })
  })

  it('exposes unique operation IDs for deterministic Orval output', async () => {
    const app = createApp()
    const response = await app.request('/openapi.json', {}, testEnv)
    const document = await response.json<{
      paths: Record<string, Record<string, { operationId?: string }>>
    }>()
    const operationIds = Object.values(document.paths).flatMap((path) =>
      Object.values(path)
        .map((operation) => operation.operationId)
        .filter((operationId): operationId is string => Boolean(operationId)),
    )

    expect(operationIds.length).toBeGreaterThan(0)
    expect(new Set(operationIds).size).toBe(operationIds.length)
  })

  it('serves interactive API documentation', async () => {
    const app = createApp()
    const response = await app.request('/docs', {}, testEnv)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(await response.text()).toContain('/openapi.json')
  })
})
