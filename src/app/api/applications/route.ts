import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  ApplicationInsert,
  ApplicationRow,
  ApplicationUpdate,
} from '@/lib/supabase/types'

type RequestBody = {
  jobId?: string
  status?: string
  notes?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody
    const { jobId, status, notes } = body

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    const typedExisting: ApplicationRow | null = existing
    const now = new Date()

    const appliedAt =
      status === 'applied' && !typedExisting?.applied_at
        ? now.toISOString()
        : typedExisting?.applied_at ?? null

    const followUp1 =
      status === 'applied'
        ? new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : typedExisting?.follow_up_1_due ?? null

    const followUp2 =
      status === 'applied'
        ? new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
        : typedExisting?.follow_up_2_due ?? null

    if (typedExisting) {
      const updatePayload: ApplicationUpdate = {
        status: status || typedExisting.status,
        notes: notes ?? typedExisting.notes,
        applied_at: appliedAt,
        follow_up_1_due: followUp1,
        follow_up_2_due: followUp2,
        updated_at: now.toISOString(),
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', typedExisting.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ application: data })
    }

    const insertPayload: ApplicationInsert = {
      job_id: jobId,
      status: status || 'ready',
      notes: notes || null,
      applied_at: appliedAt,
      follow_up_1_due: followUp1,
      follow_up_2_due: followUp2,
    }

    const { data, error } = await supabase
      .from('applications')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application: data })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to save application',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}