import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/schema'

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  // The admin client uses the service role key and bypasses normal user RLS, so
  // it should only be imported by trusted server-side code.
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  const looksLikeJwt = serviceRoleKey.startsWith('eyJ')
  const looksLikeSecret = serviceRoleKey.startsWith('sb_secret_')

  // This guard catches common setup mistakes before Supabase returns a less
  // obvious authentication error.
  if (!looksLikeJwt && !looksLikeSecret) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY does not look like a valid Supabase service_role or secret key'
    )
  }

  adminClient = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminClient
}
