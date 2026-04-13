'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type OnboardingTourPopupProps = {
  stageKey: string
  stepLabel: string
  title: string
  description: string
  targetSelector?: string
  placement?: 'top' | 'bottom'
  actionHref?: string
  actionLabel?: string
}

export function OnboardingTourPopup({
  stageKey,
  stepLabel,
  title,
  description,
  targetSelector,
  placement = 'bottom',
  actionHref,
  actionLabel,
}: OnboardingTourPopupProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return (
      window.sessionStorage.getItem(
        `applyengine-tour-dismissed:${stageKey}`
      ) !== 'true'
    )
  })
  const [position, setPosition] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  useEffect(() => {
    if (!visible || !targetSelector || typeof window === 'undefined') return

    let frameId = 0

    const updatePosition = () => {
      const target = document.querySelector(targetSelector) as HTMLElement | null

      if (!target) {
        setPosition(null)
        return
      }

      const rect = target.getBoundingClientRect()
      const popupWidth = Math.min(380, window.innerWidth - 32)
      const left = Math.max(
        16,
        Math.min(rect.left + rect.width / 2 - popupWidth / 2, window.innerWidth - popupWidth - 16)
      )
      const top =
        placement === 'top'
          ? rect.top - 16
          : rect.bottom + 16

      target.setAttribute('data-tour-active', 'true')
      setPosition({
        top: Math.max(16, top),
        left,
        width: popupWidth,
      })
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updatePosition)
    }

    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, true)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate, true)

      const target = document.querySelector(targetSelector) as HTMLElement | null
      target?.removeAttribute('data-tour-active')
    }
  }, [placement, targetSelector, visible])

  function dismiss() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        `applyengine-tour-dismissed:${stageKey}`,
        'true'
      )
    }

    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed z-50 rounded-3xl border border-blue-200 bg-white p-5 shadow-2xl shadow-blue-100"
      style={
        position
          ? {
              top: position.top,
              left: position.left,
              width: position.width,
            }
          : {
              bottom: 24,
              right: 24,
              width: 'min(380px, calc(100vw - 32px))',
            }
      }
    >
      {targetSelector && position ? (
        <div
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-blue-200 bg-white"
          style={
            placement === 'top'
              ? { bottom: -7, borderBottomWidth: 1, borderRightWidth: 1 }
              : { top: -7, borderTopWidth: 1, borderLeftWidth: 1 }
          }
        />
      ) : null}

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
        {stepLabel}
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {actionHref && actionLabel ? (
          <Button asChild variant="brand" size="sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}

        <Button type="button" variant="secondary" size="sm" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
