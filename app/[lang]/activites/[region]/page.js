import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRegion, getRegionThemeList, getRegionsWithCounts } from '@/lib/activites'
import ThemeCard from '@/components/ThemeCard'
import QuebecRegionMap from '@/components/QuebecRegionMap'
import RegionImageBanner from '@/components/RegionImageBanner'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
import animauxData from '@/data/animaux.json'

const REGION_IMAGES = {
  1:  '/images/REGIONS/montréal_.png',
  2:  '/images/REGIONS/québec.png',
  3:  '/images/REGIONS/Charlevoix.png',
  4:  '/images/REGIONS/Gaspesie.png',
  5:  '/images/REGIONS/bas st laurent.png',
  6:  '/images/REGIONS/saguenay lac st jean 2.png',
  7:  '/images/REGIONS/cote nord.png',
  8:  '/images/REGIONS/Cantons de l est.png',
  9:  '/images/REGIONS/outaouais.png',
  10: '/images/REGIONS/mauricie.png',
  11: '/images/REGIONS/lanaudiere.png',
  12: '/images/REGIONS/laurentides.png',
  13: '/images/REGIONS/Monteregie.png',
  14: '/images/REGIONS/chaudiere appalaches 2.png',
  15: '/images/REGIONS/centre du QC.png',
  16: '/images/REGIONS/Iles de la madeleine.png',
  17: '/images/REGIONS/Abitibi.png',
  18: '/images/REGIONS/Nord du Québec.png',
  19: '/images/REGIONS/laval.png',
}

export async function generateStaticParams() {
  const regions = getRegionsWithCounts()
  return LANGS.flatMap((lang) => regions.map((r) => ({ lang, region: String(r.num) })))
}

export async function generateMetadata({ params }) {
  const { lang, region } = await params
  const t = dicts[lang]
  const r = getRegion(region)
  if (!r) return {}
  const nom = r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr
  return {
    title: `${t.activites.in_region} ${nom} — J'aime le Québec`,
    alternates: getAlternates(`/activites/${region}`),
  }
}

export default async function RegionThemes({ params }) {
  const { lang, region } = await params
  const t = dicts[lang]
  const r = getRegion(region)
  if (!r) notFound()
  const nom = r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr
  const themes = getRegionThemeList(region)
  const regionImg = REGION_IMAGES[r.num] ?? null
  const nomFr = r.nom_fr
  const sitesChien = animauxData.filter(a =>
    a.chiens === 'OUI' && (a.region.includes(nomFr) || nomFr.includes(a.region))
  ).slice(0, 4)

  return (
    <>
      {/* En-tête région */}
      <div className="relative text-white overflow-hidden h-64 md:h-80 flex items-end">
        {/* Image cliquable (lightbox) ou dégradé fallback */}
        {regionImg ? (
          <>
            <RegionImageBanner src={regionImg} alt={nom} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-quebec-navy to-quebec-blue" />
        )}
        {/* Texte superposé — pointer-events-none pour laisser passer les clics vers l'image */}
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pb-8 pointer-events-none">
          <Link href={`/${lang}/activites`} className="pointer-events-auto inline-block text-sm text-blue-200 hover:text-white transition-colors mb-4">
            {t.activites.back_regions}
          </Link>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">{t.activites.in_region}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold drop-shadow-lg">{nom}</h1>
            </div>
            {r.num <= 19 && (
              <span className="pointer-events-auto">
                <QuebecRegionMap regionNum={r.num} />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map(({ theme, count, sous }) => (
            <ThemeCard key={theme.id} lang={lang} region={region} theme={theme} count={count} saison={theme.saison} sous={sous} />
          ))}
        </div>

        {/* ── JAMAIS SANS VOTRE CHIEN ? ─────────────────────────────── */}
        {sitesChien.length > 0 && (
          <section className="mt-12 bg-green-50 border border-green-200 rounded-2xl px-6 py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-lg font-bold text-green-900 mb-1">
                  🐕 {lang === 'fr' ? 'Jamais sans votre chien ?' : lang === 'en' ? 'Never without your dog?' : lang === 'de' ? 'Nie ohne Ihren Hund?' : lang === 'es' ? '¿Nunca sin su perro?' : lang === 'pt' ? 'Nunca sem o seu cão?' : 'Jamais sans votre chien ?'}
                </h2>
                <p className="text-sm text-green-800">
                  {lang === 'fr'
                    ? `${sitesChien.length} site${sitesChien.length > 1 ? 's' : ''} qui accueillent les chiens dans cette région.`
                    : lang === 'en'
                    ? `${sitesChien.length} dog-friendly site${sitesChien.length > 1 ? 's' : ''} in this region.`
                    : `${sitesChien.length} site${sitesChien.length > 1 ? 's' : ''} acceptant les chiens.`}
                </p>
              </div>
              <Link
                href={`/${lang}/animaux`}
                className="shrink-0 inline-block bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-green-800 transition-colors"
              >
                {lang === 'fr' ? 'Voir le guide complet →' : lang === 'en' ? 'View full guide →' : 'Voir le guide →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sitesChien.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-green-200 px-4 py-3 flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">🐕</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 leading-snug">
                      {lang === 'fr' ? s.nom_fr : s.nom_en ?? s.nom_fr}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.categorie}</p>
                    {s.laisse_m > 0 && (
                      <p className="text-xs text-green-700 mt-1">Laisse max {s.laisse_m} m</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
