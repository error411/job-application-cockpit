'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type BillingIntent = 'trial' | 'month' | 'year'

type PlanOption = {
  label: string
  priceLabel: string
  detail: string
  cta: string
  billingInterval: 'month' | 'year'
  trialDays?: number
}

type UpgradeButtonProps = {
  plans?: Partial<Record<BillingIntent, PlanOption>>
  autoStartIntent?: BillingIntent | null
}

const DEFAULT_PLAN_COPY: Record<BillingIntent, PlanOption> = {
  trial: {
    label: 'Free Trial',
    priceLabel: '7 days free',
    detail: 'Start with a 7-day trial, then continue on the monthly plan.',
    cta: 'Start Free Trial',
    billingInterval: 'month',
    trialDays: 7,
  },
  month: {
    label: 'Monthly',
    priceLabel: '$19.99/month',
    detail: 'Flexible access to ApplyEngine Pro billed monthly.',
    cta: 'Choose Monthly',
    billingInterval: 'month',
  },
  year: {
    label: 'Yearly',
    priceLabel: '$99/year',
    detail: 'Best value for long-term use with yearly billing.',
    cta: 'Choose Yearly',
    billingInterval: 'year',
  },
}

export default function UpgradeButton({
  plans,
  autoStartIntent = null,
}: UpgradeButtonProps) {
  const resolvedPlans = useMemo(
    () =>
      ({
        ...DEFAULT_PLAN_COPY,
        ...(plans ?? {}),
      }) as Record<BillingIntent, PlanOption>,
    [plans]
  )
  const availableIntents = Object.keys(plans ?? DEFAULT_PLAN_COPY) as BillingIntent[]
  const [loadingIntent, setLoadingIntent] = useState<BillingIntent | null>(
    null
  )
  const [message, setMessage] = useState('')
  const autoStartedRef = useRef(false)

  const handleUpgrade = useCallback(async (intent: BillingIntent) => {
    const plan = resolvedPlans[intent]

    setLoadingIntent(intent)
    setMessage('')

    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingInterval: plan.billingInterval,
          trialDays: plan.trialDays,
          successPath: '/account?billing=success',
          cancelPath: '/account?billing=cancelled',
        }),
      })

      const result = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null

      if (!res.ok || !result?.url) {
        setMessage(result?.error || 'Unable to start Stripe checkout.')
        setLoadingIntent(null)
        return
      }

      window.location.assign(result.url)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start Stripe checkout.'
      )
      setLoadingIntent(null)
    }
  }, [resolvedPlans])

  useEffect(() => {
    if (!autoStartIntent || autoStartedRef.current) return
    if (!availableIntents.includes(autoStartIntent)) return

    autoStartedRef.current = true
    const frame = window.requestAnimationFrame(() => {
      void handleUpgrade(autoStartIntent)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [autoStartIntent, availableIntents, handleUpgrade])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {availableIntents.map((intent, index) => {
          const plan = resolvedPlans[intent]
          const isLoading = loadingIntent === intent

          return (
            <div
              key={intent}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-zinc-950">{plan.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                {plan.priceLabel}
              </p>
              <p className="mt-1 text-sm text-zinc-600">{plan.detail}</p>

              <div className="mt-4">
                <Button
                  type="button"
                  variant={index === 0 ? 'brand' : 'secondary'}
                  onClick={() => void handleUpgrade(intent)}
                  disabled={loadingIntent !== null}
                >
                  {isLoading ? 'Opening checkout...' : plan.cta}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </div>
  )
}
