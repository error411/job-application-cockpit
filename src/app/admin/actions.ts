'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { isAdminUser, requireAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

const LONG_BAN_DURATION = '876000h'

async function requireAdminActionContext() {
  const { user } = await requireUser()
  requireAdminUser(user)

  return {
    adminUser: user,
    admin: createAdminClient(),
  }
}

function getTargetUserId(formData: FormData): string {
  const userId = formData.get('userId')

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Missing target user.')
  }

  return userId
}

async function requireMutableTarget(userId: string, adminUserId: string) {
  if (userId === adminUserId) {
    throw new Error('Admins cannot modify their own account.')
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'User profile was not found.')
  }

  if (isAdminUser(data)) {
    throw new Error('Configured admin accounts cannot be modified here.')
  }

  return data
}

export async function suspendUserAction(formData: FormData) {
  const { adminUser, admin } = await requireAdminActionContext()
  const userId = getTargetUserId(formData)
  await requireMutableTarget(userId, adminUser.id)

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      account_status: 'suspended',
      suspended_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: LONG_BAN_DURATION,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  revalidatePath('/admin')
}

export async function restoreUserAction(formData: FormData) {
  const { adminUser, admin } = await requireAdminActionContext()
  const userId = getTargetUserId(formData)
  await requireMutableTarget(userId, adminUser.id)

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (authError) {
    throw new Error(authError.message)
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      account_status: 'active',
      suspended_at: null,
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  revalidatePath('/admin')
}

export async function deleteUserAction(formData: FormData) {
  const { adminUser, admin } = await requireAdminActionContext()
  const userId = getTargetUserId(formData)
  await requireMutableTarget(userId, adminUser.id)

  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin')
}
