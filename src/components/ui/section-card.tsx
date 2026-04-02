import * as React from 'react'
import { cn } from '@/lib/utils'

export function SectionCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {children}
    </section>
  )
}

export function SectionCardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function SectionCardBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}