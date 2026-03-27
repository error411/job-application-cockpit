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
          <header className="app-surface mb-8 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white shadow-sm">
                  JC
                </div>

                <div>
                  <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight text-zinc-950 hover:opacity-80"
                  >
                    Job Application Cockpit
                  </Link>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Pipeline-driven job search execution
                  </p>
                </div>
              </div>

              <AppNav />
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}