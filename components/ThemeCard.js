'use client'
import Link from 'next/link'
import { useState } from 'react'

const SAISON_BADGE = {
  ete:      { label: '☀️', bg: 'bg-amber-100 text-amber-700' },
  hiver:    { label: '❄️', bg: 'bg-blue-100 text-blue-700' },
  les_deux: null,
}

// Carte de thème : sous-catégories révélées au survol (desktop) ET au clic (mobile).
export default function ThemeCard({ lang, region, theme, count, saison, sous = [] }) {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const show = sous.length > 0 && (hover || pinned)
  const nom = theme[`nom_${lang}`] ?? theme.nom_en ?? theme.nom_fr
  const badge = SAISON_BADGE[saison] ?? null
  // Thèmes purement saisonniers → pré-filtrer, les_deux → pas de filtre (toggle sur la page résultats)
  const href = saison === 'ete' || saison === 'hiver'
    ? `/${lang}/activites/${region}/${theme.id}?saison=${saison}`
    : `/${lang}/activites/${region}/${theme.id}`

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="group flex items-center gap-2 bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-4">
        <Link
          href={href}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <span className="text-2xl shrink-0">{theme.emoji}</span>
          <span className="flex-1 font-semibold text-gray-900 group-hover:text-quebec-blue transition-colors leading-snug">
            {nom}
          </span>
        </Link>
        {badge && (
          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.label}</span>
        )}
        <span className="shrink-0 text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">{count}</span>
        {sous.length > 0 && (
          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            aria-label={lang === 'fr' ? 'Voir les sous-catégories' : 'Show sub-categories'}
            className="shrink-0 text-slate-400 hover:text-quebec-blue p-1 -mr-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${show ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {sous.length > 0 && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-30 bg-quebec-navy text-white rounded-xl shadow-xl p-3 transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1">
            {lang === 'fr' ? 'Inclut notamment' : 'Includes'}
          </p>
          <p className="text-xs text-blue-50 leading-relaxed">{sous.join(' · ')}</p>
        </div>
      )}
    </div>
  )
}
