import Link from 'next/link'
import Image from 'next/image'
import AttractionCard from '@/components/AttractionCard'
import { getAllAttractions, getFiltres, getAttractionImageSrc } from '@/lib/attractions'
import { getEtablissementsIndex, getTaxonomie } from '@/lib/activites'
import EtabExplorer from '@/components/EtabExplorer'
import { dicts, LANGS } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const q = sp?.q?.trim() ?? ''
  return {
    title: q
      ? `${lang === 'fr' ? 'Résultats pour' : 'Results for'} "${q}" — J'aime le Québec`
      : lang === 'fr' ? "Recherche — J'aime le Québec" : "Search — J'aime le Québec",
  }
}

function norm(str) {
  return (str ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function getExcerpt(text, query) {
  if (!text) return null
  const normText = norm(text)
  const normQ = norm(query)
  const idx = normText.indexOf(normQ)
  if (idx === -1) return null
  const start = Math.max(0, idx - 70)
  const end = Math.min(text.length, idx + query.length + 100)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export default async function RecherchePage({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const t = dicts[lang]
  const query = sp?.q?.trim() ?? ''

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">{t.search.no_query}</p>
      </div>
    )
  }

  const q = norm(query)
  const all = getAllAttractions()
  const filtres = getFiltres()

  // Sites : match titre ou résumé
  const siteMatches = all.filter(a => {
    const titre  = lang === 'fr' ? norm(a.fr?.titre)  : norm(a.en?.title)
    const resume = lang === 'fr' ? norm(a.fr?.resume) : norm(a.en?.summary)
    return titre.includes(q) || resume.includes(q)
  })
  const siteIds = new Set(siteMatches.map(a => a.id))

  // Descriptions : match texte complet uniquement (pas déjà dans siteMatches)
  const descMatches = all
    .filter(a => !siteIds.has(a.id))
    .map(a => {
      const texte = lang === 'fr' ? (a.fr?.texte_complet ?? '') : (a.en?.full_text ?? '')
      const excerpt = getExcerpt(texte, query)
      return excerpt ? { ...a, excerpt } : null
    })
    .filter(Boolean)

  // Régions
  const regionMatches = filtres.regions.filter(r => {
    const nom = norm(r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr)
    return nom.includes(q)
  })

  // Catégories
  const categories = lang === 'fr'
    ? filtres.categories_thematiques.fr
    : filtres.categories_thematiques.en
  const categoryMatches = categories.filter(c => norm(c).includes(q))

  // Activités / lieux (établissements) : match nom, type ou mots-clés
  const etabMatches = getEtablissementsIndex().filter(e => {
    if (norm(e.nom).includes(q)) return true
    if (norm(e.type).includes(q)) return true
    return e.labels.some(l => norm(l).includes(q))
  }).sort((a, b) => {
    // priorité aux fiches pilotées (page perso), puis nom
    if (!!b.page - !!a.page) return !!b.page - !!a.page
    return a.nom.localeCompare(b.nom, 'fr')
  }).slice(0, 120)

  // Thèmes : match nom du thème
  const themeMatches = getTaxonomie().themes.filter(th =>
    norm(th[`nom_${lang}`] ?? th.nom_en ?? th.nom_fr).includes(q)
  )

  const total = siteMatches.length + etabMatches.length + descMatches.length + themeMatches.length + regionMatches.length + categoryMatches.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t.search.title} <span className="text-quebec-blue">«&nbsp;{query}&nbsp;»</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} {total <= 1 ? t.search.total : t.search.total_plural}
        </p>
      </div>

      {total === 0 && (
        <p className="text-gray-500 py-12 text-center text-lg">
          {t.search.no_results} «&nbsp;{query}&nbsp;»
        </p>
      )}

      {/* Section : Activités et lieux */}
      {etabMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
            {t.search.section_activites}
            <span className="text-sm font-normal text-gray-400 ml-1">({etabMatches.length})</span>
          </h2>
          <EtabExplorer items={etabMatches} lang={lang} t={t} />
        </section>
      )}

      {/* Section : Thèmes */}
      {themeMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-teal-500 rounded-full inline-block" />
            {t.search.section_themes}
            <span className="text-sm font-normal text-gray-400 ml-1">({themeMatches.length})</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {themeMatches.map(th => (
              <Link
                key={th.id}
                href={`/${lang}/activites`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-teal-500 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{th.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{th[`nom_${lang}`] ?? th.nom_en ?? th.nom_fr}</p>
                  <p className="text-xs text-teal-600">{t.search.see_theme} →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section : Sites touristiques */}
      {siteMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-quebec-red rounded-full inline-block" />
            {t.search.section_sites}
            <span className="text-sm font-normal text-gray-400 ml-1">({siteMatches.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {siteMatches.map(a => (
              <AttractionCard key={a.id} attraction={a} lang={lang} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Section : Dans les descriptions */}
      {descMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-quebec-gold rounded-full inline-block" />
            {t.search.section_descriptions}
            <span className="text-sm font-normal text-gray-400 ml-1">({descMatches.length})</span>
          </h2>
          <div className="flex flex-col gap-3">
            {descMatches.map(a => (
              <DescriptionRow key={a.id} attraction={a} lang={lang} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Section : Régions */}
      {regionMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-quebec-blue rounded-full inline-block" />
            {t.search.section_regions}
            <span className="text-sm font-normal text-gray-400 ml-1">({regionMatches.length})</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {regionMatches.map(r => (
              <Link
                key={r.num}
                href={`/${lang}/sites?region=${r.num}`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-quebec-blue hover:shadow-md transition-all"
              >
                <span className="text-2xl">🗺️</span>
                <div>
                  <p className="font-semibold text-gray-900">{r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr}</p>
                  <p className="text-xs text-quebec-blue">{t.search.see_region} →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section : Catégories */}
      {categoryMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
            {t.search.section_categories}
            <span className="text-sm font-normal text-gray-400 ml-1">({categoryMatches.length})</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {categoryMatches.map(c => (
              <Link
                key={c}
                href={`/${lang}/sites?categorie=${encodeURIComponent(c)}`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="font-semibold text-gray-900">{c}</p>
                  <p className="text-xs text-emerald-600">{t.search.see_category} →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

function DescriptionRow({ attraction, lang, t }) {
  const titre    = lang === 'fr' ? attraction.fr?.titre  : attraction.en?.title
  const region   = attraction.localisation?.region_touristique
  const category = lang === 'fr' ? attraction.fr?.categorie_thematique : attraction.en?.theme_category
  const imageSrc = getAttractionImageSrc(attraction.slug)

  return (
    <Link
      href={`/${lang}/sites/${attraction.slug}`}
      className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-quebec-gold hover:shadow-md transition-all flex gap-4 items-start"
    >
      {/* Photo */}
      <div className="relative w-36 h-24 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-quebec-blue to-quebec-navy">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={titre ?? ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="144px"
          />
        )}
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{region}</span>
          <span className="text-xs text-quebec-gold font-medium">· {category}</span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-quebec-blue transition-colors line-clamp-1 mb-1">
          {titre}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 italic leading-relaxed">
          {attraction.excerpt}
        </p>
        <p className="text-xs text-gray-400 mt-1">{t.search.found_in_text}</p>
      </div>

      <span className="text-quebec-blue text-lg shrink-0 group-hover:translate-x-1 transition-transform mt-1">→</span>
    </Link>
  )
}
