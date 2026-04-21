import { notFound } from 'next/navigation'

function parseAdminList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(
  user: { id: string; email?: string | null } | null
): boolean {
  if (!user) return false

  const adminEmails = parseAdminList(process.env.ADMIN_EMAILS)
  const adminUserIds = parseAdminList(process.env.ADMIN_USER_IDS)

  return (
    adminUserIds.includes(user.id.toLowerCase()) ||
    (user.email ? adminEmails.includes(user.email.toLowerCase()) : false)
  )
}

export function requireAdminUser(
  user: { id: string; email?: string | null } | null
) {
  if (!isAdminUser(user)) {
    notFound()
  }
}
