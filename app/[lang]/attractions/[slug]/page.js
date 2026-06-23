import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllAttractions, getAttractionBySlug, getNearbyAttractions, getServiceImageSrc } from '@/lib/attractions'
import AttractionCard from '@/components/AttractionCard'
import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'

const dicts = { fr, en }

export async function generateStaticParams() {
  const attractions = getAllAttractions()
  return ['fr', 'en'].flatMap((lang) =>
    attractions.map((a) => ({ lang, slug: a.slug }))
  )
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const attraction = getAttractionBySlug(slug)
  if (!attraction) return {}
  const title = lang === 'fr' ? attraction.fr.titre : attraction.en.title
  const desc = lang === 'fr' ? attraction.fr.resume : attraction.en.summary
  return { title: `${title} — J'aime le Québec`, description: desc }
}

export default async function AttractionPage({ params }) {
  const { lang, slug } = await params
  const t = dicts[lang]
  const attraction = getAttractionBySlug(slug)
  if (!attraction) notFound()

  const nearby = getNearbyAttractions(attraction.id, 3)
  const content = lang === 'fr' ? attraction.fr : attraction.en
  const title = lang === 'fr' ? content.titre : content.title
  const summary = lang === 'fr' ? content.resume : content.summary
  const fullText = lang === 'fr' ? content.texte_complet : (content.full_text ?? content.texte_complet ?? null)
  const category = lang === 'fr' ? content.categorie_thematique : content.theme_category
  const loc = attraction.localisation
  const contact = attraction.contact
  const heb = attraction.hebergement ?? {}
  const restaurants = attraction.restaurants_proximite ?? []
  const activitesEte = attraction.activites?.ete ?? []
  const activitesHiver = attraction.activites?.hiver ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Fil d'Ariane */}
      <Link href={`/${lang}/attractions`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-quebec-blue transition-colors mb-8">
        ← {t.detail.back}
      </Link>

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-quebec-red">{loc.region_touristique}</span>
          <span className="text-slate-300">·</span>
          <span className="inline-block bg-blue-50 text-quebec-blue text-xs font-semibold px-3 py-1 rounded-full">{category}</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight">{title}</h1>
      </div>

      {/* Résumé */}
      <p className="text-xl text-gray-600 leading-relaxed mb-10 border-l-4 border-quebec-red pl-5 italic font-light">
        {summary}
      </p>

      {/* Texte complet */}
      {fullText && (
        <div className="mb-10 text-gray-700 leading-relaxed text-base space-y-4 whitespace-pre-line">
          {fullText}
        </div>
      )}

      {/* Infos pratiques */}
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
            <p className="text-gray-800">{contact.telephone}</p>
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

      {/* ── BLOCS AFFILIATION ──────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">

        {/* Booking.com */}
        <div className="rounded-2xl overflow-hidden border border-blue-100 shadow-card">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏨</span>
              <div>
                <p className="font-bold text-base">{t.detail.accommodation}</p>
                <p className="text-blue-200 text-xs">via Booking.com</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              {lang === 'fr'
                ? 'Hôtels, B&B et appartements à proximité aux meilleurs prix.'
                : 'Hotels, B&Bs and apartments nearby at the best prices.'}
            </p>
          </div>
          <div className="bg-white p-4">
            <button disabled className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-sm opacity-50 cursor-not-allowed">
              {lang === 'fr' ? 'Voir les disponibilités — bientôt disponible' : 'Check availability — coming soon'}
            </button>
          </div>
        </div>

        {/* GetYourGuide */}
        <div className="rounded-2xl overflow-hidden border border-amber-100 shadow-card">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-base">{t.detail.activities_summer.replace(' — Été', '').replace(' — Summer', '')}</p>
                <p className="text-amber-100 text-xs">via GetYourGuide · Viator</p>
              </div>
            </div>
            <p className="text-amber-100 text-sm">
              {lang === 'fr'
                ? 'Visites guidées, excursions et expériences réservables en ligne.'
                : 'Guided tours, excursions and bookable experiences.'}
            </p>
          </div>
          <div className="bg-white p-4">
            <button disabled className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl text-sm opacity-50 cursor-not-allowed">
              {lang === 'fr' ? 'Explorer les activités — bientôt disponible' : 'Explore activities — coming soon'}
            </button>
          </div>
        </div>

      </div>

      {/* Hébergements */}
      {(heb.economique?.length || heb.confort?.length || heb.haut_gamme?.length) ? (
        <section className="mb-12">
          <SectionTitle emoji="🏨" label={t.detail.accommodation} />
          <div className="space-y-6">
            {[
              { key: 'economique', label: t.detail.budget,  icon: '💚', bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
              { key: 'confort',    label: t.detail.comfort,  icon: '💙', bg: 'bg-blue-50',    border: 'border-blue-100',    badge: 'bg-blue-100 text-blue-700'       },
              { key: 'haut_gamme', label: t.detail.luxury,   icon: '⭐', bg: 'bg-amber-50',   border: 'border-amber-100',   badge: 'bg-amber-100 text-amber-800'     },
            ].map(({ key, label, icon, bg, border, badge }) =>
              heb[key]?.length ? (
                <div key={key}>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    <span>{icon}</span> {label}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {heb[key].map((h, i) => (
                      <HotelCard key={i} place={h} bg={bg} border={border} badge={badge} badgeLabel={label} lang={lang} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </section>
      ) : null}

      {/* Restaurants */}
      {restaurants.length > 0 && (
        <section className="mb-12">
          <SectionTitle emoji="🍽️" label={t.detail.restaurants} />
          <div className="grid sm:grid-cols-2 gap-3">
            {restaurants.map((r, i) => <RestaurantCard key={i} place={r} lang={lang} />)}
          </div>
        </section>
      )}

      {/* Activités été */}
      {activitesEte.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
              ☀️ {t.detail.activities_summer}
            </div>
            <span className="text-xs text-gray-400">{activitesEte.length} {lang === 'fr' ? 'options à proximité' : 'nearby options'}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {activitesEte.map((a, i) => <ActivityCard key={i} activity={a} season="ete" lang={lang} />)}
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
            <span className="text-xs text-gray-400">{activitesHiver.length} {lang === 'fr' ? 'options à proximité' : 'nearby options'}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {activitesHiver.map((a, i) => <ActivityCard key={i} activity={a} season="hiver" lang={lang} />)}
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
  )
}

function SectionTitle({ emoji, label }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
      <span>{emoji}</span> {label}
    </h2>
  )
}

function getHotelFallback(type) {
  const t = (type ?? '').toLowerCase()
  if (t.includes('camping') || t.includes('camp')) return '/images/fallbacks/camping.webp'
  if (t.includes('auberge')) return '/images/fallbacks/auberge.webp'
  if (t.includes('motel')) return '/images/fallbacks/motel.webp'
  if (t.includes('gîte') || t.includes('gite') || t.includes('chambre') || t.includes('chalet') || t.includes('bed')) return '/images/fallbacks/gite.webp'
  return '/images/fallbacks/hotel.svg'
}

function getRestaurantFallback(type) {
  const t = (type ?? '').toLowerCase()
  if (t.includes('bar') || t.includes('pub') || t.includes('brasserie') || t.includes('taverne')) return '/images/fallbacks/bar.webp'
  if (t.includes('café') || t.includes('cafe') || t.includes('bistro')) return '/images/fallbacks/cafe.webp'
  return '/images/fallbacks/restaurant.webp'
}

function HotelCard({ place, bg, border, badge, badgeLabel, lang }) {
  const href = place.web
    ? (place.web.startsWith('http') ? place.web : `https://${place.web}`)
    : null
  const imageSrc = getServiceImageSrc(place.nom) ?? getHotelFallback(place.type)

  return (
    <div className={`rounded-xl border ${border} overflow-hidden flex flex-col shadow-sm hover:shadow-card transition-all duration-200`}>

      {/* Zone photo */}
      <div className="relative h-36 bg-gray-100">
        <Image
          src={imageSrc}
          alt={place.nom}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm ${badge}`}>{badgeLabel}</span>
        </div>
        {place.dist_km != null && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {place.dist_km} km
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={`${bg} p-4 flex flex-col gap-3 flex-1`}>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-snug">{place.nom}</p>
          {place.type && (
            <p className="text-gray-500 text-xs mt-0.5">
              {place.type}{place.ville ? ` · ${place.ville}` : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {place.tel && (
            <a
              href={`tel:${place.tel.replace(/[\s\-().]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-quebec-blue bg-white border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              📞 <span>{place.tel}</span>
            </a>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-quebec-blue hover:bg-blue-800 rounded-lg px-3 py-1.5 transition-colors"
            >
              {lang === 'fr' ? "Voir l'établissement" : 'View property'} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function RestaurantCard({ place, lang }) {
  const href = place.web
    ? (place.web.startsWith('http') ? place.web : `https://${place.web}`)
    : null
  const imageSrc = getServiceImageSrc(place.nom) ?? getRestaurantFallback(place.type)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:border-orange-100 hover:shadow-card transition-all duration-200 flex flex-col">

      {/* Zone photo */}
      <div className="relative h-36">
        <Image
          src={imageSrc}
          alt={place.nom}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        {(place.cuisine || place.type) && (
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-orange-500/90 backdrop-blur-sm text-white font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
              {place.cuisine ?? place.type}
            </span>
          </div>
        )}
        {place.dist_km != null && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {place.dist_km} km
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="font-bold text-gray-900 text-sm leading-snug">{place.nom}</p>
        <div className="flex flex-wrap gap-2">
          {place.tel && (
            <a
              href={`tel:${place.tel.replace(/[\s\-().]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600 bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              📞 <span>{place.tel}</span>
            </a>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              {lang === 'fr' ? 'Site web' : 'Website'} →
            </a>
          )}
        </div>
      </div>
    </div>
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

function ActivityCard({ activity, season, lang }) {
  const acts = activity.activites
    ? activity.activites.split('|').map(s => s.trim()).filter(s => s && s !== 'nan')
    : []

  const { emoji, gradient, tagBg } = getActivityStyle(activity.type, season)
  const fallbackImg = getActivityFallback(activity.type)
  const typeLabel = activity.type ?? (season === 'ete' ? (lang === 'fr' ? 'Activité été' : 'Summer activity') : (lang === 'fr' ? 'Activité hiver' : 'Winter activity'))

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* Photo avec gradient overlay */}
      <div className="relative h-36 overflow-hidden">
        {fallbackImg.endsWith('.svg') ? (
          <img src={fallbackImg} alt={typeLabel} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Image
            src={fallbackImg}
            alt={typeLabel}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        <div className={`absolute inset-0 ${gradient} opacity-80`} />
        <div className="absolute inset-0 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{emoji}</span>
            <span className="text-white text-xs font-bold uppercase tracking-wide truncate drop-shadow">
              {typeLabel}
            </span>
          </div>
          {activity.dist_km != null && (
            <span className="bg-black/30 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap backdrop-blur-sm">
              📍 {activity.dist_km} km
            </span>
          )}
        </div>
      </div>

      {/* Corps */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="font-bold text-gray-900 text-base leading-snug">{activity.nom}</p>

        {acts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {acts.map((a, i) => (
              <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagBg}`}>
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg opacity-70">
            {lang === 'fr' ? 'En savoir plus' : 'Learn more'} →
          </span>
        </div>
      </div>
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

  // Défaut par saison
  return season === 'hiver'
    ? { emoji: '❄️', gradient: 'bg-gradient-to-r from-slate-500 to-slate-700',          tagBg: 'bg-slate-100 text-slate-600' }
    : { emoji: '🌟', gradient: 'bg-gradient-to-r from-slate-500 to-slate-700',          tagBg: 'bg-slate-100 text-slate-600' }
}
