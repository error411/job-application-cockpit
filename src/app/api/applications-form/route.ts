import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const jobId = formData.get('jobId')
  const status = formData.get('status')
  const notes = formData.get('notes')
  const from = formData.get('from')

  if (!jobId || typeof jobId !== 'string') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  const response = await fetch(new URL('/api/applications', req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobId,
      status: typeof status === 'string' ? status : 'ready',
      notes: typeof notes === 'string' ? notes : null,
    }),
  })

  if (!response.ok) {
    console.error('POST /api/applications failed:', await response.text())
  }

  const redirectPath =
    from === 'apply' ? '/apply' : `/jobs/${jobId}`

  return NextResponse.redirect(new URL(redirectPath, req.url))
}