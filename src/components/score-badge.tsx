import { cn } from '@/lib/utils'

function getScoreClasses(score: number | null | undefined) {
  if (score == null) return 'bg-slate-100 text-slate-600 ring-slate-200'
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (score >= 60) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-rose-50 text-rose-700 ring-rose-200'
}

export function ScoreBadge({
  score,
  className,
}: {
  score: number | null | undefined
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        getScoreClasses(score),
        className
      )}
    >
      {score == null ? 'Unscored' : `Score ${score}`}
    </span>
  )
}