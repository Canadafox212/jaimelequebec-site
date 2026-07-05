import Link from 'next/link'
import Image from 'next/image'
import { getAttractionImageSrc } from '@/lib/attractions'

function resolveAttractionContent(attraction, lang) {
  if (lang === 'fr') return { title: attraction.fr?.titre, summary: attraction.fr?.resume, category: attraction.fr?.categorie_thematique }
  if (lang === 'en') return { title: attraction.en?.title, summary: attraction.en?.summary, category: attraction.en?.theme_category }
  const tr = attraction[lang]
  return {
    title:    tr?.titre ?? tr?.title    ?? attraction.en?.title    ?? attraction.fr?.titre,
    summary:  tr?.resume ?? tr?.summary ?? attraction.en?.summary  ?? attraction.fr?.resume,
    category: attraction.en?.theme_category ?? attraction.fr?.categorie_thematique,
  }
}

export default function AttractionCard({ attraction, lang, t }) {
  const { title, summary, category } = resolveAttractionContent(attraction, lang)
  const region = attraction.localisation.region_touristique

  const imageSrc = getAttractionImageSrc(attraction.slug)
  const hasImage = imageSrc !== null

  return (
    <Link
      href={`/${lang}/sites/${attraction.slug}`}
      className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Zone image */}
      <div className="relative h-52 overflow-hidden">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 ${getCategoryGradient(category)}`} />
        )}

        {/* Superposition dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Badge région */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-blue-900 text-xs font-semibold px-2.5 py-1 rounded-full">
            {region}
          </span>
        </div>

        {/* Emoji catégorie centré */}
        {!hasImage && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40">
            {getCategoryEmoji(category)}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-2">
          {category}
        </span>
        <h3 className="font-display text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-quebec-blue transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1 leading-relaxed">
          {summary}
        </p>
        <div className="mt-4 flex items-center gap-1 text-quebec-blue text-sm font-semibold">
          {t?.detail?.read ?? (lang === 'fr' ? 'Découvrir' : 'Explore')}
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
      </div>
    </Link>
  )
}

function getCategoryGradient(category) {
  if (!category) return 'bg-gradient-to-br from-slate-600 to-slate-800'
  const c = category.toLowerCase()
  if (c.includes('parc') || c.includes('nature') || c.includes('national'))
    return 'bg-gradient-to-br from-emerald-700 to-emerald-900'
  if (c.includes('histoire') || c.includes('heritage') || c.includes('patrimoine'))
    return 'bg-gradient-to-br from-amber-700 to-amber-900'
  if (c.includes('plein air') || c.includes('outdoor') || c.includes('sport'))
    return 'bg-gradient-to-br from-teal-600 to-teal-800'
  if (c.includes('croisière') || c.includes('cruise') || c.includes('marine'))
    return 'bg-gradient-to-br from-blue-600 to-blue-900'
  if (c.includes('village') || c.includes('quartier') || c.includes('district'))
    return 'bg-gradient-to-br from-rose-600 to-rose-900'
  if (c.includes('île') || c.includes('island') || c.includes('littoral'))
    return 'bg-gradient-to-br from-cyan-600 to-cyan-900'
  if (c.includes('faune') || c.includes('wildlife') || c.includes('zoo'))
    return 'bg-gradient-to-br from-green-600 to-green-900'
  if (c.includes('route') || c.includes('circuit'))
    return 'bg-gradient-to-br from-orange-600 to-orange-900'
  if (c.includes('divert') || c.includes('casino') || c.includes('entertain'))
    return 'bg-gradient-to-br from-purple-600 to-purple-900'
  return 'bg-gradient-to-br from-quebec-blue to-quebec-navy'
}

function getCategoryEmoji(category) {
  if (!category) return '📍'
  const c = category.toLowerCase()
  if (c.includes('parc') || c.includes('nature') || c.includes('national')) return '🌲'
  if (c.includes('histoire') || c.includes('heritage') || c.includes('patrimoine')) return '🏛️'
  if (c.includes('plein air') || c.includes('outdoor') || c.includes('sport')) return '🏕️'
  if (c.includes('croisière') || c.includes('cruise') || c.includes('marine')) return '🐋'
  if (c.includes('village') || c.includes('quartier') || c.includes('district')) return '🏘️'
  if (c.includes('île') || c.includes('island') || c.includes('littoral')) return '🏝️'
  if (c.includes('faune') || c.includes('wildlife') || c.includes('zoo')) return '🦌'
  if (c.includes('route') || c.includes('circuit')) return '🚗'
  if (c.includes('divert') || c.includes('casino') || c.includes('entertain')) return '🎭'
  return '📍'
}
