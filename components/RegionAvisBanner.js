'use client'
import { useState, useEffect } from 'react'
import QuebecRegionMap from './QuebecRegionMap'

const T = {
  fr: {
    results_for: 'RÉSULTATS POUR',
    results:     'résultats',
    write:       'Laisser un avis',
    first:       'Soyez le premier à laisser un avis !',
    n_avis:      (n) => `${n} avis · voir`,
    hide:        'Fermer',
    prenom:      'Prénom',
    ville:       'Ville (pays)',
    note:        'Note',
    texte_ph:    'Votre expérience dans cette région… (10–500 caractères)',
    submit:         'Publier',
    submitting:     'Publication…',
    success:        'Merci ! Votre avis a été publié.',
    error:          'Erreur, réessayez.',
    note_required:  'Choisissez une note avant de publier',
    le:             'le',
  },
  en: {
    results_for:    'RESULTS FOR',
    results:        'results',
    write:          'Leave a review',
    first:          'Be the first to leave a review!',
    n_avis:         (n) => `${n} review${n > 1 ? 's' : ''} · view`,
    hide:           'Close',
    prenom:         'First name',
    ville:          'City (country)',
    note:           'Rating',
    texte_ph:       'Your experience in this region… (10–500 characters)',
    submit:         'Publish',
    submitting:     'Publishing…',
    success:        'Thank you! Your review has been published.',
    error:          'Error, please try again.',
    note_required:  'Please choose a rating before publishing',
    le:             'on',
  },
}

function Stars({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'text-3xl' : 'text-xl'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n =>
        onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`${sz} transition-transform cursor-pointer hover:scale-110`}
          >
            {n <= (hover || value) ? '★' : '☆'}
          </button>
        ) : (
          <span key={n} className={`${sz} cursor-default`}>
            {n <= value ? '★' : '☆'}
          </span>
        )
      )}
    </div>
  )
}

function AvisRow({ avis, lang }) {
  const t = T[lang] ?? T.en
  const date = new Date(avis.date).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
  return (
    <div className="flex items-start gap-3 py-3 border-t border-slate-100 first:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
        {avis.prenom.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="font-bold text-sm text-slate-800">{avis.prenom}</span>
          <span className="text-xs text-slate-400">{avis.ville}</span>
          <Stars value={avis.note} size="md" />
          <span className="text-xs text-slate-400">{t.le} {date}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{avis.texte}</p>
      </div>
    </div>
  )
}

export default function RegionAvisBanner({ regionNum, nom, resultCount, lang }) {
  const t = T[lang] ?? T.en
  const cible = String(regionNum)

  const [avis,     setAvis]     = useState([])
  const [loaded,   setLoaded]   = useState(false)
  const [panel,    setPanel]    = useState(null)  // null | 'form' | 'list'
  const [status,   setStatus]   = useState(null)  // null | 'sending' | 'ok' | 'error'

  const [prenom,    setPrenom]    = useState('')
  const [ville,     setVille]     = useState('')
  const [note,      setNote]      = useState(0)
  const [texte,     setTexte]     = useState('')
  const [noteError, setNoteError] = useState(false)

  useEffect(() => {
    fetch(`/api/avis?type=region&cible=${cible}`)
      .then(r => r.json())
      .then(data => { setAvis(Array.isArray(data) ? data : []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [cible])

  async function submit(e) {
    e.preventDefault()
    if (!note) { setNoteError(true); return }
    setNoteError(false)
    setStatus('sending')
    try {
      const res = await fetch('/api/avis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prenom, ville, note, texte, type: 'region', cible, _hp: '' }),
      })
      const data = await res.json()
      if (data.ok) {
        setAvis(prev => [data.avis, ...prev])
        setStatus('ok')
        setPrenom(''); setVille(''); setNote(0); setTexte('')
        setTimeout(() => { setStatus(null); setPanel('list') }, 2500)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const moy = avis.length
    ? (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
    : null

  return (
    <div className="mb-5">
      {/* ── Bannière principale ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-blue-100">
        <QuebecRegionMap regionNum={regionNum} />

        {/* Infos région */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            {t.results_for}
          </p>
          <p className="font-bold text-lg text-slate-800 leading-tight">{nom}</p>
          <p className="text-sm text-slate-500 mt-1">{resultCount} {t.results}</p>
        </div>

        {/* Bouton avis + résumé */}
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <button
            onClick={() => setPanel(panel === 'form' ? null : 'form')}
            className="inline-flex items-center gap-2 bg-[#001a4d] hover:bg-blue-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            ✏️ {t.write}
          </button>

          {loaded && (
            avis.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t.first}</p>
            ) : (
              <button
                onClick={() => setPanel(panel === 'list' ? null : 'list')}
                className="text-xs text-quebec-blue hover:underline font-semibold flex items-center gap-1"
              >
                {moy && <Stars value={Math.round(Number(moy))} size="md" />}
                <span>{t.n_avis(avis.length)}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Formulaire ─────────────────────────────────────────────────── */}
      {panel === 'form' && status !== 'ok' && (
        <form
          onSubmit={submit}
          className="mt-3 bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4"
        >
          <input type="text" name="_hp" value="" onChange={() => {}} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div className="relative">
            <label className={`block text-sm font-bold mb-1.5 ${noteError ? 'text-red-600' : 'text-gray-700'}`}>
              {t.note} *
            </label>
            <Stars value={note} onChange={(v) => { setNote(v); setNoteError(false) }} size="lg" />
            {noteError && (
              <div className="absolute left-0 top-full mt-2 z-20 pointer-events-none">
                <div className="relative bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  <span className="absolute -top-1.5 left-5 block w-3 h-3 bg-red-500 rotate-45 rounded-sm" />
                  ⭐ {t.note_required}
                </div>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.prenom} *</label>
              <input
                type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                maxLength={50} required placeholder="Marie-Claude"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.ville} *</label>
              <input
                type="text" value={ville} onChange={e => setVille(e.target.value)}
                maxLength={50} required placeholder="Lyon, France"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <textarea
              value={texte} onChange={e => setTexte(e.target.value)}
              rows={3} minLength={10} maxLength={500} required
              placeholder={t.texte_ph}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-0.5 text-right">{texte.length}/500</p>
          </div>

          {status === 'error' && <p className="text-sm text-red-600 font-medium">{t.error}</p>}

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-[#001a4d] hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              {status === 'sending' ? t.submitting : t.submit}
            </button>
            <button type="button" onClick={() => { setPanel(null); setStatus(null) }} className="text-sm text-gray-400 hover:text-gray-600">
              {t.hide}
            </button>
          </div>
        </form>
      )}

      {/* Confirmation */}
      {status === 'ok' && panel !== 'list' && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold">
          ✅ {t.success}
        </div>
      )}

      {/* ── Liste des avis ──────────────────────────────────────────────── */}
      {panel === 'list' && avis.length > 0 && (
        <div className="mt-3 bg-white border border-slate-100 rounded-2xl px-5 py-2 shadow-sm">
          {avis.map(a => <AvisRow key={a.id} avis={a} lang={lang} />)}
        </div>
      )}
    </div>
  )
}
