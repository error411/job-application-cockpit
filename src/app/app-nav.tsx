'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  areAllOnboardingStepsComplete,
  subscribeToOnboardingProgress,
} from '@/lib/onboarding/progress'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/today', label: 'Today' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/follow-ups', label: 'Follow Ups' },
  { href: '/reports', label: 'Reports' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/profile', label: 'Profile' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/jobs/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav({
  showOnboarding = false,
  hasActiveFollowUps = false,
  showAdmin = false,
}: {
  showOnboarding?: boolean
  hasActiveFollowUps?: boolean
  showAdmin?: boolean
}) {
  const pathname = usePathname()
  const shouldShowOnboarding = useCallback(
    () => showOnboarding || !areAllOnboardingStepsComplete(),
    [showOnboarding]
  )
  const [shouldIncludeOnboarding, setShouldIncludeOnboarding] =
    useState(showOnboarding)

  useEffect(() => {
    const updateOnboardingVisibility = () => {
      setShouldIncludeOnboarding(shouldShowOnboarding())
    }

    updateOnboardingVisibility()
    return subscribeToOnboardingProgress(updateOnboardingVisibility)
  }, [shouldShowOnboarding])

  const navItems = shouldIncludeOnboarding
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href !== '/onboarding')

  const visibleNavItems = showAdmin
    ? [...navItems, { href: '/admin', label: 'Admin' }]
    : navItems

  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
      {visibleNavItems.map((item) => {
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item.label}
            {item.href === '/follow-ups' && hasActiveFollowUps ? (
              <span
                aria-hidden="true"
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  active ? 'bg-blue-600' : 'bg-amber-500'
                )}
              />
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
