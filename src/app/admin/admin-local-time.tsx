'use client'

import { useEffect, useMemo, useState } from 'react'

type AdminLocalTimeProps = {
  value: string | null | undefined
}

const formatterOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
}

function formatLocalDateTime(value: string | null | undefined): string {
  if (!value) return 'Never'

  return new Intl.DateTimeFormat('en', formatterOptions).format(new Date(value))
}

export function AdminLocalTime({ value }: AdminLocalTimeProps) {
  const fallback = useMemo(() => formatLocalDateTime(value), [value])
  const [formattedValue, setFormattedValue] = useState(fallback)

  useEffect(() => {
    setFormattedValue(formatLocalDateTime(value))
  }, [value])

  return (
    <time dateTime={value ?? undefined} suppressHydrationWarning>
      {formattedValue}
    </time>
  )
}
