'use client'

import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type GenerateAssetsResponse = {
  asset?: unknown
  error?: string
  details?: string
}

type GenerateDraftAssetsButtonProps = {
  jobId: string
  autoStart?: boolean
  onSuccessHref?: string | null
}

export default function GenerateDraftAssetsButton({
  jobId,
  autoStart = false,
  onSuccessHref = null,
}: GenerateDraftAssetsButtonProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'success' | 'error' | null>(
    null
  )
  const hasAutoStartedRef = useRef(false)

  async function runGeneration() {
    if (isRunning || isPending) return

    setIsRunning(true)
    setMessage('Generating resume, cover letter, and recruiter note...')
    setMessageTone(null)

    try {
      const response = await fetch('/api/generate-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const payload = (await response.json().catch(() => null)) as
        | GenerateAssetsResponse
        | null

      if (!response.ok) {
        throw new Error(
          payload?.error || payload?.details || 'Failed to generate assets.'
        )
      }

      setMessage(
        onSuccessHref
          ? 'Draft assets generated. Moving to the next onboarding step...'
          : 'Draft assets generated. Refreshing job status...'
      )
      setMessageTone('success')

      startTransition(() => {
        if (onSuccessHref) {
          router.push(onSuccessHref)
          return
        }

        router.refresh()
      })
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Failed to generate assets.'

      setMessage(nextMessage)
      setMessageTone('error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleAutoStart = useEffectEvent(() => {
    void runGeneration()
  })

  useEffect(() => {
    if (!autoStart || hasAutoStartedRef.current) return

    hasAutoStartedRef.current = true
    handleAutoStart()
  }, [autoStart])

  const disabled = isRunning || isPending

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void runGeneration()}
        disabled={disabled}
        data-tour-target="onboarding-generate-assets-button"
        className={
          disabled
            ? 'app-button-primary cursor-not-allowed opacity-70'
            : 'app-button-primary'
        }
      >
        {isRunning || isPending
          ? 'Generating Draft Assets...'
          : 'Generate Draft Assets'}
      </button>

      {message ? (
        <p
          className={
            messageTone === 'error'
              ? 'text-sm text-red-600'
              : messageTone === 'success'
                ? 'text-sm text-emerald-700'
                : 'text-sm text-zinc-500'
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
