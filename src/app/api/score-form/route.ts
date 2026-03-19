import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const jobId = formData.get('jobId')
  const from = formData.get('from')

  if (!jobId || typeof jobId !== 'string') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  const response = await fetch(new URL('/api/score', req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  })

  if (!response.ok) {
    console.error('POST /api/score failed:', await response.text())
  }

  const redirectPath =
    from === 'apply' ? '/apply' : `/jobs/${jobId}`

  return NextResponse.redirect(new URL(redirectPath, req.url))
}