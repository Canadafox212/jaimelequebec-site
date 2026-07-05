'use client'
import Link from 'next/link'
import Image from 'next/image'
import labelI18n from '@/data/activity-labels-i18n.json'

function etabPhoto(activityPhoto, photo, type) {
  if (activityPhoto) return activityPhoto
  if (photo) return photo
  const t = (type ?? '').toLowerCase()
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

function buildEtabUrl(lang, etab, displayPlace) {
  const p = new URLSearchParams()
  p.set('nom', etab.nom)
  p.set('place', etab.ville ?? displayPlace)
  if (etab.labels?.length) p.set('labels', etab.labels.join('|'))
  const site = etab.site_web?.trim()
  if (site) p.set('site', site.startsWith('http') ? site : `https://${site}`)
  return `/${lang}/etab?${p.toString()}`
}

export default function EtabCard({ etab, lang, t, lieu, badge }) {
  const img = etabPhoto(etab.activity_photo, etab.photo, etab.type)
  const place = lieu ?? etab.ville ?? (lang === 'fr' ? etab.region_fr : etab.region_en) ?? 'Québec'
  const description = etab[`description_${lang}`] ?? etab.description_en ?? etab.description_fr ?? null
  const translateLabel = (l) => (lang !== 'fr' && lang !== 'en' ? labelI18n[l]?.[lang] : null) ?? l
  const rawLabels = [etab.type, ...(etab.labels || [])].filter(Boolean)
  const seen = new Set()
  const tags = rawLabels
    .filter((l) => { const k = l.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
    .slice(0, 4)
    .map(translateLabel)

  const etabUrl = buildEtabUrl(lang, etab, place)
  const pageUrl = etab.page ? `/${lang}/lieu/${etab.page}` : null
  const detailLabel = lang === 'fr' ? 'Information détaillée ↗' : 'Detailed info ↗'

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer">
      {/* Lien étiré couvrant toute la carte */}
      <Link href={etabUrl} className="absolute inset-0 z-10" aria-label={etab.nom} />

      {/* Photo */}
      <div className="relative h-40 overflow-hidden">
        <Image src={img} alt={etab.nom} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {badge && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-quebec-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{badge}</span>
        )}
        {etab.dist_km != null && (
          <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">{etab.dist_km} km</span>
        )}
        <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold text-base leading-snug drop-shadow-lg">{etab.nom}</h3>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs font-medium text-quebec-blue">📍 {place}</p>
        {description
          ? <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{description}</p>
          : (tags.length > 0 && <p className="text-xs text-slate-500 uppercase tracking-wide">{tags.join(' · ')}</p>)}

        {pageUrl && (
          <div className="mt-auto pt-2">
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-quebec-navy hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              {detailLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
