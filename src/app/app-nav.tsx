'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/today', label: 'Today' },
  { href: '/apply', label: 'Apply Hub' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/applications', label: 'Applications' },
  { href: '/follow-ups', label: 'Follow-Ups' },
  { label: 'Profile', href: '/profile' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'

  // Jobs should stay active for all nested routes
  if (href === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/jobs/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? 'nav-pill nav-pill-active' : 'nav-pill'}
          >
            {item.label}
          </Link>
          
        )
      })}
    </nav>
  )
}