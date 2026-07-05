'use client'
import { useState, useEffect, useRef } from 'react'

const FALLBACKS = [
  { name: 'hotel',       label: 'Hôtel' },
  { name: 'auberge',     label: 'Auberge de jeunesse' },
  { name: 'motel',       label: 'Motel' },
  { name: 'gite',        label: 'Gîte / Chalet' },
  { name: 'camping',     label: 'Camping' },
  { name: 'restaurant',  label: 'Restaurant' },
  { name: 'bar',         label: 'Bar / Pub' },
  { name: 'cafe',        label: 'Café / Bistro' },
  { name: 'parc',        label: 'Parc / Nature' },
  { name: 'plage',       label: 'Plage' },
  { name: 'marina',      label: 'Marina' },
  { name: 'peche',       label: 'Pêche / ZEC' },
  { name: 'ski-alpin',   label: 'Ski alpin' },
  { name: 'ski-fond',    label: 'Ski de fond' },
  { name: 'patinoire',   label: 'Patinoire' },
  { name: 'velo',        label: 'Vélo / Fatbike' },
  { name: 'golf',        label: 'Golf' },
  { name: 'equestre',    label: 'Équestre' },
  { name: 'karting',     label: 'Karting / Moto' },
  { name: 'sport',       label: 'Sport / Aventure' },
  { name: 'jardin',      label: 'Jardin / Zoo' },
  { name: 'spa',         label: 'Spa / Santé' },
  { name: 'casino',      label: 'Casino' },
]

