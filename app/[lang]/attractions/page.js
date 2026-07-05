import { redirect } from 'next/navigation'

export default async function AttractionsRedirect({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const query = Object.entries(sp ?? {})
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  redirect(`/${lang}/sites${query ? '?' + query : ''}`)
}
