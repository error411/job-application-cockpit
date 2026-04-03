import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'

export async function HeaderAuthActions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Log in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-500 xl:inline">
        {user.email}
      </span>
      <LogoutButton />
      <Link
        href="/jobs/new"
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-500"
      >
        Add Job
      </Link>
    </div>
  )
}