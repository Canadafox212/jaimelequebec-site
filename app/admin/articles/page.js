'use client'
import { useState, useEffect } from 'react'

const REGIONS = ['Montréal','Québec','Laurentides','Lanaudière','Mauricie','Estrie','Montérégie','Outaouais','Abitibi-Témiscamingue','Côte-Nord','Saguenay–Lac-Saint-Jean','Bas-Saint-Laurent','Gaspésie','Îles-de-la-Madeleine','Charlevoix','Chaudière-Appalaches','Centre-du-Québec','Laval','Longueuil','Cantons-de-l\'Est']
const THEMES = ['rando-nature','sports-nautiques','sports-hiver','gastronomie-terroir','culture-patrimoine','familles-attractions','spa-bien-etre','aventure-pleinair','velo','golf','bars-vie-nocturne','musique-spectacle','parcs-jardins-faune','casino-jeux','peche','hebergement','sports-mecaniques']

const LANG_LABELS = { en: '🇬🇧 English', es: '🇪🇸 Español', de: '🇩🇪 Deutsch', pt: '🇵🇹 Português', ru: '🇷🇺 Русский', zh: '🇨🇳 中文', hi: '🇮🇳 हिन्दी' }
const EXTRA_LANGS = ['en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']

function emptyLang() { return { titre: '', resume: '', corps: '' } }

