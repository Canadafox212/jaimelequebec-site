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
  const inputRef = useRef(null)

  const enriched = useMemo(() =>
    expressions.map(e => ({
      ...e,
      _phonetic: normalizePhonetic(e.mot),
      _phonetic_sens: normalizePhonetic(e.sens ?? ''),
      _phonetic_equiv: normalizePhonetic(e.equivalent_fr ?? ''),
    })), [expressions])

  const fuse = useMemo(() => new Fuse(enriched, {
    keys: [
      { name: 'mot',       weight: 3 },
      { name: '_phonetic', weight: 3 },
    ],
    threshold: 0.25,
    includeScore: true,
    minMatchCharLength: 2,
  }), [enriched])

  const hasSearch = query.trim().length >= 2

  const results = useMemo(() => {
    const q = query.trim()
    if (!hasSearch) return []

    const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const qNorm = norm(q)
    const qPhonetic = normalizePhonetic(q)
    const seen = new Set()

    // 1. Correspondance exacte préfixe sur le mot (priorité max)
    const prefixHits = enriched.filter(e => {
      if (norm(e.mot).startsWith(qNorm)) { seen.add(e.slug); return true }
      return false
    })

    // 2. Fuzzy phonétique sur le mot uniquement (Fuse strict)
    const fuseHits = fuse.search(qPhonetic)
      .filter(r => !seen.has(r.item.slug))
      .map(r => { seen.add(r.item.slug); return r.item })

    // 3. Substring exact dans la définition ou l'équivalent français
    const contentHits = enriched.filter(e => {
      if (seen.has(e.slug)) return false
      const inSens  = norm(e.sens).includes(qNorm)
      const inEquiv = norm(e.equivalent_fr).includes(qNorm)
      if (inSens || inEquiv) { seen.add(e.slug); return true }
      return false
    })

    return [...prefixHits, ...fuseHits, ...contentHits].slice(0, 20)
  }, [query, fuse, enriched, hasSearch])

  const placeholder = lang === 'fr'
    ? 'Tapez un mot québécois ou son équivalent français…'
    : 'Search a Quebec word or its French equivalent…'

  const labelResults = lang === 'fr'
    ? `${results.length} résultat${results.length > 1 ? 's' : ''}`
    : `${results.length} result${results.length > 1 ? 's' : ''}`

  return (
    <div>
      {/* Barre de recherche */}
      <div className="relative mb-6">
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
            ? 'Tapez un mot pour explorer le vocabulaire québécois.'
            : 'Type a word to explore Quebec vocabulary.'}
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
