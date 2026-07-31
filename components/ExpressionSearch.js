'use client'
import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { normalizePhonetic } from '@/lib/phonetic'

const NIVEAU_COLOR = {
  'courant':  'bg-emerald-100 text-emerald-800',
  'familier': 'bg-amber-100 text-amber-800',
  'joual':    'bg-red-100 text-red-800',
  'vieilli':  'bg-gray-100 text-gray-600',
  'régional': 'bg-blue-100 text-blue-800',
}

function niveauColor(niveau) {
  if (!niveau) return 'bg-gray-100 text-gray-500'
  const key = Object.keys(NIVEAU_COLOR).find(k => niveau.toLowerCase().includes(k))
  return key ? NIVEAU_COLOR[key] : 'bg-gray-100 text-gray-500'
}

export default function ExpressionSearch({ expressions, lang, t }) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const inputRef = useRef(null)

  // Enrichir les données avec formes phonétiques pour la recherche
  const enriched = useMemo(() =>
    expressions.map(e => ({
      ...e,
      _phonetic: normalizePhonetic(e.mot),
      _phonetic_sens: normalizePhonetic(e.sens ?? ''),
      _phonetic_equiv: normalizePhonetic(e.equivalent_fr ?? ''),
    })), [expressions])

  const fuse = useMemo(() => new Fuse(enriched, {
    keys: [
      { name: 'mot',           weight: 3 },
      { name: '_phonetic',     weight: 3 },
      { name: 'equivalent_fr', weight: 2 },
      { name: '_phonetic_equiv', weight: 2 },
      { name: 'sens',          weight: 1 },
      { name: '_phonetic_sens', weight: 1 },
      { name: 'commentaire',   weight: 0.5 },
    ],
    threshold: 0.38,
    includeScore: true,
    minMatchCharLength: 2,
  }), [enriched])

  const categories = useMemo(() => {
    const counts = {}
    for (const e of expressions) {
      if (e.categorie) counts[e.categorie] = (counts[e.categorie] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [expressions])

  const hasSearch = query.trim().length >= 2 || !!catFilter

  const results = useMemo(() => {
    const q = query.trim()
    if (!hasSearch) return []

    let list = q.length >= 2
      ? fuse.search(normalizePhonetic(q)).map(r => r.item)
      : [...enriched].sort((a, b) => a.mot.localeCompare(b.mot, 'fr'))

    if (catFilter) list = list.filter(e => e.categorie === catFilter)
    return list.slice(0, 20)
  }, [query, catFilter, fuse, enriched, hasSearch])

  const placeholder = lang === 'fr'
    ? 'Tapez un mot québécois ou son équivalent français…'
    : 'Search a Quebec word or its French equivalent…'

  const labelTotal = lang === 'fr'
    ? `${expressions.length} mots et expressions`
    : `${expressions.length} words and expressions`

  const labelResults = lang === 'fr'
    ? `${results.length} résultat${results.length > 1 ? 's' : ''}`
    : `${results.length} result${results.length > 1 ? 's' : ''}`

  return (
    <div>
      {/* Barre de recherche */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-quebec-blue bg-white shadow-sm"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCatFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            !catFilter ? 'bg-quebec-navy text-white border-quebec-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-quebec-navy'
          }`}
        >
          {lang === 'fr' ? 'Tout' : 'All'}
        </button>
        {categories.map(([cat]) => (
          <button key={cat}
            onClick={() => setCatFilter(cat === catFilter ? '' : cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
              catFilter === cat ? 'bg-quebec-navy text-white border-quebec-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-quebec-navy'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Compteur / invite */}
      {hasSearch ? (
        <p className="text-sm text-gray-500 mb-4">
          {labelResults}
          {results.length === 20 && (
            <span className="ml-1 text-xs text-gray-400">
              {lang === 'fr' ? '— affinez la recherche pour voir plus' : '— refine your search to see more'}
            </span>
          )}
        </p>
      ) : (
        <p className="text-sm text-gray-400 mb-4 italic">
          {lang === 'fr'
            ? 'Tapez un mot ou sélectionnez une catégorie pour explorer le vocabulaire.'
            : 'Type a word or select a category to explore the vocabulary.'}
        </p>
      )}

      {/* Grille résultats */}
      {!hasSearch ? null : results.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          {lang === 'fr' ? 'Aucun résultat. Essayez une autre orthographe.' : 'No results. Try another spelling.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(e => (
            <Link key={e.slug} href={`/${lang}/expressions/${e.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-quebec-blue hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-bold text-quebec-navy text-lg leading-snug group-hover:text-quebec-blue transition-colors">
                  {e.mot}
                </span>
                {e.niveau && (
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${niveauColor(e.niveau)}`}>
                    {e.niveau.split('/')[0].split(',')[0].trim()}
                  </span>
                )}
              </div>
              {e.type && <p className="text-xs text-gray-400 italic mb-2">{e.type}</p>}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{e.sens}</p>
              {e.equivalent_fr && (
                <p className="text-xs text-gray-400 mt-2">
                  🇫🇷 <em>{e.equivalent_fr}</em>
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
