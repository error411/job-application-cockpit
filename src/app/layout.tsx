import './globals.css'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/today', label: 'Today' },
  { href: '/apply', label: 'Apply Hub' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/jobs/new', label: 'Add Job' },
  { href: '/applications', label: 'Applications' },
  { href: '/follow-ups', label: 'Follow-Ups' },
  { href: '/profile', label: 'Profile' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 border-b border-zinc-200 pb-4">
            <div className="flex flex-col gap-4">
              <div>
                <Link
                  href="/"
                  className="text-xl font-semibold tracking-tight hover:opacity-80"
                >
                  Job Application Cockpit
                </Link>
              </div>

              <nav
                aria-label="Primary"
                className="flex flex-wrap gap-2"
              >
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}