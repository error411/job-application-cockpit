import './globals.css'
import Link from 'next/link'
import { AppNav } from './app-nav'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="mx-auto mb-8 w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="app-surface border border-zinc-200/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white shadow-sm">
                    JC
                  </div>

                  <div>
                    <Link
                      href="/"
                      className="text-lg font-semibold tracking-tight text-zinc-950 transition hover:opacity-80"
                    >
                      Job Application Cockpit
                    </Link>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Pipeline-driven job search execution
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                  <AppNav />

                  <Link
                    href="/jobs/new"
                    className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    Add Job
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}