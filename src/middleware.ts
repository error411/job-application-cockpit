import { NextResponse, type NextRequest } from 'next/server'
import {
  getSiteAuthCookieName,
  verifySiteAuthCookieValue,
} from '@/lib/site-auth'

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/unlock' ||
    pathname.startsWith('/api/auth/unlock') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(getSiteAuthCookieName())?.value

  if (await verifySiteAuthCookieValue(cookie)) {
    return NextResponse.next()
  }

  const unlockUrl = new URL('/unlock', request.url)
  unlockUrl.searchParams.set('next', `${pathname}${search}`)

  return NextResponse.redirect(unlockUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)',
  ],
}