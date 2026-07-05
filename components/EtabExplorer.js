'use client'
import { useMemo, useState } from 'react'
import EtabCard from './EtabCard'
import QuebecRegionMap from './QuebecRegionMap'

// Liste d'établissements filtrable par facettes (région + sous-catégorie).
export default function EtabExplorer({ items, lang, t, showRegion = true, showTheme = false, cap = 0 }) {
  const [region, setRegion] = useState('')
  const [sous, setSous] = useState('')
  const [theme, setTheme] = useState('')

  const regions = useMemo(() => {
    const m = new Map()
    for (const e of items) {
      const name = e[`region_${lang}`] ?? e.region_en ?? e.region_fr
      if (e.regionNum != null && name) m.set(String(e.regionNum), name)
    }
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'))
  }, [items, lang])

  const themes = useMemo(() => {
    const m = new Map()
    for (const e of items) if (e.themeId) m.set(e.themeId, (e[`theme_${lang}`] ?? e.theme_en ?? e.theme_fr) || e.themeId)
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'))
  }, [items, lang])

  const sousCats = useMemo(() => {
    const s = new Set()
    for (const e of items) {
      if (theme && e.themeId !== theme) continue
      if (e.type) s.add(e.type)
      for (const l of e.labels || []) s.add(l)
    }
    return [...s].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [items, theme])

  const all = items.filter((e) => {
    if (region && String(e.regionNum) !== region) return false
    if (theme && e.themeId !== theme) return false
    if (sous && !(e.type === sous || (e.labels || []).includes(sous))) return false
    return true
  })
  const filtered = cap > 0 ? all.slice(0, cap) : all

  const selClass = 'border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-quebec-blue max-w-[16rem]'

  return (
    <div>
      {/* Facettes */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {showTheme && themes.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t?.activites?.filter_theme ?? 'Theme'}</span>
            <select value={theme} onChange={(e) => { setTheme(e.target.value); setSous('') }} className={selClass}>
              <option value="">{t?.activites?.filter_all ?? 'All'}</option>
              {themes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
        )}
        {showRegion && regions.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t?.activites?.filter_region ?? 'Region'}</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={selClass}>
              <option value="">{t?.activites?.filter_all ?? 'All'}</option>
              {regions.map(([num, name]) => <option key={num} value={num}>{name}</option>)}
            </select>
          </label>
        )}
        {sousCats.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t?.activites?.filter_subcategory ?? 'Sub-category'}</span>
            <select value={sous} onChange={(e) => setSous(e.target.value)} className={selClass}>
              <option value="">{t?.activites?.filter_all ?? 'All'}</option>
              {sousCats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
        {(region || sous || theme) && (
          <button onClick={() => { setRegion(''); setSous(''); setTheme('') }} className="text-xs font-semibold text-quebec-blue hover:text-blue-800 py-2">
            {t?.activites?.filter_reset ?? '✕ Reset'}
          </button>
        )}
        <span className="text-xs text-gray-400 py-2 ml-auto">
          {all.length} {t?.activites?.results ?? 'result(s)'}
        </span>
      </div>

      {/* Bannière région — visible uniquement quand une région est sélectionnée */}
      {region && (
        <div className="flex items-center gap-4 mb-5 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-blue-100">
          <QuebecRegionMap regionNum={Number(region)} />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {t?.activites?.filter_region ?? 'Région'}
            </p>
            <p className="font-bold text-lg text-slate-800 leading-tight">
              {regions.find(([num]) => num === region)?.[1]}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {all.length} {t?.activites?.results ?? 'résultat(s)'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e, i) => (
          <EtabCard key={i} etab={e} lang={lang} t={t} lieu={e[`region_${lang}`] ?? e.region_en ?? e.region_fr} />
        ))}
      </div>
    </div>
  )
}
