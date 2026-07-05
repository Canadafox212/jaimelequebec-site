import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AttractionCard from '@/components/AttractionCard'
import EtabExplorer from '@/components/EtabExplorer'
import AvisSection from '@/components/AvisSection'
import { getRegion, getTheme, getRegionThemeResults } from '@/lib/activites'
import { dicts, LANGS } from '@/lib/i18n'

function mapsSearch(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&t=h`
}

// Description de base auto-générée à partir du type + des mots-clés
function autoDescription(etab) {
  const labels = (etab.labels || []).slice(0, 4)
  const parts = []
  if (etab.type) parts.push(etab.type)
  if (labels.length) parts.push(labels.join(', '))
  if (!parts.length) return null
  return parts.join(' — ') + '.'
}

// Photo de repli selon le type (réutilise /images/fallbacks)
function etabPhoto(etab) {
  if (etab.photo) return etab.photo
  const t = (etab.type ?? '').toLowerCase()
  if (t.includes('bar') || t.includes('boîte') || t.includes('nuit')) return '/images/fallbacks/bar.webp'
  if (t.includes('casino') || t.includes('hippodrome')) return '/images/fallbacks/casino.webp'
  if (t.includes('spa') || t.includes('santé')) return '/images/fallbacks/spa.webp'
  if (t.includes('ski alpin') || t.includes('planche à neige')) return '/images/fallbacks/ski-alpin.webp'
  if (t.includes('ski de fond') || t.includes('raquette') || t.includes('glissoire')) return '/images/fallbacks/ski-fond.webp'
  if (t.includes('patinoire')) return '/images/fallbacks/patinoire.webp'
  if (t.includes('golf')) return '/images/fallbacks/golf.webp'
  if (t.includes('vélo') || t.includes('fatbike')) return '/images/fallbacks/velo.webp'
  if (t.includes('jardin') || t.includes('zoo')) return '/images/fallbacks/jardin.webp'
  if (t.includes('marina')) return '/images/fallbacks/marina.webp'
  if (t.includes('plage')) return '/images/fallbacks/plage.webp'
  if (t.includes('pêche')) return '/images/fallbacks/peche.webp'
  if (t.includes('équestre') || t.includes('cheval')) return '/images/fallbacks/equestre.webp'
  if (t.includes('karting') || t.includes('autodrome') || t.includes('motorisé')) return '/images/fallbacks/karting.webp'
  if (t.includes('parc') || t.includes('sentier') || t.includes('piste') || t.includes('nature')) return '/images/fallbacks/parc.webp'
  return '/images/fallbacks/sport.webp'
}

// Mots-clés (type + libellés éclatés, dédupliqués) — affichés en texte simple
function keywordTags(etab) {
  const raw = []
  if (etab.type) raw.push(...etab.type.split(/[,/]/))
  for (const l of etab.labels || []) raw.push(...l.split(/[,/]/))
  const seen = new Set(), out = []
  for (let w of raw) {
    w = w.trim()
    if (w.length > 1) { const k = w.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(w) } }
  }
  return out
}

export async function generateMetadata({ params }) {
  const { lang, region, theme } = await params
  const t = dicts[lang]
  const r = getRegion(region)
  const th = getTheme(theme)
  if (!r || !th) return {}
  const nom = r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr
  const thNom = th[`nom_${lang}`] ?? th.nom_en ?? th.nom_fr
  return { title: `${thNom} · ${nom} — J'aime le Québec` }
}

