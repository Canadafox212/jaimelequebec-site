import Link from 'next/link'
import FilterBar from '@/components/FilterBar'
import RegionAvisBanner from '@/components/RegionAvisBanner'
import RegionDescription from '@/components/RegionDescription'
import SitesViewContainer from '@/components/SitesViewContainer'
import ViatorWidget from '@/components/ViatorWidget'
import { getAllAttractions, getFiltres, getAttractionImageSrc } from '@/lib/attractions'
import { getTaxonomie, getRegionThemes, getRegionThemeList } from '@/lib/activites'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
import { viatorUrl } from '@/lib/affiliates'
import regionsDesc from '@/data/regions-descriptions.json'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  return {
    title: `${dicts[lang].list.title} — J'aime le Québec`,
    description: dicts[lang].list.grand_guide_sub,
    alternates: getAlternates('/sites'),
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
  const themesRegion = regionNum ? getRegionThemeList(regionNum) : []
  const regionDescText = regionNum
    ? (regionsDesc[String(regionNum)]?.[lang] ?? regionsDesc[String(regionNum)]?.fr ?? null)
    : null
  const regionGeo = regionNum ? filtres.regions.find((r) => r.num === regionNum) : null

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

  // Bulles thèmes quand aucune région sélectionnée — liens vers ?theme=X dans l'annuaire
  const themesAll = !regionNum
    ? tax.themes
        .map((th) => ({ theme: th, count: all.filter((a) => getTheme(a)?.id === th.id).length }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count)
    : []

  // Bulles à afficher : région sélectionnée → /activites, sinon → ?theme=
  const displayThemes = regionNum ? themesRegion : themesAll

  // ── PONT vers les Activités : la catégorie ou le thème choisi a du contenu riche ──
  let bridge = null
  {
    const cats = filtres.categories_thematiques
    let resolvedThemeId = themeId  // déjà défini si ?theme= dans l'URL

    // Résoudre depuis ?categorie= si themeId pas encore connu
    if (!resolvedThemeId && categorie) {
      resolvedThemeId = tax.categories[categorie]
      if (!resolvedThemeId) {
        const i = cats.en.indexOf(categorie); if (i >= 0) resolvedThemeId = tax.categories[cats.fr[i]]
      }
      if (!resolvedThemeId) {
        const j = cats.fr.indexOf(categorie); if (j >= 0) resolvedThemeId = tax.categories[cats.fr[j]]
      }
    }

    if (resolvedThemeId || regionNum) {
      const theme = resolvedThemeId ? tax.themes.find((th) => th.id === resolvedThemeId) : null
      const region = regionNum ? filtres.regions.find((r) => r.num === regionNum) : null
      const regionNom = region ? (region[`nom_${lang}`] ?? region.nom_en ?? region.nom_fr) : null

      let precise = false
      if (theme && region) {
        const { ete, hiver } = getRegionThemes(region.num)
        precise = [...ete, ...hiver].some((x) => x.theme.id === resolvedThemeId)
      }
      bridge = {
        emoji: theme?.emoji ?? '🧭',
        themeNom: theme ? (theme[`nom_${lang}`] ?? theme.nom_en ?? theme.nom_fr) : null,
        regionNom,
        precise,
        resolvedThemeId,
        href: precise
          ? `/${lang}/activites/${region.num}/${resolvedThemeId}`
          : region ? `/${lang}/activites/${region.num}` : `/${lang}/activites`,
      }
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

      {/* Résumé + carte de la région sélectionnée — EN TÊTE avant tout filtre */}
      {regionNum && (regionDescText || regionGeo) && (
        <div className="mb-6">
          {regionDescText && <RegionDescription text={regionDescText} lang={lang} />}
          {regionGeo?.lat && regionGeo?.lng && (() => {
            const z = Math.round(regionGeo.zoom ?? 8)
            const d = Math.min(6, Math.max(0.2, 1.5 / Math.pow(2, z - 9)))
            const dLat = d * 0.6
            const bbox = `${(regionGeo.lng - d).toFixed(3)}%2C${(regionGeo.lat - dLat).toFixed(3)}%2C${(regionGeo.lng + d).toFixed(3)}%2C${(regionGeo.lat + dLat).toFixed(3)}`
            const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${regionGeo.lat}%2C${regionGeo.lng}`
            const regionNom = regionGeo[`nom_${lang}`] ?? regionGeo.nom_fr
            return (
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-44 w-full">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title={`Carte — ${regionNom}`}
                  loading="lazy"
                />
              </div>
            )
          })()}
        </div>
      )}

      <FilterBar lang={lang} t={t} filtres={filtres} themes={themesDisponibles} currentRegion={sp?.region} currentTheme={themeId} currentSaison={saison} currentQuery={query} hideTheme hideSaison />

      {/* Thèmes d'activités — liens rapides vers /activites/[region]/[theme] ou ?theme= */}
      {displayThemes.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {regionNum
              ? (lang === 'fr' ? 'Activités dans cette région' : 'Activities in this region')
              : (lang === 'fr' ? 'Explorer par activité' : 'Browse by activity')}
          </p>
          <div className="flex flex-wrap gap-2">
            {displayThemes.map(({ theme, count }) => {
              const nom = theme[`nom_${lang}`] ?? theme.nom_en ?? theme.nom_fr
              const href = regionNum
                ? `/${lang}/activites/${regionNum}/${theme.id}`
                : `/${lang}/sites?theme=${theme.id}`
              return (
                <Link
                  key={theme.id}
                  href={href}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-quebec-blue hover:text-quebec-blue text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  <span>{theme.emoji}</span>
                  <span>{nom}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

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

      {/* Avertissement résultats trop réduits + lien vers activités */}
      {filtered.length < 4 && (regionNum || themeId) && bridge && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-800">
          {lang === 'fr'
            ? `Peu de sites principaux correspondent à ce filtre. Consultez `
            : `Few main sites match this filter. Check `}
          <Link href={bridge.href} className="font-bold underline hover:text-amber-900">
            {lang === 'fr' ? 'les activités et expériences' : 'activities and experiences'}
          </Link>
          {lang === 'fr' ? ' pour plus de résultats.' : ' for more results.'}
        </div>
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

    {/* ── Widget Viator ciblé région+thème (ou générique si pas de filtre) ── */}
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {regionNum
        ? <ViatorWidget regionNum={regionNum} themeId={bridge?.resolvedThemeId ?? themeId} lang={lang} />
        : (
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-12 px-4 rounded-2xl text-center">
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">
              {lang === 'fr' ? 'Envie d\'une visite guidée ?' : 'Looking for a guided tour?'}
            </p>
            <h2 className="text-2xl font-bold mb-3">
              {lang === 'fr' ? 'Explorez le Québec avec un guide local' : 'Explore Québec with a local guide'}
            </h2>
            <p className="text-emerald-100 mb-6">
              {lang === 'fr'
                ? 'Visites guidées, excursions et expériences inoubliables — réservez facilement via Viator.'
                : 'Guided tours, excursions and unforgettable experiences — book easily via Viator.'}
            </p>
            <a href={viatorUrl(lang)} target="_blank" rel="noopener noreferrer sponsored"
              className="inline-block bg-white text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors shadow-lg text-sm">
              {lang === 'fr' ? 'Voir les visites guidées →' : 'Browse guided tours →'}
            </a>
          </div>
        )
      }
    </div>
    </>
  )
}
