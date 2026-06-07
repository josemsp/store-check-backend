export function readBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined

  const [scheme, token, extra] = authorization.trim().split(/\s+/)

  if (scheme?.toLowerCase() !== 'bearer' || !token || extra) {
    return undefined
  }

  return token
}
