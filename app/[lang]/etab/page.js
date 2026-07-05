import Image from 'next/image'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'
import { getActivityPhotoSrc } from '@/lib/attractions'

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const nom = sp.nom ?? ''
  return { title: nom ? `${nom} — J'aime le Québec` : "Informations — J'aime le Québec" }
}

function mapsUrl(nom, place) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`"${nom}" ${place} Québec`)}&t=h`
}

export default async function EtabPage({ params, searchParams }) {
  const { lang } = await params
  const sp = await searchParams
  const t = getDictionary(lang)

  const nom = sp.nom ?? ''
  const place = sp.place ?? 'Québec'
  const labels = sp.labels ? sp.labels.split('|').filter(Boolean) : []
  const site = sp.site ?? ''

  // Cherche la photo de chaque label (server-side — existsSync autorisé ici)
  const withPhoto = []
  const withoutPhoto = []
  for (const label of labels) {
    const src = getActivityPhotoSrc(label)
    if (src) withPhoto.push({ label, src })
    else withoutPhoto.push(label)
  }

  const maps = mapsUrl(nom, place)

  return (
    <>
      {/* ── EN-TÊTE ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-quebec-navy to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link
            href={`/${lang}/activites`}
            className="text-sm text-blue-300 hover:text-white transition-colors mb-4 inline-block"
          >
            {t.etab.back}
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{nom}</h1>
          {place && <p className="text-blue-200 mt-2 text-sm">📍 {place}</p>}
        </div>
      </div>

      {/* ── GRILLE D'ACTIVITÉS ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {withPhoto.length > 0 ? (
          <>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              {t.etab.activities_title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {withPhoto.map(({ label, src }) => (
                <div
                  key={label}
                  className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32">
                    <Image
                      src={src}
                      alt={label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 px-2 py-2 text-center leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-10">{t.etab.no_photos}</p>
        )}

        {/* Labels sans photo */}
        {withoutPhoto.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {t.etab.other_activities}
            </h3>
            <div className="flex flex-wrap gap-2">
              {withoutPhoto.map((l) => (
                <span
                  key={l}
                  className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Boutons répétés en bas pour mobile */}
        <div className="flex flex-wrap gap-3 mt-10 pt-8 border-t border-gray-100">
          {site && (
            <a
              href={site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-quebec-blue text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-blue-800 transition-colors"
            >
              🌐 {t.etab.official_site}
            </a>
          )}
          <a
            href={maps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-full text-sm hover:border-quebec-blue hover:text-quebec-blue transition-colors"
          >
            📍 {t.etab.maps}
          </a>
        </div>
      </div>
    </>
  )
}