const EMPTY = {
  slug: '', date: new Date().toISOString().slice(0,10), photo: '', photo_bandeau: '', video: '', auteur: 'Philippe Goupil',
  region: '', themeId: '', featured: false,
  fr: emptyLang(),
  en: emptyLang(), es: null, de: null, pt: null, ru: null, zh: null, hi: null,
}

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState('')
  const [translating, setTranslating] = useState(false)
  const [translated, setTranslated] = useState([])
  const [openLang, setOpenLang] = useState(null)

  useEffect(() => { fetch('/api/admin-article').then(r=>r.json()).then(setArticles) }, [])

  function setFr(key, val) { setForm(f => ({...f, fr:{...f.fr,[key]:val}})) }
  function setLangField(lang, key, val) { setForm(f => ({...f, [lang]:{...(f[lang]||emptyLang()),[key]:val}})) }

  async function translate() {
    if (!form.fr.titre || !form.fr.corps) { setStatus('⚠ Remplis d\'abord le titre et le corps en français.'); return }
    setTranslating(true)
    setStatus('⏳ Traduction en cours (7 langues)…')
    setTranslated([])
    try {
      const res = await fetch('/api/admin-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fr: form.fr }),
      })
      const d = await res.json()
      if (!d.ok) { setStatus('❌ ' + (d.error || 'Erreur traduction')); return }
      const langs = d.translations
      setForm(f => ({ ...f, ...Object.fromEntries(EXTRA_LANGS.map(l => [l, langs[l] || emptyLang()])) }))
      setTranslated(EXTRA_LANGS.filter(l => langs[l]?.titre))
      setStatus('✓ 7 langues traduites — vérifie puis publie.')
    } catch (e) {
      setStatus('❌ Erreur réseau : ' + e.message)
    } finally {
      setTranslating(false)
    }
  }

  async function save() {
    setStatus('Enregistrement…')
    const res = await fetch('/api/admin-article', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const d = await res.json()
    if (d.ok) {
      setStatus('✓ Enregistré — slug: ' + d.slug)
      const updated = await fetch('/api/admin-article').then(r=>r.json())
      setArticles(updated)
      setForm(EMPTY); setEditing(null); setTranslated([])
    } else setStatus('Erreur')
  }

  async function del(slug) {
    if (!confirm('Supprimer cet article ?')) return
    await fetch('/api/admin-article', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({slug}) })
    setArticles(a => a.filter(x => x.slug !== slug))
  }

  function edit(a) {
    setForm({
      ...EMPTY, ...a,
      fr: a.fr || emptyLang(),
      ...Object.fromEntries(EXTRA_LANGS.map(l => [l, a[l] || null])),
    })
    setEditing(a.slug)
    setTranslated(EXTRA_LANGS.filter(l => a[l]?.titre))
    setStatus('')
    window.scrollTo(0,0)
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue'
  const lbl = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
  const area = inp + ' min-h-[120px] resize-y font-mono'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📰 Articles</h1>
        <a href="/admin/services" className="text-sm text-quebec-blue hover:underline">← Admin</a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">{editing ? `Modifier : ${editing}` : 'Nouvel article'}</h2>

        {/* Méta */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={lbl}>Date</label>
            <input type="date" className={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
          </div>
          <div>
            <label className={lbl}>Auteur</label>
            <input className={inp} value={form.auteur} onChange={e=>setForm(f=>({...f,auteur:e.target.value}))} />
          </div>
          <div>
            <label className={lbl}>Région</label>
            <select className={inp} value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))}>
              <option value="">— Aucune —</option>
              {REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Thème</label>
            <select className={inp} value={form.themeId} onChange={e=>setForm(f=>({...f,themeId:e.target.value}))}>
              <option value="">— Aucun —</option>
              {THEMES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={lbl}>Photo vignette (chemin /images/... ou URL)</label>
          <input className={inp} value={form.photo} onChange={e=>setForm(f=>({...f,photo:e.target.value}))} placeholder="/images/articles/mon-article.jpg" />
        </div>

        <div className="mb-4">
          <label className={lbl}>Photo bandeau (optionnel — si différente de la vignette)</label>
          <input className={inp} value={form.photo_bandeau} onChange={e=>setForm(f=>({...f,photo_bandeau:e.target.value}))} placeholder="/images/articles/mon-article-bandeau.jpg" />
        </div>

        <div className="mb-4">
          <label className={lbl}>Vidéo YouTube (URL)</label>
          <input className={inp} value={form.video} onChange={e=>setForm(f=>({...f,video:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} className="w-4 h-4" />
          <span className="text-sm font-medium">★ Article à la une</span>
        </label>

        {/* FR */}
        <div className="border-t pt-4 mb-2">
          <p className="font-bold text-quebec-blue mb-3">🇫🇷 Français — langue source</p>
          <div className="space-y-3">
            <div><label className={lbl}>Titre</label><input className={inp} value={form.fr.titre} onChange={e=>setFr('titre',e.target.value)} /></div>
            <div><label className={lbl}>Résumé (1-2 phrases)</label><textarea className={area} style={{minHeight:'60px'}} value={form.fr.resume} onChange={e=>setFr('resume',e.target.value)} /></div>
            <div><label className={lbl}>Corps (sépare les paragraphes par une ligne vide)</label><textarea className={area} style={{minHeight:'220px'}} value={form.fr.corps} onChange={e=>setFr('corps',e.target.value)} /></div>
          </div>
        </div>

        {/* Bouton traduction */}
        <div className="my-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={translate}
              disabled={translating}
              className="flex items-center gap-2 bg-quebec-blue text-white font-bold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translating ? '⏳ Traduction…' : '🌐 Traduire avec l\'IA (7 langues)'}
            </button>
            {translated.length > 0 && (
              <span className="text-sm text-green-700 font-medium">
                ✓ {translated.length} langues traduites : {translated.map(l => LANG_LABELS[l]?.split(' ')[0]).join(' ')}
              </span>
            )}
          </div>
          {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
        </div>

        {/* Langues traduites — accordéon */}
        {EXTRA_LANGS.map(lang => {
          const content = form[lang]
          const isDone = content?.titre
          const isOpen = openLang === lang
          return (
            <div key={lang} className={`border rounded-xl mb-2 overflow-hidden ${isDone ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
              <button
                type="button"
                onClick={() => setOpenLang(isOpen ? null : lang)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {LANG_LABELS[lang]}
                  {isDone && <span className="ml-2 text-green-600 text-xs font-bold">✓ traduit</span>}
                  {!isDone && <span className="ml-2 text-gray-400 text-xs">non traduit</span>}
                </span>
                <span className="text-gray-400 text-xs">{isOpen ? '▲ Fermer' : '▼ Voir / modifier'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <div className="mt-3"><label className={lbl}>Titre</label><input className={inp} value={content?.titre||''} onChange={e=>setLangField(lang,'titre',e.target.value)} /></div>
                  <div><label className={lbl}>Résumé</label><textarea className={area} style={{minHeight:'60px'}} value={content?.resume||''} onChange={e=>setLangField(lang,'resume',e.target.value)} /></div>
                  <div><label className={lbl}>Corps</label><textarea className={area} style={{minHeight:'180px'}} value={content?.corps||''} onChange={e=>setLangField(lang,'corps',e.target.value)} /></div>
                </div>
              )}
            </div>
          )
        })}

        <div className="flex gap-3 items-center mt-6">
          <button onClick={save} className="bg-quebec-blue text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors">
            {editing ? '💾 Mettre à jour' : '+ Publier'}
          </button>
          {editing && <button onClick={()=>{setForm(EMPTY);setEditing(null);setTranslated([]);setStatus('')}} className="text-sm text-gray-500 hover:underline">Annuler</button>}
        </div>
      </div>

      {/* Liste */}
      <h2 className="font-bold text-lg mb-3">Articles publiés ({articles.length})</h2>
      <div className="space-y-3">
        {articles.map(a=>{
          const langs = EXTRA_LANGS.filter(l => a[l]?.titre)
          return (
            <div key={a.slug} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div>
                <p className="font-semibold text-gray-900">{a.fr?.titre}</p>
                <p className="text-xs text-gray-400">{a.date} · {a.region||'—'} · <code className="bg-gray-100 px-1 rounded">{a.slug}</code></p>
                {langs.length > 0 && (
                  <p className="text-xs text-green-600 mt-0.5">🌐 {langs.map(l=>LANG_LABELS[l]?.split(' ')[0]).join(' ')}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={`/fr/articles/${a.slug}`} target="_blank" className="text-xs text-quebec-blue hover:underline px-2 py-1">Voir</a>
                <button onClick={()=>edit(a)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">Modifier</button>
                <button onClick={()=>del(a.slug)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg">Supprimer</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
