'use client'
import { useState, useEffect, useMemo } from 'react'

const SAISONS = [
  { id: 'ete',      label: '☀️ Été',            bg: 'bg-amber-400',  text: 'text-white' },
  { id: 'les_deux', label: '📅 Toute l\'année',  bg: 'bg-slate-600',  text: 'text-white' },
  { id: 'hiver',    label: '❄️ Hiver',           bg: 'bg-indigo-500', text: 'text-white' },
]

export default function AdminActivitesSaisons() {
  const [items,   setItems]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')   // 'all' | 'ete' | 'les_deux' | 'hiver'
  const [saving,  setSaving]  = useState({})       // nom → 'saving'|'ok'|'error'

  useEffect(() => {
    fetch('/api/admin-activites-saisons')
      .then(r => r.json())
      .then(setItems)
  }, [])

  const displayed = useMemo(() => {
    if (!items) return []
    const q = search.toLowerCase().trim()
    return items.filter(a => {
      if (filter !== 'all' && a.saison !== filter) return false
      if (q && !a.nom.toLowerCase().includes(q) && !(a.type ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [items, search, filter])

  async function setSaison(nom, saison) {
    // Optimistic update
    setItems(prev => prev.map(a => a.nom === nom ? { ...a, saison } : a))
    setSaving(prev => ({ ...prev, [nom]: 'saving' }))
    try {
      const res = await fetch('/api/admin-activites-saisons', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nom, saison }),
      })
      const data = await res.json()
      setSaving(prev => ({ ...prev, [nom]: data.ok ? 'ok' : 'error' }))
    } catch {
      setSaving(prev => ({ ...prev, [nom]: 'error' }))
    }
    setTimeout(() => setSaving(prev => { const n = { ...prev }; delete n[nom]; return n }), 1500)
  }

  const counts = useMemo(() => {
    if (!items) return {}
    return {
      all:      items.length,
      ete:      items.filter(a => a.saison === 'ete').length,
      les_deux: items.filter(a => a.saison === 'les_deux').length,
      hiver:    items.filter(a => a.saison === 'hiver').length,
    }
  }, [items])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#001a4d] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">🗓️ Saisons des activités — J'aime le Québec</h1>
        <span className="text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded">LOCAL SEULEMENT</span>
      </div>

      <div className="p-4 max-w-5xl mx-auto">

        {/* Barre de filtres + recherche */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher par nom ou type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all',      label: `Tous (${counts.all ?? '…'})` },
              { id: 'ete',      label: `☀️ Été (${counts.ete ?? '…'})` },
              { id: 'les_deux', label: `📅 Toute l'année (${counts.les_deux ?? '…'})` },
              { id: 'hiver',    label: `❄️ Hiver (${counts.hiver ?? '…'})` },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${filter === f.id ? 'bg-[#001a4d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        {!items && <p className="text-center text-gray-400 py-20">Chargement des activités…</p>}
        {items && displayed.length === 0 && <p className="text-center text-gray-400 py-20">Aucune activité trouvée.</p>}

        {items && (
          <p className="text-xs text-gray-400 mb-3">{displayed.length} activité(s) affichée(s)</p>
        )}

        <div className="space-y-2">
          {displayed.map(a => (
            <ActivityRow
              key={a.nom}
              a={a}
              status={saving[a.nom]}
              onSaison={(saison) => setSaison(a.nom, saison)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ a, status, onSaison }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 px-3 py-2">
      {/* Vignette */}
      <img
        src={a.img}
        alt={a.type ?? ''}
        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{a.nom}</p>
        <p className="text-xs text-gray-400 truncate">
          {a.type ?? '—'}
          {(a.ville || a.region) && <span className="text-gray-300"> · </span>}
          {a.ville ?? a.region ?? ''}
        </p>
      </div>

      {/* Cases saison */}
      <div className="flex gap-1.5 shrink-0">
        {SAISONS.map(s => {
          const active = a.saison === s.id
          return (
            <button
              key={s.id}
              onClick={() => !active && onSaison(s.id)}
              title={s.label}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                active
                  ? `${s.bg} ${s.text} border-transparent shadow-sm`
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Indicateur save */}
      <div className="w-5 shrink-0 text-center">
        {status === 'saving' && <span className="text-gray-400 text-xs animate-pulse">…</span>}
        {status === 'ok'     && <span className="text-green-500 text-sm">✓</span>}
        {status === 'error'  && <span className="text-red-500 text-sm">✗</span>}
      </div>
    </div>
  )
}
