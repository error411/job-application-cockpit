export function normalizeLinkedInUrl(input?: string | null): string | null {
  if (!input) return null

  let value = input.trim()
  if (!value) return null

  if (
    value.startsWith('linkedin.com/') ||
    value.startsWith('www.linkedin.com/')
  ) {
    value = `https://${value}`
  }

  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    if (!hostname.includes('linkedin.com')) {
      return null
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}