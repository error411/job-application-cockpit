import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/schema'

export function createClient() {
  // Browser components use the publishable Supabase key. Anything requiring a
  // service role key must stay on the server.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
