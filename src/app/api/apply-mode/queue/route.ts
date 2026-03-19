import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { getApplyItems } from '../../../../lib/apply-mode/get-apply-items'

// Removed default client page export from API route; this file defines API handlers only.

type ApplicationRow = {
  id: string
  job_id: string
  status: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  notes: string | null
  jobs:
    | {
        id: string
        company: string
        title: string
        location: string | null
      }
    | {
        id: string
        company: string
        title: string
        location: string | null
      }[]
    | null
}

type ApplyItem = {
  id: string
  job_id: string
  status: string
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  notes: string | null
  company: string
  title: string
  location: string | null
  priority_score: number
  has_resume: boolean
  has_cover_letter: boolean
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        follow_up_1_due,
        follow_up_2_due,
        notes,
        jobs (
          id,
          company,
          title,
          location
        )
      `)
      .in('status', ['ready', 'applied', 'interviewing'])

    if (error) {
      console.error('Error loading apply queue:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items: ApplyItem[] = ((data ?? []) as ApplicationRow[]).map(
      (row: ApplicationRow) => {
        const job = Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs

        return {
          id: row.id,
          job_id: row.job_id,
          status: row.status ?? 'ready',
          follow_up_1_due: row.follow_up_1_due ?? null,
          follow_up_2_due: row.follow_up_2_due ?? null,
          notes: row.notes ?? null,
          company: job?.company ?? 'Unknown company',
          title: job?.title ?? 'Untitled role',
          location: job?.location ?? null,
          priority_score: 0,
          has_resume: false,
          has_cover_letter: false,
        }
      }
    )

    return NextResponse.json({ items })
  } catch (error) {
    console.error('GET /api/apply-mode/queue error:', error)
    return NextResponse.json(
      { error: 'Failed to load apply queue.' },
      { status: 500 }
    )
  }
}