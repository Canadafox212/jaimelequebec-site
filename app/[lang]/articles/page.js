import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles } from '@/lib/articles'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return {
    title: `${t.nav.articles} — J'aime le Québec`,
    alternates: getAlternates('/articles'),
  }
}

export default async function ArticlesPage({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  const articles = getAllArticles()

  return (
    <>
      <div className="bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
            {t.nav.articles}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-1">
            {t.articles.subtitle}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-16">
            {t.articles.empty}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a) => {
              const content = a[lang] || a.en || a.fr
              const dateLocale = lang === 'fr' ? 'fr-CA' : lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-PT' : 'en-CA'
              return (
                <Link key={a.slug} href={`/${lang}/articles/${a.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="relative h-48 overflow-hidden">
                    {a.photo && (a.photo.startsWith('/') || a.photo.startsWith('http')) ? (
                      <Image src={a.photo} alt={content.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-quebec-blue to-quebec-navy flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    {a.featured && (
                      <span className="absolute top-3 left-3 bg-quebec-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {t.articles.featured_label}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <p className="text-xs text-gray-400">
                      {a.region && <span className="text-quebec-blue font-medium">{a.region} · </span>}
                      {new Date(a.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="font-display font-bold text-lg text-gray-900 group-hover:text-quebec-blue transition-colors leading-snug">
                      {content.titre}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{content.resume}</p>
                    <p className="mt-auto pt-2 text-sm font-bold text-quebec-blue group-hover:underline">
                      {t.articles.read}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
