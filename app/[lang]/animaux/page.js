import animaux from '@/data/animaux.json'
import { getDictionary, LANGS, getAlternates } from '@/lib/i18n'
import AnimauxClient from '@/components/AnimauxClient'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const t = dict.animaux ?? getDictionary('fr').animaux
  return {
    title: t.meta_title,
    description: t.meta_desc,
    alternates: getAlternates('/animaux'),
  }
}

export default async function AnimauxPage({ params }) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const t = dict.animaux ?? getDictionary('fr').animaux

  return <AnimauxClient animaux={animaux} t={t} lang={lang} />
}
