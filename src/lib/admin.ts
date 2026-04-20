import { notFound } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

function parseAdminList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(user: Pick<User, 'id' | 'email'> | null): boolean {
  if (!user) return false

  const adminEmails = parseAdminList(process.env.ADMIN_EMAILS)
  const adminUserIds = parseAdminList(process.env.ADMIN_USER_IDS)

  return (
    adminUserIds.includes(user.id.toLowerCase()) ||
    (user.email ? adminEmails.includes(user.email.toLowerCase()) : false)
  )
}

export function requireAdminUser(user: Pick<User, 'id' | 'email'> | null) {
  if (!isAdminUser(user)) {
    notFound()
  }
}
