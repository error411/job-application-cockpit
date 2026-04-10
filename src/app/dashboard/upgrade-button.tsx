'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type UpgradeButtonProps = {
  billingInterval?: 'month' | 'year'
}

export default function UpgradeButton({
  billingInterval = 'month',
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpgrade() {
    setIsLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingInterval,
          successPath: '/dashboard?billing=success',
          cancelPath: '/dashboard?billing=cancelled',
        }),
      })

      const result = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null

      if (!res.ok || !result?.url) {
        setMessage(result?.error || 'Unable to start Stripe checkout.')
        setIsLoading(false)
        return
      }

      window.location.assign(result.url)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start Stripe checkout.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="brand"
        onClick={() => void handleUpgrade()}
        disabled={isLoading}
      >
        {isLoading ? 'Opening checkout...' : 'Start Pro Checkout'}
      </Button>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </div>
  )
}
