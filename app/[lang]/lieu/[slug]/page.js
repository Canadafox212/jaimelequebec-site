import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getServiceByPage, findEtablissement } from '@/lib/activites'
import MapEmbed from '@/components/MapEmbed'
import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'

const dicts = { fr, en }

function mapsSearch(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&t=h`
}

// Photo de repli selon le type (réutilise /images/fallbacks)
function etabPhoto(photo, type) {
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

function keywordTags(type, labels) {
  const raw = []
  if (type) raw.push(...type.split(/[,/]/))
  for (const l of labels || []) raw.push(...l.split(/[,/]/))
  const seen = new Set(), out = []
  for (let w of raw) { w = w.trim(); if (w.length > 1) { const k = w.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(w) } } }
  return out
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const svc = getServiceByPage(slug)
  if (!svc) return {}
  const desc = lang === 'fr' ? svc.description_fr : svc.description_en
  return { title: `${svc.nom} — J'aime le Québec`, description: desc ?? undefined }
}

export default async function LieuPage({ params }) {
  const { lang, slug } = await params
  const t = dicts[lang]
  const svc = getServiceByPage(slug)
  if (!svc) notFound()

  const info = findEtablissement(svc.nom) ?? {}
  const lieu = svc.ville ?? info.ville ?? info.region ?? 'Québec'
  const intro = lang === 'fr' ? svc.description_fr : svc.description_en
  const corps = lang === 'fr' ? svc.page_contenu_fr : svc.page_contenu_en
  const paragraphes = (corps ?? '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const photo = etabPhoto(svc.photo, info.type)
  const tags = keywordTags(info.type, info.labels)

  const site = svc.site_web && svc.site_web.trim()
    ? (svc.site_web.startsWith('http') ? svc.site_web : `https://${svc.site_web}`)
    : null
  const cta = svc.url || site
  const mapsUrl = mapsSearch(`"${svc.nom}" ${lieu} Québec`)

  // Visibilité publique par champ (défauts : contacts publics, courriel privé)
  const vis = svc.visibilite || {}
  const showAdresse = svc.adresse && vis.adresse !== false
  const showTel = svc.telephone && vis.telephone !== false
  const showSite = site && vis.site_web !== false
  const showMail = svc.courriel && vis.courriel === true
  const hasContact = showAdresse || showTel || showSite || showMail

  return (
    <>
      {/* Hero */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        <Image src={photo} alt={svc.nom} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link
            href={`/${lang}/activites`}
            className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-black/50 transition-colors"
          >
            {t.activites.back_regions}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1 bg-quebec-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm mb-3">
            ★ {lang === 'fr' ? 'Sélection' : 'Featured'}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">{svc.nom}</h1>
          {lieu && <p className="text-white/90 mt-1">📍 {lieu}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Intro */}
        {intro && (
          <p className="text-xl text-gray-700 leading-relaxed mb-8 border-l-4 border-quebec-gold pl-5 font-light">
            {intro}
          </p>
        )}

        {/* Corps rédigé */}
        {paragraphes.length > 0 && (
          <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
            {paragraphes.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        {/* Mots-clés (texte simple) */}
        {tags.length > 0 && (
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-8">{tags.join(' · ')}</p>
        )}

        {/* Contact / infos */}
        {hasContact && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-8 grid sm:grid-cols-2 gap-5 text-sm">
            {showAdresse && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.address}</p>
                <p className="text-gray-800">{svc.adresse}</p>
              </div>
            )}
            {showTel && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.phone}</p>
                <p className="text-gray-800">{svc.telephone}</p>
              </div>
            )}
            {showSite && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">{t.detail.website}</p>
                <a href={site} target="_blank" rel="noopener noreferrer" className="text-quebec-blue hover:underline break-all font-medium">{svc.site_web}</a>
              </div>
            )}
            {showMail && (
              <div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Courriel</p>
                <a href={`mailto:${svc.courriel}`} className="text-quebec-blue hover:underline break-all font-medium">{svc.courriel}</a>
              </div>
            )}
          </div>
        )}

        {/* Carte Google */}
        <MapEmbed
          lang={lang}
          label={t.detail.map}
          title={svc.nom}
          query={svc.adresse || `${svc.nom} ${lieu} Québec`}
        />

        {/* CTA principal */}
        <div className="flex flex-wrap gap-3">
          {cta ? (
            <a
              href={cta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-quebec-red hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg"
            >
              {lang === 'fr' ? 'Visiter le site officiel' : 'Visit official website'} →
            </a>
          ) : null}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            📍 {t.activites.view_on_map} →
          </a>
        </div>
      </div>
    </>
  )
}
