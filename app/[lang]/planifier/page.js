import { getAllAttractions, getAttractionImageSrc } from '@/lib/attractions'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
import { discovercarsUrl } from '@/lib/affiliates'
import RoadTripBuilder from '@/components/RoadTripBuilder'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]?.planifier ?? dicts.fr.planifier
  return {
    title: t.meta_title,
    alternates: getAlternates('/planifier'),
  }
}

export default async function PlanifierPage({ params }) {
  const { lang } = await params
  const t = dicts[lang] ?? dicts.fr

  // Build simplified attraction list for the search autocomplete
  const raw = getAllAttractions()
  const attractions = raw.map((a) => ({
    slug:    a.slug,
    titleFr: a.fr?.titre ?? '',
    titleEn: a.en?.title ?? a.fr?.titre ?? '',
    lat:     a.localisation?.latitude ?? null,
    lng:     a.localisation?.longitude ?? null,
    image:   getAttractionImageSrc(a.slug),
    region:  a.localisation?.region_touristique ?? '',
    ville:   a.localisation?.ville ?? '',
    hebergement: a.hebergement ? {
      economique:  (a.hebergement.economique  ?? []).slice(0, 1),
      confort:     (a.hebergement.confort     ?? []).slice(0, 1),
      haut_gamme:  (a.hebergement.haut_gamme  ?? []).slice(0, 1),
    } : null,
  })).filter((a) => a.lat && a.lng)

  const th = t.home

  return (
    <main>
      <RoadTripBuilder lang={lang} t={t.planifier} attractions={attractions} />

      {/* ── LOCATION DE VOITURES ─────────────────────────────────────── */}
      <section className="bg-amber-50 border-t border-amber-100 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
            {th.voiture_label}
          </p>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
            {th.voiture_title}
          </h2>
          <p className="text-gray-600 text-base mb-7 max-w-xl mx-auto">
            {th.voiture_desc}
          </p>
          <a
            href={discovercarsUrl(null, lang)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-amber-500 text-white font-bold px-8 py-3.5 rounded-full hover:bg-amber-600 transition-colors shadow-lg text-sm"
          >
            {th.voiture_cta}
          </a>
        </div>
      </section>
    </main>
  )
}
