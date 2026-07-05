import { NextResponse } from 'next/server'

const VALID_SOURCE = /^[a-z0-9-]{1,40}$/

export async function GET(request, { params }) {
  const { source } = await params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'fr'

  // Reject invalid source codes — redirect to home without tracking
  if (!VALID_SOURCE.test(source ?? '')) {
    return NextResponse.redirect(new URL(`/${lang}`, request.url), { status: 302 })
  }

  const target = new URL(`/${lang}`, request.url)
  target.searchParams.set('utm_source', 'qr')
  target.searchParams.set('utm_campaign', source)

  return NextResponse.redirect(target, { status: 302 })
}
