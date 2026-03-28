const COOKIE_NAME = 'site_auth'
const TTL_SECONDS = 60 * 60 * 24 * 7

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return secret
}

function getSitePassword(): string {
  const password = process.env.SITE_PASSWORD
  if (!password) throw new Error('SITE_PASSWORD is not set')
  return password
}

// --- helpers ---
function toUint8(str: string) {
  return new TextEncoder().encode(str)
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    toUint8(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, toUint8(value))

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// --- exports ---
export function getSiteAuthCookieName(): string {
  return COOKIE_NAME
}

export function getSiteAuthMaxAge(): number {
  return TTL_SECONDS
}

export function isCorrectSitePassword(input: string): boolean {
  return input === getSitePassword()
}

export async function createSiteAuthCookieValue(): Promise<string> {
  const expiresAt = String(Math.floor(Date.now() / 1000) + TTL_SECONDS)
  const payload = `ok.${expiresAt}`
  const signature = await sign(payload)

  return `${payload}.${signature}`
}

export async function verifySiteAuthCookieValue(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false

  const parts = value.split('.')
  if (parts.length !== 3) return false

  const [status, expiresAt, signature] = parts
  if (status !== 'ok') return false

  const expiresNum = Number(expiresAt)
  if (!Number.isFinite(expiresNum)) return false
  if (expiresNum < Math.floor(Date.now() / 1000)) return false

  const payload = `${status}.${expiresAt}`
  const expected = await sign(payload)

  return timingSafeEqual(expected, signature)
}