'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/today', label: 'Today' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/jobs/new', label: 'Add Job' },
  { href: '/apply', label: 'Apply' },
  { href: '/profile', label: 'Profile' },
]

function ApplyEngineMark() {
  return (
    <div className="relative h-9 w-9 shrink-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400" />
      <div className="absolute inset-[4px] rounded-full bg-white" />
      <div className="absolute left-[6px] top-[7px] h-[23px] w-[23px] rounded-full border-[6px] border-blue-600 border-r-cyan-400 border-b-cyan-400" />
      <div className="absolute left-[14px] top-[12px] h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-cyan-400 border-t-transparent" />
    </div>
  )
}

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/today" className="flex items-center gap-3">
          <ApplyEngineMark />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-slate-950">
              ApplyEngine
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/jobs/new' &&
                item.href !== '/today' &&
                pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="brand" size="sm">
            <Link href="/jobs/new">Add Job</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}