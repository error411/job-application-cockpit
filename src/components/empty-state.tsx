import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {ctaLabel && ctaHref ? (
        <div className="mt-5">
          <Button asChild variant="brand">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}