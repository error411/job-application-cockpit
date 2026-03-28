import { NextResponse } from 'next/server'
import { getSiteAuthCookieName } from '@/lib/site-auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: getSiteAuthCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}