import Link from 'next/link'
import { getExpressionBySlug, getAllSlugs } from '@/lib/expressions'
import { getDictionary, LANGS, getAlternates } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return LANGS.flatMap(lang => slugs.map(slug => ({ lang, slug })))
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const expr = getExpressionBySlug(slug)
  if (!expr) return {}
  const isEn = lang === 'en'
  return {
    title: `${expr.mot} — ${isEn ? 'Quebec French expression' : 'Expression québécoise'} | J'aime le Québec`,
    description: expr.sens,
    alternates: getAlternates(`/expressions/${slug}`),
  }
}

const NIVEAU_COLOR = {
  'courant':  'bg-emerald-100 text-emerald-800',
  'familier': 'bg-amber-100 text-amber-800',
  'joual':    'bg-red-100 text-red-800',
  'vieilli':  'bg-gray-100 text-gray-500',
  'régional': 'bg-blue-100 text-blue-800',
}

function niveauColor(niveau) {
  if (!niveau) return 'bg-gray-100 text-gray-500'
  const key = Object.keys(NIVEAU_COLOR).find(k => niveau.toLowerCase().includes(k))
  return key ? NIVEAU_COLOR[key] : 'bg-gray-100 text-gray-500'
}

const CAT_LABEL = {
  fr: {
    'régionalisme québécois': 'Régionalisme québécois',
    'français commun':        'Français commun (sens québécois)',
    'anglicisme':             'Anglicisme',
    'création populaire':     'Création populaire',
    'vieux français':         'Vieux français conservé',
    'joual':                  'Joual',
    'autochtone':             'Origine autochtone',
    'anglais':                'Mot anglais',
  },
  en: {
    'régionalisme québécois': 'Quebec regionalism',
    'français commun':        'Common French (Quebec meaning)',
    'anglicisme':             'Anglicism',
    'création populaire':     'Popular creation',
    'vieux français':         'Old French (preserved)',
    'joual':                  'Joual',
    'autochtone':             'Indigenous origin',
    'anglais':                'English word',
  },
}

export default async function ExpressionPage({ params }) {
  const { lang, slug } = await params
  const expr = getExpressionBySlug(slug)
  if (!expr) notFound()

  const t = getDictionary(lang)
  const isEn = lang === 'en'
  const catLabel = CAT_LABEL[isEn ? 'en' : 'fr']?.[expr.categorie] ?? expr.categorie

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: expr.mot,
    description: expr.sens,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: "Dictionnaire du québécois — J'aime le Québec",
      url: `https://jaimelequebec.org/${lang}/expressions`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header fiche */}
        <div className="bg-quebec-navy text-white py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Link href={`/${lang}/expressions`}
              className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
              ← {isEn ? 'All expressions' : 'Toutes les expressions'}
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              {expr.niveau && (
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${niveauColor(expr.niveau)}`}>
                  {expr.niveau.split('/')[0].split(',')[0].trim()}
                </span>
              )}
              {expr.type && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-blue-200 italic">
                  {expr.type}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-2">
              {expr.mot}
            </h1>

            {catLabel && (
              <p className="text-blue-300 text-sm mt-2">{catLabel}</p>
            )}
          </div>
        </div>

        {/* Corps de la fiche */}
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

          {/* Sens */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
              {isEn ? 'Meaning in Quebec' : 'Sens au Québec'}
            </p>
            <p className="text-gray-800 text-lg leading-relaxed">{expr.sens}</p>
          </div>

          {/* Équivalent FR */}
          {expr.equivalent_fr && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">
                🇫🇷 {isEn ? 'French equivalent' : 'Équivalent en français de France'}
              </p>
              <p className="text-blue-900 text-base font-medium">{expr.equivalent_fr}</p>
            </div>
          )}

          {/* Exemple */}
          {expr.exemple && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-3">
                {isEn ? 'Example' : 'Exemple'}
              </p>
              <p className="text-amber-900 italic text-base leading-relaxed">« {expr.exemple} »</p>
            </div>
          )}

          {/* Commentaire humoristique */}
          {expr.commentaire && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                😄 {isEn ? 'Cultural note' : 'Note culturelle'}
              </p>
              <p className="text-gray-700 leading-relaxed italic">{expr.commentaire}</p>
            </div>
          )}

          {/* Lien vers le livre */}
          <div className="bg-quebec-navy text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0">
              <div className="w-16 h-24 rounded bg-white/10 flex items-center justify-center text-3xl">📖</div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-blue-300 mb-1">
                {isEn ? 'The book' : 'Le livre'}
              </p>
              <p className="font-bold text-white text-base mb-1">Comprendre le québécois en voyage</p>
              <p className="text-blue-200 text-sm leading-relaxed">
                {isEn
                  ? '300 Quebec expressions with etymologies, examples and humor — by Philippe Goupil.'
                  : '300 expressions québécoises avec étymologies, exemples et humour — par Philippe Goupil.'}
              </p>
              <a href="https://www.amazon.fr" target="_blank" rel="noopener noreferrer sponsored"
                className="inline-block mt-3 bg-white text-quebec-navy text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                {isEn ? 'See on Amazon →' : 'Voir sur Amazon →'}
              </a>
            </div>
          </div>

          {/* Retour */}
          <div className="text-center pt-4">
            <Link href={`/${lang}/expressions`}
              className="inline-block border-2 border-quebec-navy text-quebec-navy font-bold px-8 py-3 rounded-full hover:bg-quebec-navy hover:text-white transition-colors text-sm">
              {isEn ? '← Back to all expressions' : '← Toutes les expressions'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
