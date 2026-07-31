import ExpressionSearch from '@/components/ExpressionSearch'
import { getAllExpressions } from '@/lib/expressions'
import { getDictionary, LANGS, getAlternates } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn
      ? "Quebec French Dictionary — Words & Expressions | J'aime le Québec"
      : "Dictionnaire québécois — Mots et expressions | J'aime le Québec",
    description: isEn
      ? '3,000 Quebec French words and expressions — with their meaning and French-France equivalent.'
      : '3 000 mots et expressions du vocabulaire québécois — avec leur sens et leur équivalent en français de France.',
    alternates: getAlternates('/expressions'),
  }
}

export default async function ExpressionsPage({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) notFound()

  const expressions = getAllExpressions()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-quebec-navy text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-blue-300 mb-3">
            {lang === 'fr' ? 'Guide linguistique' : 'Language Guide'}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {lang === 'fr' ? 'Parlez québécois !' : 'Speak Quebec French!'}
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {lang === 'fr'
              ? '3 000 mots et expressions du vocabulaire québécois — avec leur sens, leur équivalent en français de France.'
              : '3,000 Quebec French words and expressions — with their meaning and French-France equivalent.'}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ExpressionSearch expressions={expressions} lang={lang} t={t} />
      </div>
    </div>
  )
}
