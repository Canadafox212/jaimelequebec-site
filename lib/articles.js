import { readFileSync } from 'fs'
import { join } from 'path'

function load() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', 'articles.json'), 'utf8'))
  } catch { return [] }
}

function isPublished(article) {
  return new Date(article.date) <= new Date()
}

export function getAllArticles() {
  return load()
    .filter(isPublished)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getArticleBySlug(slug) {
  const article = load().find((a) => a.slug === slug) ?? null
  if (!article || !isPublished(article)) return null
  return article
}

export function getFeaturedArticles(limit = 3) {
  return getAllArticles().filter((a) => a.featured).slice(0, limit)
}
