export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ApplyModeClient from './apply-mode-client'
import ProcessAutomationButton from './process-automation-button'
import { getApplyItems } from '@/lib/apply-mode/get-apply-items'
import type { ApplyItem } from '@/lib/apply-mode/types'

export default async function ApplyPage() {
  const supabase = await createClient()

  let items: ApplyItem[] = []

  try {
    items = await getApplyItems(supabase)
  } catch (error) {
    console.error('Error loading apply page:', error)
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Workflow
          </p>
          <h1>Apply Mode</h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Work the queue from highest priority to lowest. Ready roles,
            follow-ups, and active interview items are all shown in one place.
          </p>
        </div>

        <ProcessAutomationButton />
      </section>

      <ApplyModeClient items={items} />
    </main>
  )
}