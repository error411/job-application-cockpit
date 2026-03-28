import { NextResponse } from 'next/server'
import {
  createSiteAuthCookieValue,
  getSiteAuthCookieName,
  getSiteAuthMaxAge,
  isCorrectSitePassword,
} from '@/lib/site-auth'

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/')

  if (!isCorrectSitePassword(password)) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
  }

  const cookieValue = await createSiteAuthCookieValue()

  const response = NextResponse.json({ ok: true, redirectTo: next })

  response.cookies.set({
    name: getSiteAuthCookieName(),
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: getSiteAuthMaxAge(),
  })

  return response
}