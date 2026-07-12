import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return { title: t.contact.meta_title, alternates: getAlternates('/contact') }
}

export default async function ContactPage({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  const c = t.contact

  return (
    <div className="min-h-screen bg-white">

      {/* Héros */}
      <div className="bg-gradient-to-br from-quebec-navy via-blue-900 to-blue-800 text-white py-14">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold text-quebec-gold uppercase tracking-widest mb-3">
            {t.footer.contact_label}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-3">
            {c.hero_title}
          </h1>
          <p className="text-blue-200 text-lg max-w-xl">
            {c.hero_subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* Formulaire de contact */}
        <section className="bg-gray-50 rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            {c.visitors_title}
          </h2>
          <p className="text-gray-500 text-sm mb-6">{c.response_note}</p>

          <ContactForm c={c} lang={lang} />
        </section>

        {/* Avis sur le site */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <Link
            href={`/${lang}/sites`}
            className="group flex items-center gap-4 hover:bg-gray-50 rounded-xl px-2 py-2 transition-colors"
          >
            <span className="text-3xl shrink-0">⭐</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-quebec-blue transition-colors">
                {c.avis_label}
              </p>
              <p className="text-sm text-gray-500">{c.avis_desc}</p>
              <p className="text-xs text-quebec-blue mt-0.5">{c.avis_cta}</p>
            </div>
          </Link>
        </section>

        {/* Professionnels du tourisme */}
        <section className="border border-quebec-navy/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0 mt-1">🏢</span>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
                {c.merchants_title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                {c.merchants_body}
              </p>
              <Link
                href={`/${lang}/contact?sujet=${encodeURIComponent(c.form_professional_subject)}`}
                className="inline-flex items-center gap-2 bg-quebec-navy hover:bg-quebec-blue text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                ✉️ {c.merchants_email_label}
              </Link>
            </div>
          </div>
        </section>

        {/* Retour */}
        <div className="text-center">
          <Link
            href={`/${lang}`}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← {t.nav.home}
          </Link>
        </div>

      </div>
    </div>
  )
}
