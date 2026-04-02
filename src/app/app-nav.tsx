'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/today', label: 'Today' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/follow-ups', label: 'Follow Ups' },
  { href: '/profile', label: 'Profile' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/jobs/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}