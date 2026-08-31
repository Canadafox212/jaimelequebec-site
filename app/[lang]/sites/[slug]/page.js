import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllAttractions, getAttractionBySlug, getNearbyAttractions, getActivitesForPage, getAttractionImageSrc, getActivityPhotoSrc } from '@/lib/attractions'
import { getRegions } from '@/lib/activites'
import AttractionCard from '@/components/AttractionCard'
import MapModal from '@/components/MapModal'
import ShareLieuButton from '@/components/ShareLieuButton'
import AddToRoadTripButton from '@/components/AddToRoadTripButton'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'
import { bookingSearchUrl } from '@/lib/affiliates'
import labelI18n from '@/data/activity-labels-i18n.json'
import servicesData from '@/data/services.json'
import animauxData from '@/data/animaux.json'
import pmrData from '@/data/pmr.json'

export async function generateStaticParams() {
  const attractions = getAllAttractions()
  return LANGS.flatMap((lang) =>
    attractions.map((a) => ({ lang, slug: a.slug }))
  )
}

function resolveContent(attraction, lang) {
  if (lang === 'fr') return { title: attraction.fr?.titre, summary: attraction.fr?.resume, fullText: attraction.fr?.texte_complet, category: attraction.fr?.categorie_thematique }
  if (lang === 'en') return { title: attraction.en?.title, summary: attraction.en?.summary, fullText: attraction.en?.full_text ?? attraction.fr?.texte_complet, category: attraction.en?.theme_category }
  const tr = attraction[lang]
  return {
    title:    tr?.titre  ?? tr?.title   ?? attraction.en?.title    ?? attraction.fr?.titre,
    summary:  tr?.resume ?? tr?.summary ?? attraction.en?.summary  ?? attraction.fr?.resume,
    fullText: tr?.texte_complet ?? tr?.full_text ?? attraction.en?.full_text ?? attraction.fr?.texte_complet ?? null,
    category: attraction.en?.theme_category ?? attraction.fr?.categorie_thematique,
  }
}

const BASE = 'https://jaimelequebec.org'

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const attraction = getAttractionBySlug(slug)
  if (!attraction) return {}
  const { title, summary: desc } = resolveContent(attraction, lang)
  const ogUrl = `${BASE}/api/og/site/${slug}?lang=${lang}`
  return {
    title: `${title} — J'aime le Québec`,
    description: desc,
    openGraph: {
      title: `${title} — J'aime le Québec`,
      description: desc,
      siteName: "J'aime le Québec",
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image' },
    alternates: getAlternates(`/sites/${slug}`),
  }
}

