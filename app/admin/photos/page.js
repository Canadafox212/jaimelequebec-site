'use client'
import { useEffect, useMemo, useState } from 'react'

const VIS_KEYS = [['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['courriel', 'Courriel'], ['site_web', 'Site web']]

export default function AdminLot() {
  const [services, setServices] = useState({})
  const [etabs, setEtabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState('')
  const [theme, setTheme] = useState('')
  const [registreSeul, setRegistreSeul] = useState(false)
  const [checked, setChecked] = useState(() => new Set())
  const [statuts, setStatuts] = useState({})
  const [busy, setBusy] = useState(false)
  // params d'action
  const [prio, setPrio] = useState('5')
  const [vis, setVis] = useState({ adresse: true, telephone: true, courriel: false, site_web: true })

  useEffect(() => {
    fetch('/api/admin-services').then((r) => r.json()).then((d) => {
      setServices(d.services || {}); setEtabs(d.etablissements || []); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const regions = useMemo(() => [...new Set(etabs.map((e) => e.region))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr')), [etabs])
  const themes = useMemo(() => [...new Set(etabs.map((e) => e.theme))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr')), [etabs])

  const visibles = useMemo(() => etabs.filter((e) => {
    if (region && e.region !== region) return false
    if (theme && e.theme !== theme) return false
    if (registreSeul && !services[e.nom]) return false
    return true
  }).slice(0, 250), [etabs, region, theme, registreSeul, services])

  const cochesVisibles = visibles.filter((e) => checked.has(e.nom))

  function toggle(nom) { setChecked((s) => { const c = new Set(s); c.has(nom) ? c.delete(nom) : c.add(nom); return c }) }
  function cocherVisibles() { setChecked(new Set(visibles.map((e) => e.nom))) }
  function toutDecocher() { setChecked(new Set()); setStatuts({}) }

  // applique une transformation de fiche à chaque coché et persiste
  async function appliquer(transform, label) {
    if (!cochesVisibles.length) return
    setBusy(true)
    for (const e of cochesVisibles) {
      setStatuts((s) => ({ ...s, [e.nom]: '⏳' }))
      try {
        const data = transform({ ...(services[e.nom] || {}) }, e)
        const res = await fetch('/api/admin-services', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom: e.nom, data }),
        }).then((x) => x.json())
        if (res.ok) { setServices((sv) => ({ ...sv, [e.nom]: res.fiche })); setStatuts((s) => ({ ...s, [e.nom]: '✓ ' + label })) }
        else setStatuts((s) => ({ ...s, [e.nom]: '✗ ' + (res.error || '') }))
      } catch (err) { setStatuts((s) => ({ ...s, [e.nom]: '✗ ' + err.message })) }
    }
    setBusy(false)
  }

  const mettreEnAvant = () => appliquer((f) => ({ ...f, featured: true, priorite: Number(prio) || 1 }), 'en avant')
  const retirerEnAvant = () => appliquer((f) => { const c = { ...f }; delete c.featured; return c }, 'retiré')
  const appliquerVisibilite = () => appliquer((f) => ({ ...f, visibilite: { ...vis } }), 'visibilité')

  async function recupererPhotos() {
    const cibles = cochesVisibles.filter((e) => services[e.nom]?.site_web)
    if (!cibles.length) { setStatuts((s) => ({ ...s, _info: 'Aucun coché n\'a de site web' })); return }
    setBusy(true)
    for (const e of cibles) {
      setStatuts((s) => ({ ...s, [e.nom]: '⏳' }))
      try {
        const og = await fetch('/api/admin-og', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: services[e.nom].site_web, filename: e.nom }) }).then((x) => x.json())
        if (!og.ok) { setStatuts((s) => ({ ...s, [e.nom]: '✗ ' + (og.error || '') })); continue }
        const fiche = { ...(services[e.nom] || {}), photo: og.path }
        const save = await fetch('/api/admin-services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: e.nom, data: fiche }) }).then((x) => x.json())
        if (save.ok) { setServices((sv) => ({ ...sv, [e.nom]: save.fiche })); setStatuts((s) => ({ ...s, [e.nom]: '✓ photo' })) }
        else setStatuts((s) => ({ ...s, [e.nom]: '✗ sauvegarde' }))
      } catch (err) { setStatuts((s) => ({ ...s, [e.nom]: '✗ ' + err.message })) }
    }
    setBusy(false)
  }

  const nbCochesAvecSite = cochesVisibles.filter((e) => services[e.nom]?.site_web).length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-quebec-navy text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin — Opérations en lot</h1>
          <p className="text-blue-200 text-sm">{cochesVisibles.length} coché(s) · {visibles.length} affiché(s)</p>
        </div>
        <nav className="text-sm flex gap-3">
          <a href="/admin/services" className="text-blue-200 hover:text-white underline">→ Registre</a>
          <a href="/admin/attractions" className="text-blue-200 hover:text-white underline">→ Attractions</a>
        </nav>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-gray-500 uppercase">Région</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="">Toutes</option>{regions.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-gray-500 uppercase">Thème</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="">Tous</option>{themes.map((th) => <option key={th} value={th}>{th}</option>)}</select>
          </label>
          <label className="flex items-center gap-2 text-sm py-2"><input type="checkbox" checked={registreSeul} onChange={(e) => setRegistreSeul(e.target.checked)} className="h-4 w-4" />Dans le registre seulement</label>
          <button onClick={cocherVisibles} className="text-xs font-semibold text-quebec-blue py-2">Tout cocher ({visibles.length})</button>
          {checked.size > 0 && <button onClick={toutDecocher} className="text-xs text-gray-500 py-2">Décocher</button>}
        </div>

        {/* Actions en lot */}
        <div className="bg-white rounded-2xl shadow-card p-4 grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-wider">★ Mise en avant</p>
            <label className="text-xs text-gray-500 flex items-center gap-2">Priorité <input type="number" value={prio} onChange={(e) => setPrio(e.target.value)} className="w-16 border border-gray-200 rounded px-2 py-1" /></label>
            <button onClick={mettreEnAvant} disabled={busy || !cochesVisibles.length} className="w-full bg-quebec-gold text-white text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-40">Mettre en avant</button>
            <button onClick={retirerEnAvant} disabled={busy || !cochesVisibles.length} className="w-full text-xs text-gray-500 hover:text-red-600">Retirer la mise en avant</button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-wider">👁 Visibilité publique</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {VIS_KEYS.map(([k, lbl]) => (
                <label key={k} className="text-xs text-gray-700 flex items-center gap-1"><input type="checkbox" checked={vis[k]} onChange={(e) => setVis((v) => ({ ...v, [k]: e.target.checked }))} className="h-3.5 w-3.5" />{lbl}</label>
              ))}
            </div>
            <button onClick={appliquerVisibilite} disabled={busy || !cochesVisibles.length} className="w-full bg-slate-800 text-white text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-40">Appliquer la visibilité</button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-quebec-gold uppercase tracking-wider">📥 Photos</p>
            <p className="text-xs text-gray-400">{nbCochesAvecSite} coché(s) ont un site web</p>
            <button onClick={recupererPhotos} disabled={busy || !nbCochesAvecSite} className="w-full bg-quebec-blue text-white text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-40">Récupérer les photos</button>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          {loading ? <p className="text-gray-400 py-6 text-center">Chargement…</p> : (
            <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {visibles.map((e) => {
                const f = services[e.nom]
                return (
                  <li key={e.nom} className="flex items-center gap-3 py-2">
                    <input type="checkbox" checked={checked.has(e.nom)} onChange={() => toggle(e.nom)} className="h-4 w-4 shrink-0" />
                    {f?.photo ? <img src={f.photo} alt="" className="h-9 w-12 object-cover rounded shrink-0" /> : <span className="h-9 w-12 rounded bg-slate-100 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {f?.featured && <span className="text-quebec-gold">★ </span>}{e.nom}
                        {f?.site_web && <span className="text-emerald-600" title={f.site_web}> 🌐</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{e.region} · {e.theme}</p>
                    </div>
                    <span className="text-xs shrink-0 w-28 text-right text-gray-600">{statuts[e.nom] || ''}</span>
                  </li>
                )
              })}
              {visibles.length === 0 && <li className="text-gray-400 py-6 text-center text-sm">Aucun établissement pour ce filtre.</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
