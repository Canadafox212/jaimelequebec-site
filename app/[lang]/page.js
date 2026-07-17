import Link from 'next/link'
import Image from 'next/image'
import AttractionCard from '@/components/AttractionCard'
import { getAllAttractions, getFiltres } from '@/lib/attractions'
import { getCoupsDeCoeur } from '@/lib/activites'
import { getAllArticles } from '@/lib/articles'
import { getDictionary, LANGS, getAlternates } from '@/lib/i18n'
import { bookingRegionUrl, discovercarsUrl } from '@/lib/affiliates'
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
    alternates: getAlternates(''),
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
  const recentArticles = getAllArticles().slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "J'aime le Québec",
    url: `https://jaimelequebec.org/${lang}`,
    description: t.home.hero_subtitle,
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `https://jaimelequebec.org/${lang}/recherche?q={search_term_string}` },
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

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center flex flex-col items-center justify-center min-h-[480px] md:min-h-[560px]">
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            {lang === 'fr' ? (
              <>Découvrez le<br /><span className="text-quebec-red">vrai Québec</span></>
            ) : lang === 'en' ? (
              <>Discover the<br /><span className="text-quebec-red">real Québec</span></>
            ) : (
              t.home.hero_title
            )}
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
            {t.home.hero_subtitle}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${lang}/sites`}
              className="inline-block bg-quebec-blue text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-blue-800 transition-colors shadow-xl whitespace-nowrap"
            >
              {t.home.explore_all}
            </Link>
            <Link
              href={`/${lang}/activites`}
              className="inline-block bg-white/20 backdrop-blur text-white border border-white/40 text-sm font-bold px-8 py-3.5 rounded-full hover:bg-white/30 transition-colors shadow-xl whitespace-nowrap"
            >
              {t.home.explore_activities}
            </Link>
          </div>
        </div>
      </section>


      {/* ── TEXTE D'ACCUEIL ──────────────────────────────────────────── */}
      <section className="bg-quebec-cream border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            {t.home.welcome_text}
          </p>
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

        <div className="text-center mt-10">
          <Link
            href={`/${lang}/sites`}
            className="inline-block bg-quebec-navy text-white font-bold px-8 py-3.5 rounded-full hover:bg-quebec-blue transition-colors shadow-md text-sm"
          >
            {t.home.see_all_annuaire}
          </Link>
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

      {/* ── DERNIERS ARTICLES ─────────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <section className="bg-quebec-cream border-t border-gray-100 py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-1">
                  {t.home.articles_label}
                </p>
                <h2 className="font-display text-3xl font-bold text-gray-900">{t.home.articles_title}</h2>
              </div>
              <Link
                href={`/${lang}/articles`}
                className="text-sm font-semibold text-quebec-blue hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                {t.home.articles_cta}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((a) => {
                const content = a[lang] || a.en || a.fr
                return (
                  <Link
                    key={a.slug}
                    href={`/${lang}/articles/${a.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="relative h-44 overflow-hidden">
                      {a.photo && (a.photo.startsWith('/') || a.photo.startsWith('http')) ? (
                        <Image
                          src={a.photo}
                          alt={content.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-quebec-blue to-quebec-navy flex items-center justify-center">
                          <span className="text-4xl">📰</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      {a.region && (
                        <p className="text-xs font-medium text-quebec-blue">{a.region}</p>
                      )}
                      <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-quebec-blue transition-colors leading-snug">
                        {content.titre}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{content.resume}</p>
                      <p className="mt-auto pt-2 text-sm font-bold text-quebec-blue group-hover:underline">
                        {t.articles.read}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── ROAD TRIP ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-14 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
              {t.home.roadtrip_label}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {t.home.roadtrip_title}
            </h2>
            <p className="text-blue-100 text-base mb-6 max-w-xl">
              {t.home.roadtrip_desc}
            </p>
            <Link
              href={`/${lang}/planifier`}
              className="inline-block bg-white text-quebec-navy font-bold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg text-sm"
            >
              {t.home.roadtrip_cta}
            </Link>
          </div>
          <div className="hidden md:block text-right shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-28 h-28 text-blue-300 opacity-60" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── LOCATION DE VOITURES ──────────────────────────────────── */}
      <section className="bg-amber-50 border-t border-amber-100 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
            {t.home.voiture_label}
          </p>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
            {t.home.voiture_title}
          </h2>
          <p className="text-gray-600 text-base mb-7 max-w-xl mx-auto">
            {t.home.voiture_desc}
          </p>
          <a
            href={discovercarsUrl(null, lang)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-amber-500 text-white font-bold px-8 py-3.5 rounded-full hover:bg-amber-600 transition-colors shadow-lg text-sm"
          >
            {t.home.voiture_cta}
          </a>
        </div>
      </section>

      {/* ── HÉBERGEMENT ───────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-2">
            {t.home.hebergement_label}
          </p>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
            {t.home.hebergement_title}
          </h2>
          <p className="text-gray-600 text-base mb-7 max-w-xl mx-auto">
            {t.home.hebergement_desc}
          </p>
          <a
            href={bookingRegionUrl(lang)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-[#003580] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#00224f] transition-colors shadow-lg text-sm"
          >
            {t.home.hebergement_cta}
          </a>
        </div>
      </section>

    </>
  )
}