export default async function AttractionPage({ params }) {
  const { lang, slug } = await params
  const t = dicts[lang]
  const attraction = getAttractionBySlug(slug)
  if (!attraction) notFound()

  const nearby = getNearbyAttractions(attraction.id, 3)
  const { title, summary, fullText, category } = resolveContent(attraction, lang)
  const loc = attraction.localisation
  const contact = attraction.contact
  const ville = loc.ville ?? loc.region_touristique ?? 'Québec'
  const isFr = lang === 'fr'
  const { ete: activitesEte, hiver: activitesHiver } = getActivitesForPage(attraction)
  const regions = getRegions()
  const regionNum = regions.find(r => r.nom_fr === loc.region_touristique)?.num ?? null
  const regionUrl = regionNum ? `/${lang}/activites/${regionNum}` : `/${lang}/activites`
  const imageSrc = getAttractionImageSrc(slug)

  // Badge animaux — chercher si ce slug est dans l'inventaire
  const animauxInfo = animauxData.find(a => a.slug_attraction === slug) ?? null
  // Badge PMR — cote d'accessibilité Kéroul
  const pmrInfo = pmrData[slug] ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: title,
    description: summary,
    url: `${BASE}/${lang}/sites/${slug}`,
    ...(imageSrc ? { image: `${BASE}${imageSrc}` } : {}),
    ...(loc.latitude && loc.longitude ? {
      geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude }
    } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: ville,
      addressRegion: 'Québec',
      addressCountry: 'CA',
      ...(loc.adresse ? { streetAddress: loc.adresse } : {}),
    },
    ...(contact?.telephone ? { telephone: contact.telephone } : {}),
    ...(contact?.site_web ? { sameAs: `https://${contact.site_web}` } : {}),
    inLanguage: lang,
    touristType: category,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── HERO IMAGE ──────────────────────────────────────────────────── */}
      {imageSrc ? (
        <div className="relative w-full h-72 md:h-[26rem] overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Back link */}
          <div className="absolute top-4 left-4">
            <Link
              href={`/${lang}/sites`}
              className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-black/50 transition-colors"
            >
              ← {t.detail.back}
            </Link>
          </div>

          {/* Titre + méta superposés en bas */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">{loc.region_touristique}</span>
              <span className="text-white/40">·</span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                {category}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {title}
            </h1>
          </div>
        </div>
      ) : null}

      {/* Hero fallback quand pas de photo — dégradé bleu avec titre */}
      {!imageSrc && (
        <div className="bg-gradient-to-br from-quebec-navy to-quebec-blue px-4 pb-10 pt-6">
          <div className="max-w-4xl mx-auto">
            <Link href={`/${lang}/sites`} className="inline-block text-xs text-white/70 hover:text-white mb-4">
              ← {t.detail.back}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{loc.region_touristique}</span>
              <span className="text-white/40">·</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{category}</span>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h1>
              {loc.latitude && loc.longitude && (
                <MapModal lat={loc.latitude} lng={loc.longitude} zoom={13} regionName={ville} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* En-tête fallback (si pas d'image et pas de coords) */}
        {!imageSrc && (!loc.latitude || !loc.longitude) && (
          <>
            <Link href={`/${lang}/sites`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-quebec-blue transition-colors mb-8">
              ← {t.detail.back}
            </Link>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-quebec-red">{loc.region_touristique}</span>
                <span className="text-slate-300">·</span>
                <span className="inline-block bg-blue-50 text-quebec-blue text-xs font-semibold px-3 py-1 rounded-full">{category}</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight">{title}</h1>
            </div>
          </>
        )}

        {/* Badge animaux */}
        {animauxInfo && (
          <Link
            href={`/${lang}/animaux`}
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-semibold border transition-colors no-underline ${
              animauxInfo.chiens === 'OUI'     ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100' :
              animauxInfo.chiens === 'PARTIEL' ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' :
                                                 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <span>{animauxInfo.chiens === 'OUI' ? '🐕' : animauxInfo.chiens === 'PARTIEL' ? '⚠️' : '🚫'}</span>
            <span>
              {lang === 'fr'
                ? animauxInfo.chiens === 'OUI'     ? 'Chiens acceptés'
                : animauxInfo.chiens === 'PARTIEL' ? 'Accès partiel — animaux'
                :                                    'Chiens interdits'
                : animauxInfo.chiens === 'OUI'     ? 'Dogs welcome'
                : animauxInfo.chiens === 'PARTIEL' ? 'Partial pet access'
                :                                    'Dogs forbidden'
              }
            </span>
            {animauxInfo.laisse_m > 0 && (
              <span className="opacity-70 font-normal">· laisse {animauxInfo.laisse_m} m max</span>
            )}
          </Link>
        )}

        {/* Badge PMR */}
        {pmrInfo && (
          <a
            href={pmrInfo.url_keroul}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-semibold border transition-colors no-underline ${
              pmrInfo.cote === 'Accessible'
                ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
            }`}
          >
            <span>♿</span>
            <span>
              {lang === 'fr'
                ? pmrInfo.cote === 'Accessible' ? 'Accessible PMR (certifié Kéroul)' : 'Partiellement accessible (certifié Kéroul)'
                : pmrInfo.cote === 'Accessible' ? 'Wheelchair accessible (Kéroul certified)' : 'Partially accessible (Kéroul certified)'
              }
            </span>
            <span className="opacity-50 text-xs">↗</span>
          </a>
        )}

        {/* Résumé */}
        <p className="text-xl text-gray-600 leading-relaxed mb-6 border-l-4 border-quebec-red pl-5 italic font-light">
          {summary}
        </p>

        {/* Boutons d'action : partage + road trip */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          <ShareLieuButton slug={slug} title={title} lang={lang} t={t} />
          {loc.latitude && loc.longitude && (
            <AddToRoadTripButton
              slug={slug}
              title={title}
              lat={loc.latitude}
              lng={loc.longitude}
              image={imageSrc}
              lang={lang}
              t={t.planifier}
            />
          )}
        </div>

        {/* Bouton carte — toujours visible si coords disponibles */}
        {loc.latitude && loc.longitude && (
          <div className="mb-10">
            <MapModal lat={loc.latitude} lng={loc.longitude} zoom={13} regionName={ville} light={true} />
          </div>
        )}

        {/* Texte complet */}
        {fullText && (
          <div className="mb-10 text-gray-700 leading-relaxed text-base space-y-4 whitespace-pre-line">
            {fullText}
          </div>
        )}

        {/* Infos pratiques */}
        {(loc.adresse || contact?.telephone || contact?.site_web) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-10 grid sm:grid-cols-2 gap-5 text-sm">
            {loc.adresse && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.address}</p>
                <p className="text-gray-800">{loc.adresse}</p>
              </div>
            )}
            {contact?.telephone && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.phone}</p>
                <a href={`tel:${contact.telephone}`} className="text-gray-800 hover:text-quebec-blue transition-colors font-medium">
                  {contact.telephone}
                </a>
              </div>
            )}
            {contact?.site_web && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.website}</p>
                <a
                  href={contact.site_web.startsWith('http') ? contact.site_web : `https://${contact.site_web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-quebec-blue hover:underline break-all font-medium"
                >
                  {contact.site_web}
                </a>
              </div>
            )}
          </div>
        )}



        {/* ── EN SAVOIR + SUR LA RÉGION ─────────────────────────────────── */}
        {loc.region_touristique && loc.region_touristique !== 'Incontournables transversaux' && (
          <details className="group mb-10">
            <summary className="cursor-pointer list-none flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-100 transition-colors">
              <span className="font-bold text-xs uppercase tracking-widest text-quebec-navy">
                {isFr ? `En savoir + sur ${loc.region_touristique}` : `Learn more about ${loc.region_touristique}`}
              </span>
              <span className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-500 text-base font-bold shadow-sm shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 text-sm text-gray-700">
              <p className="mb-4 text-gray-600 leading-relaxed">
                {isFr
                  ? `Activités estivales et hivernales, attraits touristiques, restaurants et hébergements — explorez tout ce que ${loc.region_touristique} a à offrir.`
                  : `Summer and winter activities, tourist attractions, restaurants and accommodations — explore all that ${loc.region_touristique} has to offer.`}
              </p>
              <Link
                href={regionUrl}
                className="inline-block bg-quebec-blue text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
              >
                {isFr ? `Explorer la région →` : `Explore the region →`}
              </Link>
            </div>
          </details>
        )}

        {/* ── HÉBERGEMENTS À PROXIMITÉ ───────────────────────────────────── */}
        {attraction.hebergement && Object.values(attraction.hebergement).some(v => v?.length > 0) && (
          <section className="mb-12">
            <SectionTitle emoji="🏨" label={isFr ? 'Hébergements à proximité' : 'Nearby accommodations'} />
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { key: 'economique', label_fr: 'Économique',   label_en: 'Budget',    color: 'green'  },
                { key: 'confort',    label_fr: 'Confort',      label_en: 'Comfort',   color: 'blue'   },
                { key: 'haut_gamme', label_fr: 'Haut de gamme', label_en: 'Luxury',   color: 'amber'  },
              ].map(({ key, label_fr, label_en, color }) => {
                const list = attraction.hebergement[key]
                if (!list?.length) return null
                const colorMap = {
                  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
                  blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500'  },
                  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
                }
                const c = colorMap[color]
                return (
                  <div key={key} className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full self-start ${c.badge}`}>
                      {isFr ? label_fr : label_en}
                    </span>
                    {list.map((h, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${c.dot}`} />
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{h.nom}</p>
                        </div>
                        {h.type && <p className="text-xs text-gray-500 ml-4">{h.type}{h.dist_km ? ` · ${h.dist_km} km` : ''}</p>}
                        <div className="ml-4 flex flex-wrap gap-2 mt-0.5">
                          {h.tel && (
                            <a href={`tel:${h.tel}`} className="text-xs text-gray-600 hover:text-quebec-blue transition-colors">
                              ☎ {h.tel}
                            </a>
                          )}
                          {h.web && (
                            <a href={h.web.startsWith('http') ? h.web : `https://${h.web}`} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-quebec-blue hover:underline font-medium">
                              🌐 {isFr ? 'Site web' : 'Website'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── BOOKING.COM ────────────────────────────────────────────────── */}
        <section className="mb-12 bg-[#003580] rounded-2xl px-6 py-7 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
              {isFr ? 'Hébergement à proximité' : 'Accommodation nearby'}
            </p>
            <p className="text-white font-bold text-lg leading-snug">
              {isFr ? `Trouvez un hôtel à ${ville}` : `Find a hotel in ${ville}`}
            </p>
            <p className="text-blue-200 text-sm mt-0.5">
              {isFr ? 'Comparez et réservez via Booking.com' : 'Compare and book via Booking.com'}
            </p>
          </div>
          <a
            href={bookingSearchUrl(ville, lang)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="shrink-0 inline-block bg-white text-[#003580] font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-md text-sm whitespace-nowrap"
          >
            {isFr ? 'Voir les hébergements →' : 'Search accommodation →'}
          </a>
        </section>

        {/* Activités été */}
        {activitesEte.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                ☀️ {t.detail.activities_summer}
              </div>
              <span className="text-xs text-gray-400">{activitesEte.length} {t.detail.nearby_options} · {t.detail.distance_from_site}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {activitesEte.map((a, i) => <ActivityCard key={i} activity={a} season="ete" lang={lang} ville={ville} t={t} siteWeb={servicesData[a.nom]?.site_web ?? null} />)}
            </div>
          </section>
        )}

        {/* Activités hiver */}
        {activitesHiver.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-700 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                ❄️ {t.detail.activities_winter}
              </div>
              <span className="text-xs text-gray-400">{activitesHiver.length} {t.detail.nearby_options} · {t.detail.distance_from_site}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {activitesHiver.map((a, i) => <ActivityCard key={i} activity={a} season="hiver" lang={lang} ville={ville} t={t} siteWeb={servicesData[a.nom]?.site_web ?? null} />)}
            </div>
          </section>
        )}

        {/* Attractions à proximité */}
        {nearby.length > 0 && (
          <section className="mb-10">
            <SectionTitle emoji="📍" label={t.detail.nearby} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {nearby.map((a) => (
                <div key={a.id} className="relative">
                  <AttractionCard attraction={a} lang={lang} t={t} />
                  <span className="absolute top-14 right-3 bg-white/95 text-xs font-semibold text-slate-600 px-2 py-0.5 rounded-full shadow-sm">
                    {a.distanceKm} {t.detail.distance}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  )
}

function SectionTitle({ emoji, label }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
      <span>{emoji}</span> {label}
    </h2>
  )
}

function getActivityFallback(type) {
  const t = (type ?? '').toLowerCase()
  if (t.includes('bar') || t.includes('boîte') || t.includes('nuit') || t.includes('cabaret')) return '/images/fallbacks/bar.webp'
  if (t.includes('casino') || t.includes('hippodrome')) return '/images/fallbacks/casino.webp'
  if (t.includes('spa') || t.includes('santé')) return '/images/fallbacks/spa.webp'
  if (t.includes('ski alpin') || t.includes('planche')) return '/images/fallbacks/ski-alpin.webp'
  if (t.includes('ski de fond') || t.includes('raquette') || t.includes('glissoire')) return '/images/fallbacks/ski-fond.webp'
  if (t.includes('patinoire')) return '/images/fallbacks/patinoire.webp'
  if (t.includes('golf')) return '/images/fallbacks/golf.webp'
  if (t.includes('vélo') || t.includes('velo') || t.includes('fatbike')) return '/images/fallbacks/velo.webp'
  if (t.includes('jardin') || t.includes('zoologique')) return '/images/fallbacks/jardin.webp'
  if (t.includes('marina') || t.includes('plaisance')) return '/images/fallbacks/marina.webp'
  if (t.includes('plage')) return '/images/fallbacks/plage.webp'
  if (t.includes('pêche') || t.includes('peche') || t.includes('faunique') || t.includes('zec')) return '/images/fallbacks/peche.webp'
  if (t.includes('équestre') || t.includes('cheval')) return '/images/fallbacks/equestre.webp'
  if (t.includes('karting') || t.includes('motorisé') || t.includes('autodrome')) return '/images/fallbacks/karting.webp'
  if (t.includes('parc') || t.includes('réserve') || t.includes('site naturel') || t.includes('belvédère') || t.includes('caverne') || t.includes('piste') || t.includes('sentier')) return '/images/fallbacks/parc.webp'
  return '/images/fallbacks/sport.webp'
}

// Activités praticables uniquement l'été (à retirer des fiches hiver)
const SUMMER_ONLY = [
  'chaloupe', 'rame', 'aviron', 'canot', 'canoë', 'canoe', 'kayak', 'pédalo', 'pedalo',
  'pagaie', 'rabaska', 'rafting', 'baignade', 'plage', 'kite', 'voile', 'plongée', 'plongee',
  'paddle', 'vélo', 'velo', 'véloroute', 'cyclisme', 'golf', 'tubing', 'wakeboard',
  'ponton', 'croisière', 'croisiere', 'descente de rivière', 'ski nautique', 'jet ski',
  'planche à voile', 'camping estival',
]
// Activités praticables uniquement l'hiver (à retirer des fiches été)
const WINTER_ONLY = [
  'motoneige', 'traîneau', 'traineau', 'luge', 'glissade', 'glissoire', 'raquette',
  'snowboard', 'fatbike', 'ski alpin', 'ski de fond', 'ski de randonnée', 'ski hors-piste',
  'station de ski', 'centre de ski', 'patinoire', 'patinage sur glace', 'patin à glace',
  'surf des neiges', 'planche à neige', 'pêche blanche', 'pêche sur glace', 'pêche sur la glace',
]

// Découpe une chaîne en mots (gère les accents français)
function wordsOf(str) {
  return (str ?? '').toLowerCase().split(/[^a-zàâäéèêëîïôöùûüçœ]+/).filter(Boolean)
}

// Vrai si le texte contient le mot-clé en tant que mot entier (ou phrase exacte).
// Compare mot par mot pour éviter que « nage » corresponde à « patinage ».
function hasKeyword(text, keyword) {
  if (keyword.includes(' ')) return text.toLowerCase().includes(keyword)
  return wordsOf(text).some(w => w === keyword || w.startsWith(keyword))
}

function filterBySeason(acts, season) {
  if (season === 'hiver') return acts.filter(a => !SUMMER_ONLY.some(k => hasKeyword(a, k)))
  if (season === 'ete')   return acts.filter(a => !WINTER_ONLY.some(k => hasKeyword(a, k)))
  return acts
}

function deduplicateActs(arr) {
  const seen = new Set()
  return arr.filter(a => {
    const key = a.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildActivityEtabUrl(lang, activity, ville, acts) {
  const p = new URLSearchParams()
  p.set('nom', activity.nom)
  p.set('place', ville ?? 'Québec')
  if (acts.length) p.set('labels', acts.join('|'))
  return `/${lang}/etab?${p.toString()}`
}

function ActivityCard({ activity, season, lang, ville, t, siteWeb }) {
  const fromActivites = activity.activites
    ? activity.activites.split('|').map(s => s.trim()).filter(s => s.length > 2 && s !== 'nan')
    : []
  const fromType = activity.type ? [activity.type] : []
  const acts = filterBySeason(deduplicateActs([...fromType, ...fromActivites]), season)

  const { emoji, tagBg } = getActivityStyle(activity.type, season)
  const fallbackImg = getActivityFallback(activity.type)
  let activityPhoto = null
  for (const label of acts) {
    const src = getActivityPhotoSrc(label)
    if (src) { activityPhoto = src; break }
  }
  const displayImg = activityPhoto ?? fallbackImg
  const tr = (s) => (lang !== 'fr' && lang !== 'en' ? labelI18n[s]?.[lang] : null) ?? s
  const typeLabel = tr(activity.type ?? (season === 'ete' ? t.detail.activity_summer : t.detail.activity_winter))
  const lieu = ville ?? 'Québec'
  const etabUrl = buildActivityEtabUrl(lang, activity, lieu, acts)

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Photo de fond bien visible, titre superposé en bas */}
      <div className="relative h-44 overflow-hidden">
        {displayImg.endsWith('.svg') ? (
          <img src={displayImg} alt={typeLabel} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Image
            src={displayImg}
            alt={typeLabel}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
          <span>{emoji}</span>
          <span className="truncate max-w-[10rem]">{typeLabel}</span>
        </span>

        {activity.dist_km != null && (
          <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10">
            📍 {activity.dist_km} km
          </span>
        )}

        <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold text-base leading-snug drop-shadow-lg z-10">
          {activity.nom}
        </h3>
      </div>

      {/* Corps */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {acts.length > 0 && (
          <p className="text-xs text-slate-500 uppercase tracking-wide leading-relaxed">
            {acts.map(tr).join(' · ')}
          </p>
        )}
        <div className="mt-auto pt-1 flex flex-wrap items-center gap-3 relative z-10">
          {siteWeb && (
            <a
              href={siteWeb.startsWith('http') ? siteWeb : `https://${siteWeb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-quebec-blue hover:bg-quebec-navy px-3 py-1.5 rounded-full transition-colors"
            >
              🌐 {lang === 'fr' ? 'Site web' : 'Website'}
            </a>
          )}
          <span className="flex items-center gap-1 text-xs font-bold text-quebec-blue group-hover:text-blue-800 transition-colors">
            {lang === 'fr' ? 'Voir les activités →' : 'View activities →'}
          </span>
        </div>
      </div>

      {/* Lien couvrant toute la carte (z-0, sous les boutons) */}
      <Link href={etabUrl} className="absolute inset-0 z-0" aria-label={activity.nom} />
    </div>
  )
}

function getActivityStyle(type, season) {
  const t = (type ?? '').toLowerCase()

  if (t.includes('bar') || t.includes('boîte') || t.includes('nuit') || t.includes('cabaret') || t.includes('brasserie'))
    return { emoji: '🍸', gradient: 'bg-gradient-to-r from-purple-600 to-purple-800',   tagBg: 'bg-purple-100 text-purple-700' }
  if (t.includes('patinoire') || t.includes('glace'))
    return { emoji: '⛸️', gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600',       tagBg: 'bg-cyan-100 text-cyan-700' }
  if (t.includes('ski') || t.includes('neige'))
    return { emoji: '⛷️', gradient: 'bg-gradient-to-r from-indigo-500 to-blue-700',     tagBg: 'bg-indigo-100 text-indigo-700' }
  if (t.includes('parc') || t.includes('jardin') || t.includes('nature') || t.includes('forêt'))
    return { emoji: '🌳', gradient: 'bg-gradient-to-r from-emerald-500 to-green-700',   tagBg: 'bg-emerald-100 text-emerald-700' }
  if (t.includes('sport') || t.includes('aventure') || t.includes('plein-air') || t.includes('récréatif') || t.includes('activit'))
    return { emoji: '🏕️', gradient: 'bg-gradient-to-r from-teal-500 to-teal-700',       tagBg: 'bg-teal-100 text-teal-700' }
  if (t.includes('musée') || t.includes('galerie') || t.includes('expo') || t.includes('patrimoine'))
    return { emoji: '🏛️', gradient: 'bg-gradient-to-r from-amber-600 to-amber-800',     tagBg: 'bg-amber-100 text-amber-700' }
  if (t.includes('théâtre') || t.includes('cinéma') || t.includes('spectacle') || t.includes('concert') || t.includes('salle'))
    return { emoji: '🎭', gradient: 'bg-gradient-to-r from-rose-500 to-rose-700',       tagBg: 'bg-rose-100 text-rose-700' }
  if (t.includes('resto') || t.includes('restaurant') || t.includes('café') || t.includes('gastr'))
    return { emoji: '🍽️', gradient: 'bg-gradient-to-r from-orange-500 to-red-500',      tagBg: 'bg-orange-100 text-orange-700' }
  if (t.includes('spa') || t.includes('bien-être') || t.includes('massage') || t.includes('santé'))
    return { emoji: '🧖', gradient: 'bg-gradient-to-r from-pink-400 to-rose-500',       tagBg: 'bg-pink-100 text-pink-700' }
  if (t.includes('golf'))
    return { emoji: '⛳', gradient: 'bg-gradient-to-r from-green-500 to-emerald-700',   tagBg: 'bg-green-100 text-green-700' }
  if (t.includes('croisière') || t.includes('bateau') || t.includes('kayak') || t.includes('nautique') || t.includes('marina'))
    return { emoji: '⛵', gradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',       tagBg: 'bg-cyan-100 text-cyan-700' }
  if (t.includes('vélo') || t.includes('cyclisme'))
    return { emoji: '🚴', gradient: 'bg-gradient-to-r from-lime-500 to-green-600',      tagBg: 'bg-lime-100 text-lime-700' }
  if (t.includes('équestre') || t.includes('cheval'))
    return { emoji: '🐎', gradient: 'bg-gradient-to-r from-amber-500 to-yellow-600',    tagBg: 'bg-amber-100 text-amber-700' }
  if (t.includes('chasse') || t.includes('pêche'))
    return { emoji: '🎣', gradient: 'bg-gradient-to-r from-stone-500 to-stone-700',     tagBg: 'bg-stone-100 text-stone-600' }

  return season === 'hiver'
    ? { emoji: '❄️', gradient: 'bg-gradient-to-r from-slate-500 to-slate-700',          tagBg: 'bg-slate-100 text-slate-600' }
    : { emoji: '🌟', gradient: 'bg-gradient-to-r from-slate-500 to-slate-700',          tagBg: 'bg-slate-100 text-slate-600' }
}
