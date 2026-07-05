import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllArticles, getArticleBySlug } from '@/lib/articles'
import { dicts, LANGS } from '@/lib/i18n'

export async function generateStaticParams() {
  const articles = getAllArticles()
  return LANGS.flatMap((lang) =>
    articles.map((a) => ({ lang, slug: a.slug }))
  )
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const content = article[lang] || article.en || article.fr
  return {
    title: `${content.titre} — J'aime le Québec`,
    description: content.resume,
    openGraph: article.photo ? { images: [{ url: article.photo }] } : undefined,
  }
}

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default async function ArticlePage({ params }) {
  const { lang, slug } = await params
  const t = dicts[lang]
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const content = article[lang] || article.en || article.fr
  const dateLocale = lang === 'fr' ? 'fr-CA' : lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-PT' : 'en-CA'
  const youtubeId = getYouTubeId(article.video)
  const bannerSrc = article.photo_bandeau || article.photo

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {bannerSrc && (bannerSrc.startsWith('/') || bannerSrc.startsWith('http')) ? (
          <Image src={bannerSrc} alt={content.titre} fill className="object-cover object-top" priority sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-quebec-blue to-quebec-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          {article.region && (
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">{article.region}</p>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">{content.titre}</h1>
        </div>
      </div>

      {/* Retour */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Link href={`/${lang}/articles`} className="text-sm text-quebec-blue hover:underline">
          {t.articles.back}
        </Link>
      </div>

      {/* Corps */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span>{new Date(article.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {article.auteur && <><span>·</span><span>{article.auteur}</span></>}
        </div>

        <p className="text-xl text-gray-600 italic leading-relaxed border-l-4 border-quebec-red pl-5 mb-8">
          {content.resume}
        </p>

        {/* Vidéo YouTube */}
        {youtubeId && (
          <div className="mb-8 rounded-xl overflow-hidden aspect-video shadow-md">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={content.titre}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        <div className="prose prose-lg prose-headings:font-display prose-headings:text-gray-900 prose-a:text-quebec-blue prose-img:rounded-xl prose-img:shadow-md prose-table:text-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img({ src, alt }) {
                if (!src) return null
                return (
                  <span className="block my-6">
                    <img src={src} alt={alt || ''} className="rounded-xl shadow-md w-full object-cover" />
                  </span>
                )
              },
            }}
          >
            {content.corps}
          </ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link href={`/${lang}/articles`} className="text-sm font-bold text-quebec-blue hover:underline">
            {t.articles.all}
          </Link>
          {article.region && (
            <Link href={`/${lang}/activites`} className="text-sm font-bold text-white bg-quebec-blue hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors">
              {t.articles.explore_region} {article.region} →
            </Link>
          )}
        </div>
      </article>
    </>
  )
}
