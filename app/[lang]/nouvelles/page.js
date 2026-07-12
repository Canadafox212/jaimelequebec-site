import Link from 'next/link'
import Image from 'next/image'
import { getDictionary, getAlternates } from '@/lib/i18n'
import articles from '@/data/articles.json'

export async function generateMetadata({ params }) {
  const { lang } = await params
  return {
    title: lang === 'fr'
      ? "Dernières nouvelles — J'aime le Québec"
      : "Latest News — J'aime le Québec",
    description: lang === 'fr'
      ? 'Découvrez les dernières nouvelles, conseils et inspirations pour visiter le Québec.'
      : 'Discover the latest news, tips and inspiration for visiting Québec.',
    alternates: getAlternates('/nouvelles'),
  }
}

export default async function NouvellesPage({ params }) {
  const { lang } = await params
  const isFr = lang === 'fr'

  const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date))

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(isFr ? 'fr-CA' : 'en-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-quebec-navy to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">
            {isFr ? 'J\'aime le Québec' : 'J\'aime le Québec'}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {isFr ? 'Dernières nouvelles' : 'Latest News'}
          </h1>
          <p className="mt-3 text-blue-200 text-sm">
            {isFr
              ? 'Conseils, découvertes et inspirations pour visiter le Québec'
              : 'Tips, discoveries and inspiration for visiting Québec'}
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-400 py-20">
            {isFr ? 'Aucun article pour l\'instant.' : 'No articles yet.'}
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {sorted.map((article) => {
              const titre = article[lang]?.titre ?? article.fr?.titre ?? article.en?.titre ?? ''
              const resume = article[lang]?.resume ?? article.fr?.resume ?? article.en?.resume ?? ''
              return (
                <Link
                  key={article.slug}
                  href={`/${lang}/articles/${article.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row"
                >
                  {/* Photo */}
                  {article.photo && (
                    <div className="relative h-52 sm:h-auto sm:w-64 flex-shrink-0">
                      <Image
                        src={article.photo}
                        alt={titre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 256px"
                      />
                      {article.featured && (
                        <span className="absolute top-3 left-3 bg-quebec-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          ★ {isFr ? 'À la une' : 'Featured'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(article.date)}</span>
                      {article.region && (
                        <>
                          <span>·</span>
                          <span className="text-quebec-blue font-medium">📍 {article.region}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-xl font-bold text-gray-900 leading-snug group-hover:text-quebec-blue transition-colors">
                      {titre}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{resume}</p>
                    <span className="mt-auto text-xs font-bold text-quebec-blue group-hover:underline">
                      {isFr ? 'Lire l\'article →' : 'Read article →'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Retour */}
        <div className="mt-10 text-center">
          <Link
            href={`/${lang}`}
            className="text-sm text-gray-400 hover:text-quebec-blue transition-colors"
          >
            ← {isFr ? 'Retour à l\'accueil' : 'Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
