'use client'
import { useState, useEffect } from 'react'

const T = {
  fr: {
    title:       'Avis des voyageurs',
    write:       'Laisser un avis',
    prenom:      'Prénom',
    ville:       'Ville (pays)',
    note:        'Note',
    texte:       'Votre avis',
    texte_ph:    'Partagez votre expérience… (10 à 500 caractères)',
    submit:         'Publier mon avis',
    submitting:     'Publication…',
    success:        'Merci ! Votre avis a été publié.',
    error:          'Une erreur est survenue. Réessayez.',
    no_avis:        'Soyez le premier à laisser un avis !',
    note_required:  'Choisissez une note avant de publier',
    le:             'le',
  },
  en: {
    title:          'Traveller reviews',
    write:          'Leave a review',
    prenom:         'First name',
    ville:          'City (country)',
    note:           'Rating',
    texte:          'Your review',
    texte_ph:       'Share your experience… (10 to 500 characters)',
    submit:         'Publish my review',
    submitting:     'Publishing…',
    success:        'Thank you! Your review has been published.',
    error:          'An error occurred. Please try again.',
    no_avis:        'Be the first to leave a review!',
    note_required:  'Please choose a rating before publishing',
    le:             'on',
  },
}

function dict(lang) {
  return T[lang] ?? T.en
}

function Stars({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'text-3xl' : 'text-xl'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${sz} transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          {n <= (hover || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

function AvisCard({ avis, lang }) {
  const t = dict(lang)
  const date = new Date(avis.date).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-quebec-blue to-quebec-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
            {avis.prenom.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{avis.prenom}</p>
            <p className="text-xs text-gray-400">{avis.ville}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Stars value={avis.note} size="md" />
          <p className="text-xs text-gray-400">{t.le} {date}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{avis.texte}</p>
    </div>
  )
}

function moyenne(avis) {
  if (!avis.length) return 0
  return (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
}

export default function AvisSection({ type, cible, lang = 'fr' }) {
  const t = dict(lang)
  const [avis,      setAvis]     = useState([])
  const [loaded,    setLoaded]   = useState(false)
  const [showForm,  setShowForm] = useState(false)
  const [status,    setStatus]   = useState(null) // null | 'sending' | 'ok' | 'error'
  const [errMsg,    setErrMsg]   = useState('')

  const [prenom,    setPrenom]    = useState('')
  const [ville,     setVille]     = useState('')
  const [note,      setNote]      = useState(0)
  const [texte,     setTexte]     = useState('')
  const [noteError, setNoteError] = useState(false)

  useEffect(() => {
    fetch(`/api/avis?type=${type}&cible=${encodeURIComponent(cible)}`)
      .then(r => r.json())
      .then(data => { setAvis(Array.isArray(data) ? data : []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [type, cible])

  async function submit(e) {
    e.preventDefault()
    if (!note) { setNoteError(true); return }
    setNoteError(false)
    setStatus('sending')
    setErrMsg('')
    try {
      const res = await fetch('/api/avis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prenom, ville, note, texte, type, cible, _hp: '' }),
      })
      const data = await res.json()
      if (data.ok) {
        setAvis(prev => [data.avis, ...prev])
        setStatus('ok')
        setPrenom(''); setVille(''); setNote(0); setTexte('')
        setTimeout(() => { setStatus(null); setShowForm(false) }, 3000)
      } else {
        setErrMsg(data.error ?? t.error)
        setStatus('error')
      }
    } catch {
      setStatus('error')
      setErrMsg(t.error)
    }
  }

  const moy = moyenne(avis)

  return (
    <section className="mt-14 pt-10 border-t border-gray-100">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">{t.title}</h2>
          {avis.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars value={Math.round(moy)} size="md" />
              <span className="font-bold text-gray-800">{moy}</span>
              <span className="text-sm text-gray-400">({avis.length})</span>
            </div>
          )}
        </div>
        {!showForm && status !== 'ok' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-quebec-blue hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            ✏️ {t.write}
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && status !== 'ok' && (
        <form onSubmit={submit} className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 space-y-4">
          {/* Honeypot invisible */}
          <input type="text" name="_hp" value="" onChange={() => {}} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          {/* Note */}
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

          {/* Prénom + Ville */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.prenom} *</label>
              <input
                type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                maxLength={50} required
                placeholder="Marie-Claude"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.ville} *</label>
              <input
                type="text" value={ville} onChange={e => setVille(e.target.value)}
                maxLength={50} required
                placeholder="Lyon, France"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue bg-white"
              />
            </div>
          </div>

          {/* Texte */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t.texte} *</label>
            <textarea
              value={texte} onChange={e => setTexte(e.target.value)}
              rows={4} minLength={10} maxLength={500} required
              placeholder={t.texte_ph}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{texte.length}/500</p>
          </div>

          {errMsg && <p className="text-sm text-red-600 font-medium">{errMsg}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-quebec-blue hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              {status === 'sending' ? t.submitting : t.submit}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setStatus(null) }}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Confirmation */}
      {status === 'ok' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 text-green-700 font-semibold text-sm">
          ✅ {t.success}
        </div>
      )}

      {/* Liste des avis */}
      {loaded && avis.length === 0 && (
        <p className="text-gray-400 text-sm italic py-4">{t.no_avis}</p>
      )}
      <div className="space-y-4">
        {avis.map(a => <AvisCard key={a.id} avis={a} lang={lang} />)}
      </div>
    </section>
  )
}
