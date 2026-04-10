import { cn } from '@/lib/utils'

function getScoreClasses(score: number | null | undefined) {
  if (score == null) return 'bg-zinc-100/80 text-zinc-600 ring-zinc-200/80'
  if (score >= 80) return 'bg-emerald-50/80 text-emerald-700 ring-emerald-200/70'
  if (score >= 60) return 'bg-amber-50/80 text-amber-700 ring-amber-200/70'
  return 'bg-red-50/80 text-red-700 ring-red-200/70'
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