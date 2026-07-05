'use client'
import { useState, useEffect, useRef } from 'react'

export default function AdminActivitesPage() {
  const [attractions, setAttractions] = useState(null)
  const [selected,    setSelected]    = useState(null)  // { slug, titre }
  const [actData,     setActData]     = useState(null)  // { ete, hiver }
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    fetch('/api/admin-list')
      .then(r => r.json())
      .then(list => setAttractions(list.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))))
  }, [])

  async function selectAttraction(slug) {
    if (!slug) { setSelected(null); setActData(null); return }
    const a = attractions.find(a => a.slug === slug)
    setSelected({ slug, titre: a?.titre ?? slug })
    setActData(null)
    setLoading(true)
    const res  = await fetch(`/api/admin-activites?slug=${slug}`)
    const data = await res.json()
    setActData(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#001a4d] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">⚡ Activités manquantes — J'aime le Québec</h1>
        <span className="text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded">LOCAL SEULEMENT</span>
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* Sélecteur d'attraction */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Choisir un site
          </label>
          {!attractions ? (
            <p className="text-sm text-gray-400">Chargement…</p>
          ) : (
            <select
              onChange={e => selectAttraction(e.target.value)}
              defaultValue=""
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Sélectionner un site ({attractions.length}) —</option>
              {attractions.map(a => (
                <option key={a.slug} value={a.slug}>
                  {a.titre}{a.region ? ` · ${a.region}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Contenu */}
        {loading && (
          <p className="text-center text-gray-400 py-16">Chargement des activités…</p>
        )}

        {actData && (
          <div className="space-y-8">
            <SaisonSection
              titre="☀️ Activités — Été"
              lieux={actData.ete}
              saison="ete"
              slug={actData.slug}
              color="amber"
            />
            <SaisonSection
              titre="❄️ Activités — Hiver"
              lieux={actData.hiver}
              saison="hiver"
              slug={actData.slug}
              color="blue"
            />
            {actData.ete.length === 0 && actData.hiver.length === 0 && (
              <p className="text-center text-gray-400 py-10 bg-white rounded-2xl border">
                Aucun lieu d'activité recensé pour ce site.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section été ou hiver ──────────────────────────────────────────────
function SaisonSection({ titre, lieux, saison, slug, color }) {
  if (lieux.length === 0) return null

  const headerCls = color === 'amber'
    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
    : 'bg-gradient-to-r from-indigo-500 to-blue-700 text-white'

  return (
    <div>
      <div className={`inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full shadow-sm mb-4 ${headerCls}`}>
        {titre} <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{lieux.length} lieux</span>
      </div>
      <div className="space-y-4">
        {lieux.map(lieu => (
          <LieuCard key={lieu.nom} lieu={lieu} saison={saison} slug={slug} />
        ))}
      </div>
    </div>
  )
}

// ── Carte d'un lieu d'activité ────────────────────────────────────────
function LieuCard({ lieu, saison, slug }) {
  const [extras,   setExtras]   = useState(lieu.extra ?? [])
  const [newAct,   setNewAct]   = useState('')
  const [status,   setStatus]   = useState(null) // 'saving' | 'ok' | 'error'
  const inputRef = useRef()

  function addActivite() {
    const v = newAct.trim()
    if (!v || extras.includes(v)) return
    setExtras(prev => [...prev, v])
    setNewAct('')
    inputRef.current?.focus()
  }

  function removeExtra(act) {
    setExtras(prev => prev.filter(a => a !== act))
  }

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/admin-activites', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug, saison, nom: lieu.nom, extra: extras }),
      })
      const data = await res.json()
      setStatus(data.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus(null), 2500)
  }

  const hasChanges = JSON.stringify(extras) !== JSON.stringify(lieu.extra ?? [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* En-tête du lieu */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-bold text-gray-900">{lieu.nom}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {lieu.type}{lieu.dist_km != null ? ` · ${lieu.dist_km} km` : ''}
          </p>
        </div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className={`shrink-0 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
            status === 'ok'      ? 'bg-green-500 text-white'
            : status === 'error' ? 'bg-red-500 text-white'
            : status === 'saving'? 'bg-gray-300 text-gray-500 cursor-wait'
            : hasChanges         ? 'bg-[#001a4d] text-white hover:bg-blue-800'
            :                      'bg-gray-100 text-gray-400 cursor-default'
          }`}
        >
          {status === 'saving' ? 'Sauvegarde…'
            : status === 'ok'   ? '✓ Sauvegardé'
            : status === 'error'? '✗ Erreur'
            : 'Sauvegarder'}
        </button>
      </div>

      {/* Activités existantes (source) */}
      {lieu.activites.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Activités dans les données
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lieu.activites.map((a, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-100">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activités ajoutées manuellement */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Activités ajoutées manuellement
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
          {extras.length === 0 && (
            <span className="text-xs text-gray-300 italic">Aucune encore</span>
          )}
          {extras.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-200"
            >
              {a}
              <button
                onClick={() => removeExtra(a)}
                className="text-green-400 hover:text-red-500 transition-colors font-bold leading-none"
                aria-label={`Supprimer ${a}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Champ d'ajout */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ex : Ski de fond"
            value={newAct}
            onChange={e => setNewAct(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addActivite() }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
          />
          <button
            onClick={addActivite}
            disabled={!newAct.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
