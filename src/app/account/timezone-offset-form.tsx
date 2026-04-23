'use client'

import { useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

type TimezoneOffsetFormProps = {
  initialOffsetMinutes: number | null
}

type SaveState = 'idle' | 'saved' | 'error'

const MIN_OFFSET_MINUTES = -12 * 60
const MAX_OFFSET_MINUTES = 14 * 60
const OFFSET_STEP_MINUTES = 15

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60

  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getDeviceOffsetMinutes(): number {
  return -new Date().getTimezoneOffset()
}

function buildOffsetOptions() {
  const options: number[] = []

  for (
    let offset = MIN_OFFSET_MINUTES;
    offset <= MAX_OFFSET_MINUTES;
    offset += OFFSET_STEP_MINUTES
  ) {
    options.push(offset)
  }

  return options
}

export function TimezoneOffsetForm({
  initialOffsetMinutes,
}: TimezoneOffsetFormProps) {
  const fallbackOffsetMinutes = initialOffsetMinutes ?? 0
  const [offsetMinutes, setOffsetMinutes] = useState(fallbackOffsetMinutes)
  const [deviceOffsetMinutes, setDeviceOffsetMinutes] = useState<number | null>(
    null
  )
  const [message, setMessage] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isPending, startTransition] = useTransition()
  const offsetOptions = useMemo(() => buildOffsetOptions(), [])

  function useDeviceOffset() {
    const detectedOffsetMinutes = getDeviceOffsetMinutes()
    setDeviceOffsetMinutes(detectedOffsetMinutes)
    setOffsetMinutes(detectedOffsetMinutes)
    setSaveState('idle')
    setMessage('')
  }

  function saveOffset() {
    setSaveState('idle')
    setMessage('')

    startTransition(async () => {
      const response = await fetch('/api/account/timezone-offset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone_offset_minutes: offsetMinutes }),
      })
      const result = await response.json()

      if (!response.ok) {
        setSaveState('error')
        setMessage(result?.error ?? 'Failed to save timezone offset.')
        return
      }

      setSaveState('saved')
      setMessage('Saved.')
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            UTC Offset
          </span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={offsetMinutes}
            onChange={(event) => {
              setOffsetMinutes(Number(event.target.value))
              setSaveState('idle')
              setMessage('')
            }}
          >
            {offsetOptions.map((offset) => (
              <option key={offset} value={offset}>
                {formatOffset(offset)}
              </option>
            ))}
          </select>
        </label>

        <Button type="button" variant="secondary" onClick={useDeviceOffset}>
          Use this device
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          Current device:{' '}
          <span className="font-medium text-zinc-950">
            {deviceOffsetMinutes == null
              ? 'Not detected yet'
              : formatOffset(deviceOffsetMinutes)}
          </span>
        </p>

        <Button type="button" onClick={saveOffset} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save offset'}
        </Button>
      </div>

      {message ? (
        <p
          className={
            saveState === 'error'
              ? 'text-sm font-medium text-rose-700'
              : 'text-sm font-medium text-emerald-700'
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
