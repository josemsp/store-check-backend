const DEFAULT_TOKEN_BYTES = 32

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '')
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

export function generateInvitationToken(
  byteLength = DEFAULT_TOKEN_BYTES,
): string {
  if (!Number.isInteger(byteLength) || byteLength < 16) {
    throw new RangeError('Invitation tokens require at least 16 bytes.')
  }

  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)

  return bytesToBase64Url(bytes)
}

export async function hashInvitationToken(token: string): Promise<string> {
  if (!token) {
    throw new TypeError('Invitation token cannot be empty.')
  }

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )

  return bytesToHex(new Uint8Array(digest))
}
