'use client'
import { useEffect, useMemo, useState } from 'react'

const VIS_DEFAUT = { adresse: true, telephone: true, site_web: true, courriel: false }

const CHAMP_VIDE = {
  featured: false, priorite: '', description_fr: '', description_en: '',
  page: '', page_contenu_fr: '', page_contenu_en: '',
  url: '', site_web: '', photo: '', adresse: '', telephone: '', courriel: '',
  visibilite: { ...VIS_DEFAUT },
}

export default function AdminServices() {
  const [etabs, setEtabs] = useState([])
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(CHAMP_VIDE)
  const [status, setStatus] = useState('')

  // Chargement initial
  useEffect(() => {
    fetch('/api/admin-services')
      .then((r) => r.json())
      .then((d) => {
        setEtabs(d.etablissements || [])
        setServices(d.services || {})
        setLoading(false)
      })
      .catch(() => { setStatus('Erreur de chargement'); setLoading(false) })
  }, [])

  // Liste = établissements de l'index + entrées du registre (union), filtrée
  const liste = useMemo(() => {
    const parNom = new Map(etabs.map((e) => [e.nom, e]))
    for (const nom of Object.keys(services)) {
      if (nom !== '_commentaire' && !parNom.has(nom)) parNom.set(nom, { nom, type: '', ville: '' })
    }
    let arr = [...parNom.values()]
    const q = query.trim().toLowerCase()
    if (q) arr = arr.filter((e) => e.nom.toLowerCase().includes(q))
    // Les fiches déjà pilotées d'abord
    arr.sort((a, b) => {
      const sa = services[a.nom] ? 0 : 1
      const sb = services[b.nom] ? 0 : 1
      if (sa !== sb) return sa - sb
      return a.nom.localeCompare(b.nom, 'fr')
    })
    return arr.slice(0, 150)
  }, [etabs, services, query])

  function selectEtab(nom) {
    setSelected(nom)
    setStatus('')
    const svc = services[nom]
    if (svc && typeof svc === 'object') {
      setForm({
        ...CHAMP_VIDE,
        ...svc,
        featured: !!svc.featured,
        priorite: svc.priorite ?? '',
        visibilite: { ...VIS_DEFAUT, ...(svc.visibilite || {}) },
      })
    } else {
      setForm({ ...CHAMP_VIDE, visibilite: { ...VIS_DEFAUT } })
    }
  }

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })) }
  function setVis(k, v) { setForm((f) => ({ ...f, visibilite: { ...f.visibilite, [k]: v } })) }

  async function enregistrer() {
    if (!selected) return
    setStatus('Enregistrement…')
    const res = await fetch('/api/admin-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: selected, data: form }),
    })
    const d = await res.json()
    if (d.ok) {
      setServices((s) => ({ ...s, [selected]: d.fiche }))
      setStatus('✓ Enregistré')
    } else {
      setStatus('Erreur : ' + (d.error || 'inconnue'))
    }
  }

  async function supprimer() {
    if (!selected || !services[selected]) return
    if (!confirm(`Retirer « ${selected} » du registre ?`)) return
    const res = await fetch('/api/admin-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: selected, supprimer: true }),
    })
    const d = await res.json()
    if (d.ok) {
      setServices((s) => { const c = { ...s }; delete c[selected]; return c })
      setForm(CHAMP_VIDE)
      setStatus('✓ Retiré du registre')
    }
  }

  const nbFiches = Object.keys(services).filter((k) => k !== '_commentaire').length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-quebec-navy text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin — Registre des services</h1>
          <p className="text-blue-200 text-sm">{nbFiches} fiche(s) pilotée(s) · {etabs.length} établissements au total</p>
        </div>
        <nav className="text-sm flex gap-3">
          <a href="/admin/photos" className="text-blue-200 hover:text-white underline">→ Opérations en lot</a>
          <a href="/admin/attractions" className="text-blue-200 hover:text-white underline">→ Mise en avant des attractions</a>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-[320px_1fr] gap-6">

        {/* Liste */}
        <aside className="bg-white rounded-2xl shadow-card p-4 h-fit md:sticky md:top-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un établissement…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-quebec-blue"
          />
          {loading ? (
            <p className="text-sm text-gray-400 py-4">Chargement…</p>
          ) : (
            <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
              {liste.map((e) => (
                <li key={e.nom}>
                  <button
                    onClick={() => selectEtab(e.nom)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selected === e.nom ? 'bg-quebec-blue text-white' : 'hover:bg-slate-100 text-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {services[e.nom] && <span className="text-quebec-gold">★</span>}
                      <span className="truncate">{e.nom}</span>
                    </span>
                    {e.region && <span className={`text-xs ${selected === e.nom ? 'text-blue-100' : 'text-gray-400'}`}>{e.region}</span>}
                  </button>
                </li>
              ))}
              {liste.length === 0 && <li className="text-sm text-gray-400 py-2">Aucun résultat</li>}
            </ul>
          )}
        </aside>

        {/* Éditeur */}
        <main className="bg-white rounded-2xl shadow-card p-6">
          {!selected ? (
            <p className="text-gray-400 py-12 text-center">← Choisis un établissement à gauche pour l'éditer.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-gray-900">{selected}</h2>
                {form.page && (
                  <a href={`/fr/lieu/${form.page}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-quebec-blue hover:underline">
                    Aperçu de la page →
                  </a>
                )}
              </div>

              {/* Mise en avant */}
              <div className="flex flex-wrap gap-5 items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} className="h-4 w-4" />
                  Mettre en avant (bloc « Nos sélections »)
                </label>
                <label className="text-sm">
                  <span className="block text-gray-500 mb-1">Priorité (plus haut = en tête)</span>
                  <input type="number" value={form.priorite} onChange={(e) => setField('priorite', e.target.value)} className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
              </div>

              <Field label="Description courte (FR)" value={form.description_fr} onChange={(v) => setField('description_fr', v)} />
              <Field label="Description courte (EN)" value={form.description_en} onChange={(v) => setField('description_en', v)} />

              <hr className="border-gray-100" />
              <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest">Page perso (optionnel)</p>
              <Field label="Slug de page (ex. barfly → /fr/lieu/barfly)" value={form.page} onChange={(v) => setField('page', v)} />
              <Field label="Contenu de page (FR)" value={form.page_contenu_fr} onChange={(v) => setField('page_contenu_fr', v)} textarea />
              <Field label="Contenu de page (EN)" value={form.page_contenu_en} onChange={(v) => setField('page_contenu_en', v)} textarea />

              <hr className="border-gray-100" />
              <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest">Lien & photo</p>
              <Field label="Lien d'affiliation / réservation (url)" value={form.url} onChange={(v) => setField('url', v)} />
              <PhotoField value={form.photo} onChange={(v) => setField('photo', v)} nom={selected} siteWeb={form.site_web} />

              <hr className="border-gray-100" />
              <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest">Coordonnées</p>
              <p className="text-xs text-gray-400 -mt-2">Coche « Afficher sur le site » pour les infos visibles par les visiteurs. Le courriel est privé par défaut.</p>
              <ContactField label="Site web officiel" value={form.site_web} onChange={(v) => setField('site_web', v)} pub={form.visibilite.site_web} onPub={(b) => setVis('site_web', b)} />
              <ContactField label="Adresse" value={form.adresse} onChange={(v) => setField('adresse', v)} pub={form.visibilite.adresse} onPub={(b) => setVis('adresse', b)} />
              <ContactField label="Téléphone" value={form.telephone} onChange={(v) => setField('telephone', v)} pub={form.visibilite.telephone} onPub={(b) => setVis('telephone', b)} />
              <ContactField label="Courriel de contact" value={form.courriel} onChange={(v) => setField('courriel', v)} pub={form.visibilite.courriel} onPub={(b) => setVis('courriel', b)} />
              <p className="text-xs text-gray-400 -mt-2">📧 Décoché = le courriel reste privé (visible seulement ici, pour ton démarchage).</p>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={enregistrer} className="bg-quebec-blue hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                  Enregistrer
                </button>
                {services[selected] && (
                  <button onClick={supprimer} className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2">
                    Retirer du registre
                  </button>
                )}
                {status && <span className="text-sm text-gray-600">{status}</span>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

// Champ de contact avec case « Afficher sur le site public »
function ContactField({ label, value, onChange, pub, onPub }) {
  return (
    <div>
      <Field label={label} value={value} onChange={onChange} />
      <label className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
        <input type="checkbox" checked={!!pub} onChange={(e) => onPub(e.target.checked)} className="h-3.5 w-3.5" />
        Afficher sur le site public
      </label>
    </div>
  )
}

// Champ photo avec téléversement (fichier ou URL) vers /images/services
function PhotoField({ value, onChange, nom, siteWeb }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [urlInput, setUrlInput] = useState('')

  async function envoyer({ file, url }) {
    if (!nom) { setMsg("Sélectionne d'abord un établissement."); return }
    setBusy(true); setMsg('Envoi…')
    const fd = new FormData()
    fd.append('folder', 'services')
    fd.append('filename', slugify(nom))
    if (file) fd.append('file', file)
    if (url) fd.append('url', url)
    try {
      const res = await fetch('/api/admin-save-image', { method: 'POST', body: fd })
      const d = await res.json()
      if (d.ok) { onChange(d.path); setMsg('✓ Photo enregistrée'); setUrlInput('') }
      else setMsg('Erreur : ' + (d.error || ''))
    } catch (e) { setMsg('Erreur : ' + e.message) }
    setBusy(false)
  }

  async function recupererDuSite() {
    if (!nom || !siteWeb) return
    setBusy(true); setMsg('Récupération depuis le site…')
    try {
      const res = await fetch('/api/admin-og', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: siteWeb, filename: nom }),
      })
      const d = await res.json()
      if (d.ok) { onChange(d.path); setMsg('✓ Photo récupérée du site') }
      else setMsg('Erreur : ' + (d.error || ''))
    } catch (e) { setMsg('Erreur : ' + e.message) }
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <span className="block text-gray-500 text-sm">Photo</span>
      {value && <img src={value} alt="" className="h-32 w-full object-cover rounded-lg border border-gray-200" />}
      <button
        type="button" disabled={busy || !siteWeb} onClick={recupererDuSite}
        title={siteWeb ? '' : "Renseigne d'abord le site web officiel"}
        className="w-full text-sm font-bold bg-quebec-blue text-white px-3 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition-colors"
      >
        📥 Récupérer la photo depuis le site officiel
      </button>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="/images/services/…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className={`text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer ${busy ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-quebec-blue hover:bg-blue-100'}`}>
          📤 Téléverser un fichier
          <input type="file" accept="image/*" className="hidden" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) envoyer({ file: f }) }} />
        </label>
        <input
          type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
          placeholder="…ou coller une URL d'image"
          className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <button type="button" disabled={busy || !urlInput} onClick={() => envoyer({ url: urlInput })}
          className="text-xs font-medium bg-slate-800 text-white px-3 py-1.5 rounded-lg disabled:opacity-40">
          Importer l'URL
        </button>
      </div>
      {msg && <p className="text-xs text-gray-500">{msg}</p>}
    </div>
  )
}

function Field({ label, value, onChange, textarea }) {
  return (
    <label className="block text-sm">
      <span className="block text-gray-500 mb-1">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
          placeholder="Sépare les paragraphes par une ligne vide."
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
        />
      )}
    </label>
  )
}
