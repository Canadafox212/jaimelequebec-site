'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function resolveContent(a, lang) {
  if (lang === 'fr') return { title: a.fr?.titre, summary: a.fr?.resume, category: a.fr?.categorie_thematique }
  if (lang === 'en') return { title: a.en?.title, summary: a.en?.summary, category: a.en?.theme_category }
  const tr = a[lang]
  return {
    title:    tr?.titre    ?? tr?.title    ?? a.en?.title    ?? a.fr?.titre,
    summary:  tr?.resume   ?? tr?.summary  ?? a.en?.summary  ?? a.fr?.resume,
    category: a.en?.theme_category ?? a.fr?.categorie_thematique,
  }
}

const PER_PAGE = 3

export default function CoupsDeCoeurCarousel({ attractions, lang, t }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(attractions.length / PER_PAGE)
  const visible    = attractions.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const prev = () => setPage((p) => Math.max(0, p - 1))
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1))

  const discover = t?.detail?.read ?? (lang === 'fr' ? 'Découvrir' : 'Explore')

  return (
    <div className="relative">
      {/* Grille de cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {visible.map((a) => {
          const { title, summary, category } = resolveContent(a, lang)
          const region   = a.localisation?.region_touristique
          const imageSrc = a.imageSrc ?? null

          return (
            <Link
              key={a.id}
              href={`/${lang}/sites/${a.slug}`}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden shrink-0">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={title ?? ''}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-quebec-blue to-quebec-navy" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {region && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {region}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5 flex flex-col flex-1">
                {category && (
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {category}
                  </span>
                )}
                <h3 className="font-display text-base font-bold text-quebec-blue leading-snug mb-2 line-clamp-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 flex-1 leading-relaxed mb-4">
                  {summary}
                </p>
                <span className="self-start inline-block bg-quebec-blue text-white text-xs font-bold px-5 py-2 rounded-full group-hover:bg-blue-800 transition-colors">
                  {discover.toUpperCase()}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Navigation : flèches + dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={page === 0}
            aria-label="Page précédente"
            className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-quebec-blue hover:text-quebec-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  i === page ? 'bg-quebec-blue w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={page === totalPages - 1}
            aria-label="Page suivante"
            className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-quebec-blue hover:text-quebec-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
