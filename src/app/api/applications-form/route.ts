import { NextResponse } from 'next/server'
import { upsertApplicationForJob } from '@/lib/services/upsert-application'

export async function POST(req: Request) {
  const formData = await req.formData()
  const jobId = formData.get('jobId')
  const status = formData.get('status')
  const notes = formData.get('notes')
  const disposition = formData.get('disposition')
  const dispositionNotes = formData.get('dispositionNotes')
  const from = formData.get('from')

  if (!jobId || typeof jobId !== 'string') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  try {
    await upsertApplicationForJob({
      jobId,
      status: typeof status === 'string' ? status : 'ready',
      notes: typeof notes === 'string' ? notes : null,
      disposition: typeof disposition === 'string' ? disposition : null,
      dispositionNotes:
        typeof dispositionNotes === 'string' ? dispositionNotes : null,
    })
  } catch (error) {
    console.error('upsertApplicationForJob failed:', error)
  }

  const redirectPath = from === 'apply' ? '/apply' : `/jobs/${jobId}`

  return NextResponse.redirect(new URL(redirectPath, req.url))
}