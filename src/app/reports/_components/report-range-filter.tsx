'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReportRange } from '@/lib/reports/get-report-summary'

const OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
]

export function ReportRangeFilter({ currentRange }: { currentRange: ReportRange }) {
  const searchParams = useSearchParams()

  return (
    <div className="inline-flex rounded-2xl border border-white/60 bg-white/80 p-1 shadow-sm backdrop-blur">
      {OPTIONS.map((option) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', option.value)

        const isActive = option.value === currentRange

        return (
          <Link
            key={option.value}
            href={`/reports?${params.toString()}`}
            className={[
              'rounded-xl px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
            ].join(' ')}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}