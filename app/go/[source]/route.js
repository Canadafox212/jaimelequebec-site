import { NextResponse } from 'next/server'

const VALID_SOURCE = /^[a-z0-9-]{1,60}$/

export async function GET(request, { params }) {
  const { source } = await params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'fr'

  if (!VALID_SOURCE.test(source ?? '')) {
    return NextResponse.redirect(new URL(`/${lang}`, request.url), { status: 302 })
  }

  // share-[slug] → redirige vers la fiche avec UTM partage
  if (source.startsWith('share-')) {
    const slug = source.slice(6)
    const target = new URL(`/${lang}/sites/${slug}`, request.url)
    target.searchParams.set('utm_source', 'share')
    target.searchParams.set('utm_campaign', source)
    return NextResponse.redirect(target, { status: 302 })
  }

  // Redirection générique vers l'accueil
  const target = new URL(`/${lang}`, request.url)
  target.searchParams.set('utm_source', 'go')
  target.searchParams.set('utm_campaign', source)
  return NextResponse.redirect(target, { status: 302 })
}
