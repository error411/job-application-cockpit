'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { runAutomationAction } from './actions'

type AutomationResponse = {
  ok: boolean
  processed?: number
  completed?: number
  failed?: number
  skipped?: number
  durationMs?: number
  error?: string
}

export default function ProcessAutomationButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<AutomationResponse | null>(null)

  async function handleRun() {
    setIsRunning(true)
    setResult(null)

    try {
      const data = await runAutomationAction({ limit: 5 })
      setResult(data)

      if (!data.ok) {
        throw new Error(data.error ?? 'Automation failed')
      }

      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Automation failed'

      setResult({
        ok: false,
        error: message,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const disabled = isRunning || isPending

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Automation
          </h2>
          <p className="text-sm text-neutral-600">
            Score queued jobs, generate assets, and advance pending work.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning || isPending ? 'Processing…' : 'Process Automation'}
        </button>
      </div>

      {result ? (
        result.ok ? (
          <p className="mt-3 text-sm text-neutral-700">
            Processed {result.processed ?? 0} · Completed {result.completed ?? 0}
            {' '}· Failed {result.failed ?? 0} · Skipped {result.skipped ?? 0}
          </p>
        ) : (
          <p className="mt-3 text-sm text-red-600">
            {result.error ?? 'Automation failed'}
          </p>
        )
      ) : null}
    </div>
  )
}