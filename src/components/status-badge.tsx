import { cn } from '@/lib/utils'

export type ApplicationStatus =
  | 'ready'
  | 'applied'
  | 'interviewing'
  | 'closed'
  | 'archived'
  | 'follow_up_due'

const statusClassMap: Record<ApplicationStatus, string> = {
  ready: 'bg-blue-50/80 text-blue-700 ring-blue-200/70',
  applied: 'bg-sky-50/80 text-sky-700 ring-sky-200/70',
  interviewing: 'bg-emerald-50/80 text-emerald-700 ring-emerald-200/70',
  closed: 'bg-zinc-100/80 text-zinc-700 ring-zinc-200/80',
  archived: 'bg-zinc-100/80 text-zinc-600 ring-zinc-200/80',
  follow_up_due: 'bg-amber-50/80 text-amber-700 ring-amber-200/70',
}

function formatStatusLabel(status: string) {
  return status.replaceAll('_', ' ')
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus | string | null | undefined
  className?: string
}) {
  const normalized = (status ?? 'archived') as ApplicationStatus
  const classes = statusClassMap[normalized] ?? statusClassMap.archived

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset',
        classes,
        className
      )}
    >
      {formatStatusLabel(normalized)}
    </span>
  )
}