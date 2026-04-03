import Image from 'next/image'
import Link from 'next/link'
import { AppNav } from '@/app/app-nav'
import { LogoutButton } from '@/components/auth/logout-button'
import { createClient } from '@/lib/supabase/server'

type AppHeaderProps = {
  showAddJobCta?: boolean
}

export async function AppHeader({
  showAddJobCta = false,
}: AppHeaderProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = Boolean(user)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href={isLoggedIn ? '/today' : '/login'}
            className="flex items-center gap-3"
          >
            <Image
              src="/applyengine-mark.png"
              alt="ApplyEngine"
              width={44}
              height={44}
              className="h-11 w-11"
              priority
            />

            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-950">
                ApplyEngine
              </div>
              <div className="text-xs text-slate-500">
                Run your job search like a system.
              </div>
            </div>
          </Link>

          {isLoggedIn ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <AppNav />

              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-500 xl:inline">
                  {user?.email}
                </span>

                {showAddJobCta ? (
                  <Link
                    href="/jobs/new"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-500"
                  >
                    Add Job
                  </Link>
                ) : null}

                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}