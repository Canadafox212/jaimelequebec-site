import { NextResponse } from 'next/server'

const LOCALES = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']
const DEFAULT_LOCALE = 'fr'

export function middleware(request) {
  const { pathname } = request.nextUrl

  const hasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!hasLocale) {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|maps|admin).*)'],
}
