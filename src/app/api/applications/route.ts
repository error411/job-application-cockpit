import { NextResponse } from 'next/server'
import { upsertApplicationForJob } from '@/lib/services/upsert-application'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = await upsertApplicationForJob({
      jobId: body.jobId,
      status: body.status,
      notes: body.notes,
    })

    return NextResponse.json({ item: data })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}