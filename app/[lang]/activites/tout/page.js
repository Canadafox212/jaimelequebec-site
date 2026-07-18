import Link from 'next/link'
import { getEtablissementsIndex } from '@/lib/activites'
import EtabExplorer from '@/components/EtabExplorer'
import { dicts, LANGS } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return {
    title: `${t.activites.tout_title} — J'aime le Québec`,
  }
}

export default async function ActivitesTout({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const t = dicts[lang]
  const items = getEtablissementsIndex()
  const initialTheme = sp?.theme ?? ''

  return (
    <>
      <div className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href={`/${lang}/activites`} className="inline-block text-sm text-blue-200 hover:text-white transition-colors mb-3">
            {t.activites.back_regions}
          </Link>
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
            {t.activites.tout_title}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-1">
            {t.activites.tout_subtitle}
          </h1>
          <p className="text-blue-200 text-lg">
            {t.activites.explore_all_sub}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <EtabExplorer items={items} lang={lang} t={t} showRegion showTheme initialTheme={initialTheme} />
      </div>
    </>
  )
}
