import { cn } from '@/lib/utils'

export type ApplicationDisposition =
  | 'landed_interview'
  | 'rejected'
  | 'offer'
  | 'withdrawn'
  | 'ghosted'
  | 'accepted'

const dispositionClassMap: Record<ApplicationDisposition, string> = {
  landed_interview: 'bg-blue-50/80 text-blue-700 ring-blue-200/70',
  rejected: 'bg-red-50/80 text-red-700 ring-red-200/70',
  offer: 'bg-amber-50/80 text-amber-700 ring-amber-200/70',
  withdrawn: 'bg-zinc-100/80 text-zinc-700 ring-zinc-200/80',
  ghosted: 'bg-zinc-100/80 text-zinc-600 ring-zinc-200/80',
  accepted: 'bg-emerald-50/80 text-emerald-700 ring-emerald-200/70',
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
    dispositionClassMap[normalized] ??
    'bg-zinc-100/80 text-zinc-700 ring-zinc-200/80'

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