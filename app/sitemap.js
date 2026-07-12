import { getAllAttractions } from '@/lib/attractions'
import { getRegionsWithCounts } from '@/lib/activites'
import { getAllArticles } from '@/lib/articles'
import { LANGS } from '@/lib/i18n'

const BASE = 'https://jaimelequebec.org'

function alts(path) {
  const langs = Object.fromEntries(LANGS.map(l => [l, `${BASE}/${l}${path}`]))
  return { languages: { ...langs, 'x-default': `${BASE}/fr${path}` } }
}

export default function sitemap() {
  const attractions = getAllAttractions()
  const regions = getRegionsWithCounts()
  const articles = getAllArticles()
  const now = new Date()
  const entries = []

  // Pages statiques
  const staticPages = [
    { path: '',            priority: 1.0, freq: 'weekly'  },
    { path: '/sites',      priority: 0.9, freq: 'weekly'  },
    { path: '/activites',  priority: 0.8, freq: 'weekly'  },
    { path: '/decouvrir',  priority: 0.8, freq: 'monthly' },
    { path: '/planifier',  priority: 0.7, freq: 'monthly' },
    { path: '/nouvelles',  priority: 0.7, freq: 'weekly'  },
    { path: '/articles',   priority: 0.7, freq: 'weekly'  },
  ]

  for (const { path, priority, freq } of staticPages) {
    for (const lang of LANGS) {
      entries.push({ url: `${BASE}/${lang}${path}`, lastModified: now, changeFrequency: freq, priority, alternates: alts(path) })
    }
  }

  // Fiches attractions (198 × 5 langues)
  for (const a of attractions) {
    const path = `/sites/${a.slug}`
    for (const lang of LANGS) {
      entries.push({ url: `${BASE}/${lang}${path}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7, alternates: alts(path) })
    }
  }

  // Pages régions
  for (const r of regions) {
    const path = `/activites/${r.num}`
    for (const lang of LANGS) {
      entries.push({ url: `${BASE}/${lang}${path}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6, alternates: alts(path) })
    }
  }

  // Articles
  for (const a of articles) {
    const path = `/articles/${a.slug}`
    const date = new Date(a.date)
    for (const lang of LANGS) {
      entries.push({ url: `${BASE}/${lang}${path}`, lastModified: date, changeFrequency: 'monthly', priority: 0.6, alternates: alts(path) })
    }
  }

  return entries
}
