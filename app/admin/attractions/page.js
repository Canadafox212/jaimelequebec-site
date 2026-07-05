'use client'
import { useEffect, useMemo, useState } from 'react'

export default function AdminAttractions() {
  const [attractions, setAttractions] = useState([])
  const [featured, setFeatured] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [coup, setCoup] = useState(false)
  const [prio, setPrio] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/admin-featured')
      .then((r) => r.json())
      .then((d) => { setAttractions(d.attractions || []); setFeatured(d.featured || {}); setLoading(false) })
      .catch(() => { setStatus('Erreur de chargement'); setLoading(false) })
  }, [])

  const liste = useMemo(() => {
    let arr = attractions
    const q = query.trim().toLowerCase()
    if (q) arr = arr.filter((a) => a.titre.toLowerCase().includes(q))
    arr = [...arr].sort((a, b) => {
      const fa = featured[a.slug] ? 0 : 1, fb = featured[b.slug] ? 0 : 1
      if (fa !== fb) return fa - fb
      return a.titre.localeCompare(b.titre, 'fr')
    })
    return arr.slice(0, 150)
  }, [attractions, featured, query])

  function select(slug) {
    setSelected(slug); setStatus('')
    const f = featured[slug]
    setCoup(!!f?.coup_de_coeur)
    setPrio(f?.priorite ?? '')
  }

  async function enregistrer() {
    if (!selected) return
    setStatus('Enregistrement…')
    const res = await fetch('/api/admin-featured', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selected, data: { coup_de_coeur: coup, priorite: prio } }),
    })
    const d = await res.json()
    if (d.ok) {
      setFeatured((s) => {
        const c = { ...s }
        if (d.entry) c[selected] = d.entry; else delete c[selected]
        return c
      })
      setStatus(d.entry ? '✓ Enregistré' : '✓ Retiré (ni priorité ni coup de cœur)')
    } else setStatus('Erreur : ' + (d.error || ''))
  }

  async function retirer() {
    if (!selected) return
    const res = await fetch('/api/admin-featured', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selected, supprimer: true }),
    })
    const d = await res.json()
    if (d.ok) { setFeatured((s) => { const c = { ...s }; delete c[selected]; return c }); setCoup(false); setPrio(''); setStatus('✓ Retiré') }
  }

  const nb = Object.keys(featured).filter((k) => k !== '_commentaire').length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-quebec-navy text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin — Mise en avant des attractions</h1>
          <p className="text-blue-200 text-sm">{nb} attraction(s) mise(s) en avant · {attractions.length} attractions au total</p>
        </div>
        <nav className="text-sm flex gap-3">
          <a href="/admin/services" className="text-blue-200 hover:text-white underline">→ Registre des services</a>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-[340px_1fr] gap-6">
        <aside className="bg-white rounded-2xl shadow-card p-4 h-fit md:sticky md:top-4">
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une attraction…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-quebec-blue"
          />
          {loading ? <p className="text-sm text-gray-400 py-4">Chargement…</p> : (
            <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
              {liste.map((a) => (
                <li key={a.slug}>
                  <button
                    onClick={() => select(a.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selected === a.slug ? 'bg-quebec-blue text-white' : 'hover:bg-slate-100 text-gray-800'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {featured[a.slug]?.coup_de_coeur && <span className="text-quebec-gold">★</span>}
                      {featured[a.slug] && !featured[a.slug]?.coup_de_coeur && <span className="text-slate-400">•</span>}
                      <span className="truncate">{a.titre}</span>
                    </span>
                    {a.region && <span className={`text-xs ${selected === a.slug ? 'text-blue-100' : 'text-gray-400'}`}>{a.region}</span>}
                  </button>
                </li>
              ))}
              {liste.length === 0 && <li className="text-sm text-gray-400 py-2">Aucun résultat</li>}
            </ul>
          )}
        </aside>

        <main className="bg-white rounded-2xl shadow-card p-6">
          {!selected ? (
            <p className="text-gray-400 py-12 text-center">← Choisis une attraction à gauche.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-gray-900">{attractions.find((a) => a.slug === selected)?.titre}</h2>
                <a href={`/fr/sites/${selected}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-quebec-blue hover:underline">Voir la fiche →</a>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <input type="checkbox" checked={coup} onChange={(e) => setCoup(e.target.checked)} className="h-4 w-4" />
                ★ Coup de cœur (apparaît sur la page d'accueil)
              </label>

              <label className="block text-sm">
                <span className="block text-gray-500 mb-1">Priorité (plus haut = plus en avant dans les résultats et l'accueil)</span>
                <input type="number" value={prio} onChange={(e) => setPrio(e.target.value)} className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </label>

              <p className="text-xs text-gray-400">Astuce : laisse les deux vides pour retirer l'attraction de la mise en avant.</p>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={enregistrer} className="bg-quebec-blue hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">Enregistrer</button>
                {featured[selected] && <button onClick={retirer} className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2">Retirer</button>}
                {status && <span className="text-sm text-gray-600">{status}</span>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
