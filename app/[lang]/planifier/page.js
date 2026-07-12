import { getAllAttractions, getAttractionImageSrc } from '@/lib/attractions'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
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

  return (
    <main>
      <RoadTripBuilder lang={lang} t={t.planifier} attractions={attractions} />
    </main>
  )
}
