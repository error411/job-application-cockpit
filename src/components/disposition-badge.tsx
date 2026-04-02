import { cn } from '@/lib/utils'

export type ApplicationDisposition =
  | 'landed_interview'
  | 'rejected'
  | 'offer'
  | 'withdrawn'
  | 'ghosted'
  | 'accepted'

const dispositionClassMap: Record<ApplicationDisposition, string> = {
  landed_interview: 'bg-violet-50 text-violet-700 ring-violet-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  offer: 'bg-amber-50 text-amber-700 ring-amber-200',
  withdrawn: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  ghosted: 'bg-slate-100 text-slate-600 ring-slate-200',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

function formatDispositionLabel(disposition: string) {
  return disposition.replaceAll('_', ' ')
}

export function DispositionBadge({
  disposition,
  className,
}: {
  disposition: ApplicationDisposition | string | null | undefined
  className?: string
}) {
  if (!disposition) return null

  const normalized = disposition as ApplicationDisposition
  const classes =
    dispositionClassMap[normalized] ?? 'bg-zinc-100 text-zinc-700 ring-zinc-200'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset',
        classes,
        className
      )}
    >
      {formatDispositionLabel(normalized)}
    </span>
  )
}