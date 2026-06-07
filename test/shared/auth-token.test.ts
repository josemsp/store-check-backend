import { describe, expect, it } from 'vitest'

import { readBearerToken } from '../../src/shared/utils/auth-token'

describe('readBearerToken', () => {
  it('extracts a case-insensitive bearer token', () => {
    expect(readBearerToken('bearer access-token')).toBe('access-token')
  })

  it.each([
    undefined,
    '',
    'Basic credentials',
    'Bearer',
    'Bearer token unexpected',
  ])('rejects malformed authorization value: %s', (authorization) => {
    expect(readBearerToken(authorization)).toBeUndefined()
  })
})
