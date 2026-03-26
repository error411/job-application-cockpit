'use server'

import { runAutomationWorker } from '@/lib/automation/worker'

type RunAutomationActionResult = {
  ok: boolean
  processed?: number
  completed?: number
  failed?: number
  skipped?: number
  durationMs?: number
  error?: string
}

function clampLimit(value: unknown, fallback = 5) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : fallback

  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, 10)
}

export async function runAutomationAction(
  input?: { limit?: number },
): Promise<RunAutomationActionResult> {
  try {
    const limit = clampLimit(input?.limit, 5)
    const startedAt = Date.now()
    const result = await runAutomationWorker({ limit })
    const durationMs = Date.now() - startedAt

    return {
      ok: true,
      durationMs,
      ...result,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Automation run failed'

    console.error('runAutomationAction failed', error)

    return {
      ok: false,
      error: message,
    }
  }
}