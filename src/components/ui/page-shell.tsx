import * as React from 'react'
import { cn } from '@/lib/utils'

export function PageShell({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className={cn(
          'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}