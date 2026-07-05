import Link from 'next/link'
import FilterBar from '@/components/FilterBar'
import RegionAvisBanner from '@/components/RegionAvisBanner'
import SitesViewContainer from '@/components/SitesViewContainer'
import { getAllAttractions, getFiltres, getAttractionImageSrc } from '@/lib/attractions'
import { getTaxonomie, getRegionThemes } from '@/lib/activites'
import { dicts, LANGS } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  return {
    title: `${dicts[lang].list.title} — J'aime le Québec`,
  }
}

export default async function AttractionsPage({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const t = dicts[lang]
  const filtres = getFiltres()
  const all = getAllAttractions()

  // Filtrage côté serveur
  const regionNum   = sp?.region ? Number(sp.region) : null
  const themeId     = sp?.theme ?? null
  const saison      = sp?.saison ?? null   // 'ete' | 'hiver' | null
  const query       = sp?.q?.trim() ?? null
  const categorie   = sp?.categorie ?? null
  const initialView = sp?.view === 'map' ? 'map' : null

  const tax = getTaxonomie()

  function norm(str) {
    return (str ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  function getTheme(a) {
    const cat = a.fr?.categorie_thematique
    const id = cat ? (tax.categories[cat] ?? null) : null
    return id ? tax.themes.find((th) => th.id === id) ?? null : null
  }

  function saisonMatch(a, sel) {
    if (!sel) return true
    const theme = getTheme(a)
    if (theme) {
      if (sel === 'ete')   return theme.saison === 'ete'   || theme.saison === 'les_deux'
      if (sel === 'hiver') return theme.saison === 'hiver' || theme.saison === 'les_deux'
    }
    // Fallback : filtrer par présence d'activités dans la saison
    if (sel === 'ete')   return (a.activites?.ete?.length  ?? 0) > 0
    if (sel === 'hiver') return (a.activites?.hiver?.length ?? 0) > 0
    return true
  }

  const filtered = all.filter((a) => {
    if (regionNum && a.localisation.region_num !== regionNum) return false
    const theme = getTheme(a)
    if (themeId && theme?.id !== themeId) return false
    if (saison && !saisonMatch(a, saison)) return false
    if (query) {
      const q = norm(query)
      const tr = a[lang]
      const titre  = tr ? norm(tr.titre)  : (lang === 'fr' ? norm(a.fr?.titre)  : norm(a.en?.title))
      const resume = tr ? norm(tr.resume) : (lang === 'fr' ? norm(a.fr?.resume) : norm(a.en?.summary))
      const region = norm(a.localisation?.region_touristique)
      const ville  = norm(a.localisation?.ville)
      if (!titre.includes(q) && !resume.includes(q) && !region.includes(q) && !ville.includes(q)) return false
    }
    return true
  })

  // Thèmes présents dans attractions.json (pour le filtre)
  const themeIdsPresents = new Set(all.map((a) => getTheme(a)?.id).filter(Boolean))
  const themesDisponibles = tax.themes.filter((th) => themeIdsPresents.has(th.id))

  // ── PONT vers les Activités : la catégorie choisie correspond à un thème riche ──
  let bridge = null
  if (categorie) {
    const cats = filtres.categories_thematiques
    let themeId = tax.categories[categorie]
    if (!themeId) {
      const i = cats.en.indexOf(categorie); if (i >= 0) themeId = tax.categories[cats.fr[i]]
    }
    if (!themeId) {
      const j = cats.fr.indexOf(categorie); if (j >= 0) themeId = tax.categories[cats.fr[j]]
    }
    const theme = themeId ? tax.themes.find((th) => th.id === themeId) : null
    const region = regionNum ? filtres.regions.find((r) => r.num === regionNum) : null
    const regionNom = region ? (region[`nom_${lang}`] ?? region.nom_en ?? region.nom_fr) : null

    // Le thème mappé a-t-il du contenu dans cette région ? (sinon → liste des thèmes de la région)
    let precise = false
    if (theme && region) {
      const { ete, hiver } = getRegionThemes(region.num)
      precise = [...ete, ...hiver].some((x) => x.theme.id === themeId)
    }
    bridge = {
      emoji: theme?.emoji ?? '🧭',
      themeNom: theme ? (theme[`nom_${lang}`] ?? theme.nom_en ?? theme.nom_fr) : null,
      regionNom,
      precise,
      href: precise
        ? `/${lang}/activites/${region.num}/${themeId}`
        : region ? `/${lang}/activites/${region.num}` : `/${lang}/activites`,
    }
  }

  return (
    <>
      {/* ── BANNIÈRE ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
            {t.list.grand_guide}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-1">{t.list.title}</h1>
          <p className="text-blue-200 text-lg">
            {t.list.grand_guide_sub}
          </p>
        </div>
      </div>

    <div className="max-w-6xl mx-auto px-4 py-8">
      <FilterBar lang={lang} t={t} filtres={filtres} themes={themesDisponibles} currentRegion={sp?.region} currentTheme={themeId} currentSaison={saison} currentQuery={query} />

      {query && (
        <p className="text-sm text-gray-600 mb-2">
          {t.list.results_for} « {query} »
        </p>
      )}

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} {t.list.results}
      </p>

      {/* Bannière carte région + avis */}
      {regionNum && (() => {
        const reg = filtres.regions.find((r) => r.num === regionNum)
        const nom = reg ? (reg[`nom_${lang}`] ?? reg.nom_en ?? reg.nom_fr) : null
        return nom ? (
          <RegionAvisBanner regionNum={regionNum} nom={nom} resultCount={filtered.length} lang={lang} />
        ) : null
      })()}

      {/* Pont vers les Activités (la catégorie a beaucoup plus de contenu en activités) */}
      {bridge && (
        <Link
          href={bridge.href}
          className="group flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-5 py-4 mb-6 hover:shadow-md transition-all"
        >
          <span className="text-2xl shrink-0">{bridge.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">
              {bridge.precise
                ? `${t.list.bridge_all_activities} « ${bridge.themeNom} »`
                : t.list.bridge_all_activities}
              {bridge.regionNom ? ` · ${bridge.regionNom}` : ''}
            </p>
            <p className="text-xs text-purple-700">
              {t.list.bridge_more} →
            </p>
          </div>
          <span className="text-purple-500 text-lg shrink-0 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      )}

      <SitesViewContainer
        attractions={filtered.map(a => ({
          id: a.id,
          slug: a.slug,
          _imageSrc: getAttractionImageSrc(a.slug),
          fr: a.fr ? { titre: a.fr.titre, resume: a.fr.resume, categorie_thematique: a.fr.categorie_thematique } : undefined,
          en: a.en ? { title: a.en.title, summary: a.en.summary, theme_category: a.en.theme_category } : undefined,
          localisation: {
            region_touristique: a.localisation?.region_touristique,
            latitude: a.localisation?.latitude ?? null,
            longitude: a.localisation?.longitude ?? null,
          },
        }))}
        lang={lang}
        t={t}
        initialView={initialView}
      />
    </div>
    </>
  )
}
