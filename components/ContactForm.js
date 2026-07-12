'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import COUNTRIES from '@/data/countries'

function ContactFormInner({ c, lang }) {
  const searchParams = useSearchParams()
  const [fields, setFields] = useState({
    nom: '', ville: '', pays: '', email: '', objet: '', message: '', _hp: '',
  })
  const mountTime = useState(() => Date.now())[0]
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    const sujet = searchParams.get('sujet')
    if (sujet) setFields((f) => ({ ...f, objet: decodeURIComponent(sujet) }))
  }, [searchParams])

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, lang, _ts: Date.now() - mountTime }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <span className="text-5xl block mb-4">✅</span>
        <p className="text-green-800 font-semibold text-lg leading-relaxed">{c.form_thanks}</p>
      </div>
    )
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-quebec-blue focus:border-transparent placeholder-gray-400 bg-white'
  const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* NOM + EMAIL — obligatoires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>{c.form_name} <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={fields.nom}
            onChange={set('nom')}
            placeholder={c.form_name}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{c.form_email_field} <span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            value={fields.email}
            onChange={set('email')}
            placeholder="exemple@email.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* VILLE + PAYS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>{c.form_city}</label>
          <input
            type="text"
            value={fields.ville}
            onChange={set('ville')}
            placeholder={c.form_city}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{c.form_country}</label>
          <select
            value={fields.pays}
            onChange={set('pays')}
            className={inputClass}
          >
            <option value="">{c.form_country}</option>
            {(COUNTRIES[lang] ?? COUNTRIES.fr).pinned.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option disabled>- - - - - - - - - - - - - - -</option>
            {(COUNTRIES[lang] ?? COUNTRIES.fr).list.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option disabled>- - - - - - - - - - - - - - -</option>
            <option value="__other__">{(COUNTRIES[lang] ?? COUNTRIES.fr).other}</option>
          </select>
        </div>
      </div>

      {/* OBJET */}
      <div>
        <label className={labelClass}>{c.form_subject}</label>
        <input
          type="text"
          value={fields.objet}
          onChange={set('objet')}
          placeholder={c.form_subject}
          className={inputClass}
        />
      </div>

      {/* MESSAGE */}
      <div>
        <label className={labelClass}>{c.form_message}</label>
        <textarea
          rows={5}
          value={fields.message}
          onChange={set('message')}
          placeholder={c.form_message}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Honeypot — invisible pour les humains, piège pour les bots */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <input
          type="text"
          name="website"
          value={fields._hp}
          onChange={set('_hp')}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {c.form_error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">{c.form_required}</p>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-quebec-navy hover:bg-quebec-blue disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          {status === 'loading' ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : '✉️'}
          {c.form_send}
        </button>
      </div>
    </form>
  )
}

export default function ContactForm({ c, lang }) {
  return (
    <Suspense fallback={null}>
      <ContactFormInner c={c} lang={lang} />
    </Suspense>
  )
}
