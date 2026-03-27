import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()

  const from = formData.get('from')
  const limit = formData.get('limit')

  const redirectPath =
    typeof from === 'string' && from.length > 0 ? from : '/follow-ups'

  const requestLimit =
    typeof limit === 'string' && limit.length > 0 ? limit : '5'

  const automationKey = process.env.AUTOMATION_RUN_KEY

  if (!automationKey) {
    console.error('AUTOMATION_RUN_KEY is not set')
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  try {
    const runUrl = new URL('/api/automation/run', req.url)

    const response = await fetch(runUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-automation-key': automationKey,
      },
      body: JSON.stringify({
        limit: Number(requestLimit),
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('automation run failed:', text)
    }
  } catch (error) {
    console.error('automation run failed:', error)
  }

  return NextResponse.redirect(new URL(redirectPath, req.url))
}