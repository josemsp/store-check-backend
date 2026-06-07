import { describe, expect, it } from 'vitest'

import {
  generateInvitationToken,
  hashInvitationToken,
} from '../../src/shared/utils/invitation-token'

describe('invitation tokens', () => {
  it('generates URL-safe, non-repeating tokens', () => {
    const first = generateInvitationToken()
    const second = generateInvitationToken()

    expect(first).toMatch(/^[A-Za-z0-9_-]+$/u)
    expect(first).not.toBe(second)
    expect(first.length).toBeGreaterThanOrEqual(43)
  })

  it('creates deterministic SHA-256 hashes without exposing the token', async () => {
    const token = 'example-invitation-token'
    const firstHash = await hashInvitationToken(token)
    const secondHash = await hashInvitationToken(token)

    expect(firstHash).toBe(secondHash)
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/u)
    expect(firstHash).not.toContain(token)
  })

  it('rejects weak token lengths', () => {
    expect(() => generateInvitationToken(8)).toThrow(RangeError)
  })
})
