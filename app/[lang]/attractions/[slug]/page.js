import { redirect } from 'next/navigation'

export default async function AttractionRedirect({ params }) {
  const { lang, slug } = await params
  redirect(`/${lang}/sites/${slug}`)
}
