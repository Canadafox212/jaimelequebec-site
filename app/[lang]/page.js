import Link from 'next/link'
import Image from 'next/image'
import AttractionCard from '@/components/AttractionCard'
import { getAllAttractions, getFiltres } from '@/lib/attractions'
import { getCoupsDeCoeur } from '@/lib/activites'
import { getDictionary, LANGS } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) return {}
  return {
    title: `J'aime le Québec — ${t.home.hero_title}`,
    description: t.home.hero_subtitle,
  }
}

export default async function HomePage({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) notFound()
  const attractions = getAllAttractions()
  const filtres = getFiltres()
  const coups = getCoupsDeCoeur(6)
  const featured = coups.length ? coups : attractions.slice(0, 6)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "J'aime le Québec",
    url: `https://jaimelequebec.com/${lang}`,
    description: t.home.hero_subtitle,
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `https://jaimelequebec.com/${lang}/recherche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="/images/hero-quebec.jpg"
          alt="Le Québec — Château Frontenac, fleuve Saint-Laurent, activités nature"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-quebec-navy/50 via-quebec-navy/35 to-quebec-navy/65" />

        <div className="relative max-w-5xl mx-auto px-4 pt-14 md:pt-20 text-center flex flex-col min-h-[480px] md:min-h-[560px]">
          <div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-12">
              {lang === 'fr' ? (
                <>Découvrez le<br /><span className="text-quebec-red">vrai Québec</span></>
              ) : lang === 'en' ? (
                <>Discover the<br /><span className="text-quebec-red">real Québec</span></>
              ) : (
                t.home.hero_title
              )}
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {t.home.hero_subtitle}
            </p>
          </div>

          <div className="mx-auto mt-auto pb-12">
            <Link
              href={`/${lang}/sites`}
              className="inline-block bg-quebec-blue text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-blue-800 transition-colors shadow-xl whitespace-nowrap"
            >
              {t.home.explore_all}
            </Link>
          </div>
        </div>
      </section>


      {/* ── ATTRACTIONS EN VEDETTE ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-1">
              {t.home.editors_picks}
            </p>
            <h2 className="font-display text-3xl font-bold text-gray-900">{t.home.featured_title}</h2>
          </div>
          <Link
            href={`/${lang}/sites`}
            className="text-sm font-semibold text-quebec-blue hover:text-blue-800 transition-colors whitespace-nowrap"
          >
            {t.home.see_all}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((a) => (
            <AttractionCard key={a.id} attraction={a} lang={lang} t={t} />
          ))}
        </div>

      </section>

      {/* ── EXPLORER PAR RÉGION ──────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-1">
              {t.home.regions_count}
            </p>
            <h2 className="font-display text-3xl font-bold text-gray-900">
              {t.home.explore_by_region}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtres.regions.map((r) => (
              <Link
                key={r.num}
                href={`/${lang}/sites?region=${r.num}`}
                className="bg-slate-100 hover:bg-quebec-blue hover:text-white text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-all hover:shadow-md"
              >
                {r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOC AFFILIATION TEASER ───────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            {t.home.plan_stay}
          </p>
          <h2 className="font-display text-3xl font-bold mb-4">
            {t.home.stay_subtitle}
          </h2>
          <p className="text-slate-300 text-lg">
            {t.home.stay_description}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { emoji: '🏨', label: t.home.hotels, partner: 'Booking.com' },
            { emoji: '🎯', label: t.home.tours, partner: 'GetYourGuide' },
            { emoji: '🎒', label: t.home.guided_tours, partner: 'Viator' },
          ].map(({ emoji, label, partner }) => (
            <div key={partner} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="font-bold text-white mb-1">{label}</p>
              <p className="text-xs text-slate-400">via {partner}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
