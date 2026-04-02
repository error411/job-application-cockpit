import { cn } from '@/lib/utils'

export type ApplicationStatus =
  | 'ready'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'archived'
  | 'follow_up_due'

const statusClassMap: Record<ApplicationStatus, string> = {
  ready: 'bg-blue-50 text-blue-700 ring-blue-200',
  applied: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  interviewing: 'bg-violet-50 text-violet-700 ring-violet-200',
  offer: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-slate-100 text-slate-600 ring-slate-200',
  archived: 'bg-slate-100 text-slate-600 ring-slate-200',
  follow_up_due: 'bg-amber-50 text-amber-700 ring-amber-200',
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