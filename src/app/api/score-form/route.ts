import { NextResponse } from 'next/server'
import { scoreJobService } from '@/lib/services/score-job'

export async function POST(req: Request) {
  const formData = await req.formData()
  const jobId = formData.get('jobId')
  const from = formData.get('from')

  if (!jobId || typeof jobId !== 'string') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  try {
    await scoreJobService(jobId)
  } catch (error) {
    console.error('scoreJobService failed:', error)
  }

  const redirectPath = from === 'apply' ? '/apply' : `/jobs/${jobId}`

  return NextResponse.redirect(new URL(redirectPath, req.url))
}