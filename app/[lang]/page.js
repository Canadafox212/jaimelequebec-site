import Link from 'next/link'
import AttractionCard from '@/components/AttractionCard'
import { getAllAttractions, getFiltres } from '@/lib/attractions'
import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'

const dicts = { fr, en }

export async function generateStaticParams() {
  return [{ lang: 'fr' }, { lang: 'en' }]
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  return {
    title: lang === 'fr'
      ? "J'aime le Québec — Guide touristique"
      : "J'aime le Québec — Travel Guide",
    description: lang === 'fr'
      ? "200 attractions touristiques incontournables au Québec"
      : "200 must-see tourist attractions in Québec",
  }
}

export default async function HomePage({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  const attractions = getAllAttractions()
  const filtres = getFiltres()
  const featured = attractions.slice(0, 6)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-quebec-navy text-white overflow-hidden">
        {/* Halo décoratifs */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-quebec-blue rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-quebec-red rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-sm px-4 py-1.5 rounded-full mb-8 font-medium">
            ✦ {lang === 'fr' ? 'Guide indépendant depuis 2008' : 'Independent guide since 2008'}
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            {lang === 'fr' ? (
              <>Découvrez le<br /><span className="text-quebec-red">vrai Québec</span></>
            ) : (
              <>Discover the<br /><span className="text-quebec-red">real Québec</span></>
            )}
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.home.hero_subtitle}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={`/${lang}/attractions`}
              className="bg-quebec-red hover:bg-red-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
            >
              {t.home.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '200', label: t.home.stats_attractions },
            { value: '20',  label: t.home.stats_regions },
            { value: '10',  label: t.home.stats_categories },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-4xl font-bold text-quebec-blue">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATTRACTIONS EN VEDETTE ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-1">
              {lang === 'fr' ? 'Coups de cœur' : 'Editor\'s picks'}
            </p>
            <h2 className="font-display text-3xl font-bold text-gray-900">{t.home.featured_title}</h2>
          </div>
          <Link
            href={`/${lang}/attractions`}
            className="text-sm font-semibold text-quebec-blue hover:text-blue-800 transition-colors whitespace-nowrap"
          >
            {lang === 'fr' ? 'Voir les 200 →' : 'See all 200 →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((a) => (
            <AttractionCard key={a.id} attraction={a} lang={lang} t={t} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/${lang}/attractions`}
            className="inline-flex items-center gap-2 bg-quebec-blue hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
          >
            {lang === 'fr' ? 'Explorer les 200 attractions' : 'Explore all 200 attractions'}
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── EXPLORER PAR RÉGION ──────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-1">
              {lang === 'fr' ? '20 régions touristiques' : '20 tourist regions'}
            </p>
            <h2 className="font-display text-3xl font-bold text-gray-900">
              {lang === 'fr' ? 'Explorer par région' : 'Explore by region'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtres.regions.map((r) => (
              <Link
                key={r.num}
                href={`/${lang}/attractions?region=${r.num}`}
                className="bg-slate-100 hover:bg-quebec-blue hover:text-white text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-all hover:shadow-md"
              >
                {lang === 'fr' ? r.nom_fr : r.nom_en}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOC AFFILIATION TEASER ───────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            {lang === 'fr' ? 'Planifiez votre séjour' : 'Plan your stay'}
          </p>
          <h2 className="font-display text-3xl font-bold mb-4">
            {lang === 'fr'
              ? 'Hébergements, activités, excursions'
              : 'Accommodations, activities, excursions'}
          </h2>
          <p className="text-slate-300 text-lg">
            {lang === 'fr'
              ? 'Sur chaque fiche d\'attraction, trouvez les meilleures options à proximité.'
              : 'On each attraction page, find the best nearby options.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { emoji: '🏨', label: lang === 'fr' ? 'Hébergements' : 'Hotels', partner: 'Booking.com', color: 'from-blue-600 to-blue-800' },
            { emoji: '🎯', label: lang === 'fr' ? 'Activités & Excursions' : 'Tours & Activities', partner: 'GetYourGuide', color: 'from-amber-500 to-orange-600' },
            { emoji: '🎒', label: lang === 'fr' ? 'Visites guidées' : 'Guided Tours', partner: 'Viator', color: 'from-emerald-600 to-emerald-800' },
          ].map(({ emoji, label, partner, color }) => (
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
