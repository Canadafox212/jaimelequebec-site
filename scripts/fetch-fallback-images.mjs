/**
 * fetch-fallback-images.mjs
 * Télécharge des photos génériques par catégorie depuis Wikipedia Commons
 * Sauvegardées dans public/images/fallbacks/
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT  = join(ROOT, 'public', 'images', 'fallbacks')
mkdirSync(OUT, { recursive: true })

// Article Wikipedia → nom du fichier de sortie
const TARGETS = [
  { slug: 'hotel',      article: 'Château Frontenac',             lang: 'fr' },
  { slug: 'auberge',    article: 'Auberge de jeunesse',           lang: 'fr' },
  { slug: 'motel',      article: 'Motel',                         lang: 'fr' },
  { slug: 'camping',    article: 'Camping',                       lang: 'fr' },
  { slug: 'gite',       article: 'Chambre d\'hôtes',              lang: 'fr' },
  { slug: 'restaurant', article: 'Restaurant',                    lang: 'fr' },
  { slug: 'cafe',       article: 'Café (établissement)',           lang: 'fr' },
  { slug: 'bar',        article: 'Bar (établissement)',            lang: 'fr' },
]

async function getWikipediaImage(article, lang) {
  const api = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(article)}&pithumbsize=1200&format=json&origin=*`
  const res = await fetch(api, { headers: { 'User-Agent': 'jaimelequebec.com/1.0' } })
  const data = await res.json()
  const pages = Object.values(data.query?.pages ?? {})
  return pages[0]?.thumbnail?.source ?? null
}

async function download(url, slug) {
  const res = await fetch(url, { headers: { 'User-Agent': 'jaimelequebec.com/1.0' } })
  const buf = await res.arrayBuffer()
  const ext = url.includes('.png') ? '.png' : url.includes('.webp') ? '.webp' : '.jpg'
  const path = join(OUT, `${slug}${ext}`)
  writeFileSync(path, Buffer.from(buf))
  return `/images/fallbacks/${slug}${ext}`
}

console.log('\n📸  Téléchargement des photos génériques\n')

for (const t of TARGETS) {
  process.stdout.write(`  ${t.slug.padEnd(12)} ← ${t.article} … `)
  try {
    let url = await getWikipediaImage(t.article, t.lang)
    if (!url && t.lang === 'fr') url = await getWikipediaImage(t.article, 'en')
    if (!url) { console.log('✗  non trouvé'); continue }
    const path = await download(url, t.slug)
    console.log(`✓  ${path}`)
  } catch (e) {
    console.log(`✗  ${e.message}`)
  }
  await new Promise(r => setTimeout(r, 800))
}

console.log('\n✅  Terminé — photos dans public/images/fallbacks/\n')
