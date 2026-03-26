import { NextRequest, NextResponse } from 'next/server'
import { runAutomationWorker } from '@/lib/automation/worker'

function getRequestKey(req: NextRequest) {
  const headerKey = req.headers.get('x-automation-key')
  const queryKey = req.nextUrl.searchParams.get('key')

  return headerKey ?? queryKey
}

function isAuthorized(req: NextRequest) {
  const requestKey = getRequestKey(req)
  const expectedKey = process.env.AUTOMATION_RUN_KEY

  if (!expectedKey) {
    console.error('AUTOMATION_RUN_KEY is not set')
    return false
  }

  return requestKey === expectedKey
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

async function handleRun(req: NextRequest, bodyLimit?: unknown) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const queryLimit = req.nextUrl.searchParams.get('limit')
  const limit = clampLimit(bodyLimit ?? queryLimit ?? 5, 5)

  try {
    const startedAt = Date.now()
    const result = await runAutomationWorker({ limit })
    const durationMs = Date.now() - startedAt

    return NextResponse.json({
      ok: true,
      limit,
      durationMs,
      ...result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Automation run failed'

    console.error('automation run failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  return handleRun(req)
}

export async function POST(req: NextRequest) {
  let body: { limit?: number } | null = null

  try {
    body = (await req.json()) as { limit?: number }
  } catch {
    body = null
  }

  return handleRun(req, body?.limit)
}