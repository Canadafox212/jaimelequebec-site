import Link from 'next/link'
import { getRegionsWithCounts } from '@/lib/activites'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
import { gygUrl } from '@/lib/affiliates'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return {
    title: `${t.activites.nav_title} — J'aime le Québec`,
    description: t.activites.pick_region_sub,
    alternates: getAlternates('/activites'),
  }
}

export default async function ActivitesIndex({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  const regions = getRegionsWithCounts()
    .slice()
    .sort((a, b) => {
      const na = (a[`nom_${lang}`] ?? a.nom_fr ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      const nb = (b[`nom_${lang}`] ?? b.nom_fr ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      return na.localeCompare(nb, 'fr')
    })

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
            {t.activites.nav_title}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            {t.activites.pick_region}
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-2xl">
            {t.activites.intro_text}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Explorer tout le Québec (sans choisir de région) */}
        <Link
          href={`/${lang}/activites/tout`}
          className="group flex items-center gap-4 bg-gradient-to-r from-purple-600 to-quebec-blue text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 p-5 mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">
              {t.activites.explore_all_qc}
            </p>
            <p className="text-blue-100 text-sm">
              {t.activites.explore_all_sub}
            </p>
          </div>
          <span className="text-2xl shrink-0 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {t.activites.or_choose_region}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((r) => (
            <Link
              key={r.num}
              href={`/${lang}/activites/${r.num}`}
              className="group flex items-center justify-between gap-3 bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5"
            >
              <span className="font-display text-lg font-bold text-gray-900 group-hover:text-quebec-blue transition-colors">
                {r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr}
              </span>
              <span className="shrink-0 text-xs font-bold text-quebec-blue bg-blue-50 rounded-full px-3 py-1">
                {r.total}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bandeau GetYourGuide ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-12 px-4 mt-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-2">
            {lang === 'fr' ? 'Pour aller plus loin' : 'Go further'}
          </p>
          <h2 className="text-2xl font-bold mb-3">
            {lang === 'fr' ? 'Activités & Excursions au Québec' : 'Activities & Excursions in Québec'}
          </h2>
          <p className="text-orange-100 mb-6">
            {lang === 'fr'
              ? 'Des centaines d\'activités et excursions à réserver en ligne — nature, culture, aventure.'
              : 'Hundreds of activities and excursions to book online — nature, culture, adventure.'}
          </p>
          <a href={gygUrl('province-de-quebec-l561', lang)} target="_blank" rel="noopener noreferrer sponsored"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg text-sm">
            {lang === 'fr' ? 'Découvrir toutes les activités →' : 'Browse all activities →'}
          </a>
        </div>
      </div>
    </>
  )
}
