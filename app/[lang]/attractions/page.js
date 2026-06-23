import AttractionCard from '@/components/AttractionCard'
import FilterBar from '@/components/FilterBar'
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
      ? "Tous les sites — J'aime le Québec"
      : "All sites — J'aime le Québec",
  }
}

export default async function AttractionsPage({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const t = dicts[lang]
  const filtres = getFiltres()
  const all = getAllAttractions()

  // Filtrage côté serveur
  const regionNum = sp?.region ? Number(sp.region) : null
  const categorie = sp?.categorie ?? null
  const query     = sp?.q?.trim() ?? null

  function norm(str) {
    return (str ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const filtered = all.filter((a) => {
    if (regionNum && a.localisation.region_num !== regionNum) return false
    if (categorie) {
      const cat = lang === 'fr'
        ? a.fr?.categorie_thematique ?? ''
        : a.en?.theme_category ?? ''
      if (cat !== categorie) return false
    }
    if (query) {
      const q = norm(query)
      const titre   = lang === 'fr' ? norm(a.fr?.titre)   : norm(a.en?.title)
      const resume  = lang === 'fr' ? norm(a.fr?.resume)  : norm(a.en?.summary)
      const region  = norm(a.localisation?.region_touristique)
      const ville   = norm(a.localisation?.ville)
      if (!titre.includes(q) && !resume.includes(q) && !region.includes(q) && !ville.includes(q)) return false
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.list.title}</h1>

      <FilterBar lang={lang} t={t} filtres={filtres} currentRegion={sp?.region} currentCategorie={sp?.categorie} currentQuery={query} />

      {query && (
        <p className="text-sm text-gray-600 mb-2">
          {lang === 'fr' ? `Résultats pour « ${query} »` : `Results for "${query}"`}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-6">
        {filtered.length} {t.list.results}
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">{t.list.no_results}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <AttractionCard key={a.id} attraction={a} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}
