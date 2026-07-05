import Link from 'next/link'
import { getRegionsWithCounts } from '@/lib/activites'
import { dicts, LANGS } from '@/lib/i18n'
import RegionMap from '@/components/RegionMap'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return { title: `${t.activites.nav_title} — J'aime le Québec` }
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
      {/* Carte satellite du Québec en entier */}
      <div className="relative">
        <RegionMap lat={52.5} lng={-72.0} zoom={5} height="300px" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 max-w-6xl mx-auto">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
            {t.activites.nav_title}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {t.activites.pick_region}
          </h1>
          <p className="text-blue-100 text-lg drop-shadow">{t.activites.pick_region_sub}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Explorer tout le Québec (sans choisir de région) */}
        <Link
          href={`/${lang}/activites/tout`}
          className="group flex items-center gap-4 bg-gradient-to-r from-purple-600 to-quebec-blue text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 p-5 mb-8"
        >
          <span className="text-3xl shrink-0">🔍</span>
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
    </>
  )
}