export default function AdminImagesPage() {
  const [tab, setTab]       = useState('fallbacks')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  // Réinitialise la recherche quand on change d'onglet
  function switchTab(t) { setTab(t); setSearch(''); setFilter('all') }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#001a4d] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">🖼️ Gestion des images — J'aime le Québec</h1>
        <span className="text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded">LOCAL SEULEMENT</span>
      </div>

      {/* Onglets */}
      <div className="bg-white border-b px-6 flex gap-6 sticky top-14 z-10">
        <TabBtn active={tab === 'fallbacks'} onClick={() => switchTab('fallbacks')}>
          🏷️ Images par défaut
        </TabBtn>
        <TabBtn active={tab === 'attractions'} onClick={() => switchTab('attractions')}>
          📍 200 Sites touristiques
        </TabBtn>
        <TabBtn active={tab === 'activites'} onClick={() => switchTab('activites')}>
          🏃 Photos d'activités
        </TabBtn>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Barre de recherche (onglets attractions et activités) */}
        {(tab === 'attractions' || tab === 'activites') && (
          <div className="flex gap-3 mb-5 flex-wrap">
            <input
              type="text"
              placeholder="🔍  Rechercher par nom ou slug…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm flex-1 min-w-64 bg-white shadow-sm"
            />
            {[['all','Tous'],['missing','Sans photo'],['done','Avec photo']].map(([k,l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === k ? 'bg-[#001a4d] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {tab === 'fallbacks'   && <FallbacksPanel />}
        {tab === 'attractions' && <AttractionsPanel search={search} filter={filter} />}
        {tab === 'activites'   && <ActivitesPanel   search={search} filter={filter} />}
      </div>
    </div>
  )
}

// ── Images par défaut ──────────────────────────────
function FallbacksPanel() {
  const [srcs, setSrcs] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin-fallbacks')
      .then(r => r.json())
      .then(list => {
        const map = {}
        for (const item of list) map[item.name] = item.imageSrc
        setSrcs(map)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function onSaved(name, path) {
    setSrcs(prev => ({ ...prev, [name]: path + '?t=' + Date.now() }))
  }

  if (!loaded) return <p className="text-gray-400 py-16 text-center">Chargement…</p>

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        Ces images apparaissent quand un hébergement, restaurant ou activité n'a pas de photo propre.
        Clique sur une image pour la remplacer.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {FALLBACKS.map(item => (
          <ImageCard
            key={item.name}
            label={item.label}
            sublabel={item.name}
            filename={item.name}
            folder="fallbacks"
            src={srcs[item.name] ?? null}
            hasImage={!!srcs[item.name]}
            onSaved={path => onSaved(item.name, path)}
          />
        ))}
      </div>
    </div>
  )
}

// ── 200 Sites touristiques ─────────────────────────
function AttractionsPanel({ search, filter }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    fetch('/api/admin-list')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (!items) return <p className="text-gray-400 py-16 text-center">Chargement de la liste…</p>

  const withImg  = items.filter(a => a.hasImage).length
  const missing  = items.length - withImg

  const filtered = items.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.titre.toLowerCase().includes(q) || a.slug.includes(q) || a.region.toLowerCase().includes(q)
    const matchFilter = filter === 'all'
      || (filter === 'missing' && !a.hasImage)
      || (filter === 'done'    && a.hasImage)
    return matchSearch && matchFilter
  })

  function onSaved(slug, path) {
    setItems(prev => prev.map(x =>
      x.slug === slug ? { ...x, hasImage: true, imageSrc: path + '?t=' + Date.now() } : x
    ))
  }

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-3 mb-5">
        <StatBadge label="Total"      value={items.length} color="blue" />
        <StatBadge label="Avec photo" value={withImg}      color="green" />
        <StatBadge label="Manquantes" value={missing}      color="red" />
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} site(s) affiché(s)</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(a => (
          <ImageCard
            key={a.slug}
            label={a.titre}
            sublabel={a.region}
            filename={a.slug}
            folder="attractions"
            src={a.imageSrc}
            hasImage={a.hasImage}
            onSaved={path => onSaved(a.slug, path)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Photos d'activités ────────────────────────────
function ActivitesPanel({ search, filter }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    fetch('/api/admin-activites-photos')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (!items) return <p className="text-gray-400 py-16 text-center">Chargement de la liste…</p>

  const withImg = items.filter(a => a.hasImage).length
  const missing = items.length - withImg

  const filtered = items.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.nom.toLowerCase().includes(q)
    const matchFilter = filter === 'all'
      || (filter === 'missing' && !a.hasImage)
      || (filter === 'done'    && a.hasImage)
    return matchSearch && matchFilter
  })

  function onSaved(slug, path) {
    setItems(prev => prev.map(x =>
      x.slug === slug ? { ...x, hasImage: true, imageSrc: path + '?t=' + Date.now() } : x
    ))
  }

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <StatBadge label="Total"      value={items.length} color="blue" />
        <StatBadge label="Avec photo" value={withImg}      color="green" />
        <StatBadge label="Manquantes" value={missing}      color="red" />
      </div>
      <p className="text-xs text-gray-400 mb-4">{filtered.length} activité(s) affichée(s)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(a => (
          <ImageCard
            key={a.slug}
            label={a.nom}
            sublabel={a.slug}
            filename={a.slug}
            folder="activites"
            src={a.imageSrc}
            hasImage={a.hasImage}
            onSaved={path => onSaved(a.slug, path)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Carte image individuelle ───────────────────────
function ImageCard({ label, sublabel, filename, folder, src, fallbackSrc, hasImage = true, onSaved }) {
  const [loading, setLoading]   = useState(false)
  const [status, setStatus]     = useState(null)   // 'ok' | 'error'
  const [url, setUrl]           = useState('')
  const [showUrl, setShowUrl]   = useState(false)
  const [imgSrc, setImgSrc]     = useState(src)
  const fileRef = useRef()

  useEffect(() => { setImgSrc(src) }, [src])

  async function save(fileOrUrl) {
    setLoading(true)
    setStatus(null)
    const fd = new FormData()
    fd.append('folder', folder)
    fd.append('filename', filename)
    if (fileOrUrl instanceof File) fd.append('file', fileOrUrl)
    else fd.append('url', fileOrUrl)

    try {
      const res  = await fetch('/api/admin-save-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok) {
        setStatus('ok')
        setImgSrc(data.path + '?t=' + Date.now())
        setUrl('')
        setShowUrl(false)
        onSaved(data.path)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
    setLoading(false)
  }

  function handleFile(file) {
    if (file) save(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">

      {/* Image — clique pour ouvrir le sélecteur de fichier */}
      <div
        className="relative h-32 cursor-pointer overflow-hidden bg-gray-100"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        title="Cliquer pour changer la photo"
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            onError={() => fallbackSrc && setImgSrc(fallbackSrc)}
            alt={label}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <span className="text-3xl">📷</span>
            <span className="text-xs mt-1">Aucune photo</span>
          </div>
        )}

        {/* Overlay survol */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
            ✎ Changer
          </span>
        </div>

        {/* Badges */}
        {!hasImage && !imgSrc && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            manquant
          </span>
        )}
        {status === 'ok' && (
          <span className="absolute top-1.5 right-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">✓</span>
        )}
        {status === 'error' && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">✗</span>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm text-blue-600 font-medium">Sauvegarde…</span>
          </div>
        )}
      </div>

      {/* Nom */}
      <div className="px-2.5 pt-2 pb-1">
        <p className="text-xs font-semibold text-gray-800 truncate" title={label}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 truncate">{sublabel}</p>}
      </div>

      {/* Bouton URL */}
      <div className="px-2.5 pb-2.5">
        {showUrl ? (
          <div className="flex gap-1 mt-1">
            <input
              autoFocus
              type="text"
              placeholder="https://…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && url) save(url); if (e.key === 'Escape') setShowUrl(false) }}
              className="flex-1 text-xs border rounded px-2 py-1 min-w-0"
            />
            <button
              onClick={() => url && save(url)}
              disabled={!url}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-40"
            >↓</button>
            <button onClick={() => setShowUrl(false)} className="text-xs text-gray-400 px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowUrl(true)}
            className="mt-1 text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Coller une URL
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function StatBadge({ label, value, color }) {
  const cls = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700' }
  return (
    <div className={`rounded-lg px-4 py-2 font-medium ${cls[color]}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs ml-1.5">{label}</span>
    </div>
  )
}