export default async function ThemeResults({ params, searchParams }) {
  const { lang, region, theme } = await params
  const sp = await searchParams
  const saison = sp?.saison === 'ete' || sp?.saison === 'hiver' ? sp.saison : null
  const t = dicts[lang]
  const r = getRegion(region)
  const th = getTheme(theme)
  if (!r || !th) notFound()

  const nom = r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr
  const thNom = th[`nom_${lang}`] ?? th.nom_en ?? th.nom_fr
  const { attractions, selections, etablissements } = getRegionThemeResults(region, theme, saison)
  const googleAllUrl = mapsSearch(`${thNom} ${nom} Québec`)
  const hasSelection = attractions.length > 0 || selections.length > 0

  return (
    <>
      <div className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href={`/${lang}/activites/${region}`} className="inline-block text-sm text-blue-200 hover:text-white transition-colors mb-3">
            {t.activites.back_themes}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{th.emoji}</span>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{thNom}</h1>
                <p className="text-blue-200">{nom}</p>
              </div>
            </div>
            {/* Toggle saison — masqué pour thèmes purement saisonniers */}
            {(th.saison === 'les_deux') && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
                <Link
                  href={`/${lang}/activites/${region}/${theme}?saison=ete`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${saison === 'ete' ? 'bg-amber-400 text-white shadow' : 'text-white/70 hover:text-white'}`}
                >
                  ☀️ {t.activites.block_summer ?? 'Été'}
                </Link>
                <Link
                  href={`/${lang}/activites/${region}/${theme}`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!saison ? 'bg-white/20 text-white shadow' : 'text-white/70 hover:text-white'}`}
                >
                  {t.activites.block_all ?? 'Tout'}
                </Link>
                <Link
                  href={`/${lang}/activites/${region}/${theme}?saison=hiver`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${saison === 'hiver' ? 'bg-indigo-500 text-white shadow' : 'text-white/70 hover:text-white'}`}
                >
                  ❄️ {t.activites.block_winter ?? 'Hiver'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">

        {(hasSelection || etablissements.length > 0) && (
          <p className="text-xs text-gray-400 -mb-10">
            ℹ️ {t.activites.km_disclaimer}
          </p>
        )}

        {/* ── BLOC 2 — NOS SÉLECTIONS (pilotées : affiliation / pages perso) ─ */}
        {hasSelection && (
          <section>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-quebec-gold">★</span> {t.activites.our_selection}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{t.activites.our_selection_sub}</p>
            </div>

            {/* Établissements pilotés (mis en avant), ordre selon priorité */}
            {selections.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {selections.map((e, i) => (
                  <SelectionCard key={i} etab={e} lang={lang} t={t} />
                ))}
              </div>
            )}

            {/* Nos attractions principales (pages internes) */}
            {attractions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map((a) => (
                  <AttractionCard key={a.id} attraction={a} lang={lang} t={t} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── BLOC 1 — SUR GOOGLE (organique, neutre) ───────────────────── */}
        {etablissements.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                  </svg>
                  {t.activites.on_google}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{t.activites.on_google_sub}</p>
              </div>
              <a
                href={googleAllUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-quebec-blue hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                {t.activites.see_all_google} →
              </a>
            </div>

            <EtabExplorer items={etablissements} lang={lang} t={t} showRegion={false} />
          </section>
        )}

        {!hasSelection && etablissements.length === 0 && (
          <p className="text-gray-500 py-12 text-center">{t.activites.nothing}</p>
        )}

        <AvisSection type="activite" cible={theme} lang={lang} />
      </div>
    </>
  )
}

// Carte d'un établissement (ex. BARFLY) : mots-clés affichés SANS lien,
// un seul bouton vers la destination (ici recherche Google ; affiliation/page perso en Phase 3).
function EtablissementCard({ etab, lang, t }) {
  const lieu = etab.ville ?? etab.region ?? 'Québec'
  const manual = etab[`description_${lang}`] ?? etab.description_en ?? etab.description_fr ?? null
  const description = manual ?? autoDescription(etab)
  const tags = manual ? keywordTags(etab) : []  // mots-clés en plus seulement si description manuelle
  const placeUrl = mapsSearch(`"${etab.nom}" ${lieu} Québec`)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 p-5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 leading-snug">{etab.nom}</p>
        {etab.dist_km != null && (
          <span className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 whitespace-nowrap">
            {etab.dist_km} km
          </span>
        )}
      </div>

      {/* Localisation réelle (importante pour « Incontournables transversaux ») */}
      {lieu && (
        <p className="text-xs font-medium text-quebec-blue flex items-center gap-1">
          📍 {lieu}
        </p>
      )}

      {/* Description : manuelle (texte type Google) si dispo, sinon auto-générée */}
      {description && (
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      )}

      {/* Mots-clés : texte simple, AUCUN lien (volonté de Philippe) */}
      {tags.length > 0 && (
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {tags.join(' · ')}
        </p>
      )}

      <div className="mt-auto pt-1">
        <a
          href={placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-lg transition-colors"
        >
          📍 {t.activites.view_on_map} →
        </a>
      </div>
    </div>
  )
}

// Carte d'une SÉLECTION pilotée (Bloc 2) : photo, description, mots-clés en texte,
// et un seul bouton vers la destination choisie (affiliation `url`, page perso `page`,
// sinon recherche Google en attendant).
function SelectionCard({ etab, lang, t }) {
  const lieu = etab.ville ?? etab.region ?? 'Québec'
  const manual = etab[`description_${lang}`] ?? etab.description_en ?? etab.description_fr ?? null
  const description = manual ?? autoDescription(etab)
  const tags = keywordTags(etab)
  const img = etabPhoto(etab)

  const site = etab.site_web && etab.site_web.trim()
    ? (etab.site_web.startsWith('http') ? etab.site_web : `https://${etab.site_web}`)
    : null
  const isExternal = !!etab.url
  const dest = etab.url
    ? etab.url
    : etab.page
    ? `/${lang}/lieu/${etab.page}`
    : mapsSearch(`"${etab.nom}" ${lieu} Québec`)
  const ctaLabel = etab.url || etab.page
    ? t.detail.see_venue
    : t.activites.view_on_map

  // Photo cliquable → site officiel si connu, sinon page perso, sinon carte
  const photoHref = etab.url || site || (etab.page ? `/${lang}/lieu/${etab.page}` : mapsSearch(`"${etab.nom}" ${lieu} Québec`))
  const photoInternal = !etab.url && !site && !!etab.page
  const photoInner = (
    <>
      <Image src={img} alt={etab.nom} fill className="object-cover transition-transform duration-500 group-hover/photo:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-quebec-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
        ★ {t.detail.selection}
      </span>
      {etab.dist_km != null && (
        <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {etab.dist_km} km
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
        <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
          {photoInternal ? t.detail.view_page : t.detail.visit_site}
        </span>
      </span>
      <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold text-lg leading-snug drop-shadow-lg">{etab.nom}</h3>
    </>
  )

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col border border-amber-100">
      {/* Photo cliquable */}
      {photoInternal
        ? <Link href={photoHref} className="block relative h-44 overflow-hidden group/photo">{photoInner}</Link>
        : <a href={photoHref} target="_blank" rel="noopener noreferrer" className="block relative h-44 overflow-hidden group/photo">{photoInner}</a>}

      {/* Corps */}
      <div className="p-5 flex flex-col gap-2.5 flex-1">
        {lieu && (
          <p className="text-xs font-medium text-quebec-blue flex items-center gap-1">📍 {lieu}</p>
        )}
        {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
        {tags.length > 0 && (
          <p className="text-xs text-slate-500 uppercase tracking-wide">{tags.join(' · ')}</p>
        )}
        <div className="mt-auto pt-1">
          <a
            href={dest}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-quebec-blue hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            {ctaLabel} →
          </a>
        </div>
      </div>
    </div>
  )
}
