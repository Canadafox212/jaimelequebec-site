import { searchViatorProducts } from '@/lib/viator'

// Affiche les meilleures activités Viator bookables pour la région/thème.
// Server Component — la clé API reste côté serveur.
export default async function ViatorWidget({ regionNum, themeId, lang }) {
  const products = await searchViatorProducts({ regionNum, themeId, count: 6, lang })
  if (!products.length) return null

  const label = lang === 'fr' ? 'Réserver' : 'Book now'
  const subtitle = lang === 'fr'
    ? 'Activités disponibles à la réservation en ligne · Paiement sécurisé · Annulation gratuite'
    : 'Online booking available · Secure payment · Free cancellation'
  const heading = lang === 'fr' ? '🎟️ Réservez votre expérience' : '🎟️ Book your experience'
  const ratingLabel = lang === 'fr' ? 'avis' : 'reviews'
  const fromLabel = lang === 'fr' ? 'À partir de' : 'From'

  return (
    <section className="border-t border-gray-100 pt-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-gray-900">{heading}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const img = p.images?.[0]?.variants?.find(v => v.width >= 400)?.url
            ?? p.images?.[0]?.variants?.[0]?.url
          const rating = p.reviews?.combinedAverageRating
          const reviewCount = p.reviews?.totalReviews
          const price = p.pricing?.summary?.fromPrice
          const currency = p.pricing?.currency ?? 'CAD'

          return (
            <a
              key={p.productCode}
              href={p.productUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 border border-teal-50 flex flex-col"
            >
              {/* Photo */}
              {img && (
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Viator
                  </span>
                </div>
              )}

              {/* Contenu */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="font-bold text-gray-900 leading-snug text-sm line-clamp-2">{p.title}</p>

                {/* Note */}
                {rating != null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(rating))}</span>
                    <span className="text-xs text-gray-500">
                      {rating.toFixed(1)} ({reviewCount?.toLocaleString()} {ratingLabel})
                    </span>
                  </div>
                )}

                {/* Prix */}
                {price != null && (
                  <p className="text-xs text-gray-500 mt-auto">
                    {fromLabel} <span className="font-bold text-gray-800">{currency} {price.toFixed(0)}$</span>
                  </p>
                )}

                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors w-fit">
                  {label} →
                </span>
              </div>
            </a>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        {lang === 'fr'
          ? '* Liens affiliés Viator — les réservations effectuées via ces liens peuvent générer une commission pour jaimelequebec.com.'
          : '* Viator affiliate links — bookings made through these links may generate a commission for jaimelequebec.com.'}
      </p>
    </section>
  )
}
