'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function BillingPortalButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleOpenPortal() {
    setIsLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnPath: '/account?billing=portal',
        }),
      })

      const result = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null

      if (!res.ok || !result?.url) {
        setMessage(result?.error || 'Unable to open billing portal.')
        setIsLoading(false)
        return
      }

      window.location.assign(result.url)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to open billing portal.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        onClick={() => void handleOpenPortal()}
        disabled={isLoading}
      >
        {isLoading ? 'Opening portal...' : 'Manage Billing'}
      </Button>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </div>
  )
}
