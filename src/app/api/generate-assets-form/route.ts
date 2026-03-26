import { NextResponse } from 'next/server'
import { generateAssetsForJob } from '@/lib/services/generate-assets'

export async function POST(req: Request) {
  const formData = await req.formData()
  const jobId = formData.get('jobId')
  const from = formData.get('from')

  if (!jobId || typeof jobId !== 'string') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  try {
    await generateAssetsForJob(jobId)
  } catch (error) {
    console.error('generateAssetsForJob failed:', error)
  }

  const redirectPath = from === 'apply' ? '/apply' : `/jobs/${jobId}`

  return NextResponse.redirect(new URL(redirectPath, req.url))
}