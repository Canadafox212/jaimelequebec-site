/**
 * fetch-images.mjs — Récupération d'images via l'API Wikipédia
 *
 * Usage :
 *   node scripts/fetch-images.mjs [start] [taille_lot]
 *
 * Exemples :
 *   node scripts/fetch-images.mjs 0 5      → teste les 5 premières attractions
 *   node scripts/fetch-images.mjs 0 20     → lot de 20 depuis le début
 *   node scripts/fetch-images.mjs 20 20    → lot suivant (attractions 20–39)
 *
 * Résultats :
 *   public/images/attractions/[slug].jpg   → images téléchargées
 *   fetch-images-report.json               → données brutes (reprises entre lots)
 *   public/fetch-images-report.html        → rapport visuel à ouvrir dans le nav.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const BATCH_START = parseInt(process.argv[2] ?? '0')
const BATCH_SIZE  = parseInt(process.argv[3] ?? '10')
const DELAY_MS    = 1000   // délai entre chaque requête Wikipédia

const OUTPUT_DIR  = join(ROOT, 'public', 'images', 'attractions')
const REPORT_JSON = join(ROOT, 'fetch-images-report.json')
const REPORT_HTML = join(ROOT, 'public', 'fetch-images-report.html')

// Taille minimale de l'image téléchargée (évite les vignettes trop petites)
const MIN_IMAGE_WIDTH = 400

// ─── DONNÉES ──────────────────────────────────────────────────────────────────

const attractions = JSON.parse(
  readFileSync(join(ROOT, 'data', 'attractions.json'), 'utf8')
)

mkdirSync(OUTPUT_DIR, { recursive: true })

const report = existsSync(REPORT_JSON)
  ? JSON.parse(readFileSync(REPORT_JSON, 'utf8'))
  : {}

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function extFromContentType(ct) {
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg'
  if (ct.includes('png'))  return '.png'
  if (ct.includes('webp')) return '.webp'
  if (ct.includes('gif'))  return '.gif'
  return '.jpg'
}

// ─── API WIKIPÉDIA ────────────────────────────────────────────────────────────

/**
 * Interroge l'API Wikipédia pour trouver la photo principale d'un article.
 * Essaie d'abord en français, puis en anglais si rien trouvé.
 * Retourne { imageUrl, thumbUrl, source } ou null.
 */
async function findWikipediaImage(titreFr, titreEn) {
  // On essaie les deux langues dans l'ordre
  const attempts = [
    { lang: 'fr', titre: titreFr },
    { lang: 'en', titre: titreEn },
  ]

  for (const { lang, titre } of attempts) {
    if (!titre) continue

    try {
      // Étape 1 : recherche floue pour trouver le bon article
      const searchUrl = `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: titre,
        srlimit: '3',
        format: 'json',
        origin: '*',
      })

      const searchRes = await fetchWithTimeout(searchUrl)
      if (!searchRes.ok) continue
      const searchData = await searchRes.json()
      const results = searchData?.query?.search ?? []
      if (results.length === 0) continue

      // On prend le premier résultat
      const pageTitle = results[0].title

      // Étape 2 : récupérer la photo principale (pageimage) de cet article
      const imageUrl = `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
        action: 'query',
        titles: pageTitle,
        prop: 'pageimages',
        pithumbsize: '1200',  // résolution de la vignette demandée
        piprop: 'thumbnail|original',
        format: 'json',
        origin: '*',
      })

      const imageRes = await fetchWithTimeout(imageUrl)
      if (!imageRes.ok) continue
      const imageData = await imageRes.json()

      const pages = imageData?.query?.pages ?? {}
      const page = Object.values(pages)[0]

      if (!page || page.missing !== undefined) continue

      const thumb = page.thumbnail
      const original = page.original

      if (!thumb && !original) continue

      // Préférer l'original si disponible et assez grand, sinon la vignette 1200px
      const chosen = (original && original.width >= MIN_IMAGE_WIDTH) ? original : thumb
      if (!chosen || chosen.width < MIN_IMAGE_WIDTH) continue

      return {
        imageUrl: chosen.source,
        width: chosen.width,
        height: chosen.height,
        wikiLang: lang,
        wikiTitle: pageTitle,
      }

    } catch {
      // Erreur réseau sur cette tentative → on essaie la langue suivante
      continue
    }
  }

  return null
}

// ─── TÉLÉCHARGEMENT D'IMAGE ───────────────────────────────────────────────────

async function downloadImage(imageUrl, slug) {
  const res = await fetchWithTimeout(imageUrl, 20_000)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const ct = (res.headers.get('content-type') ?? '').split(';')[0].trim()
  if (!ct.startsWith('image/')) throw new Error(`Pas une image (${ct})`)

  const ext = extFromContentType(ct)
  const filename = `${slug}${ext}`
  const filepath = join(OUTPUT_DIR, filename)

  const buf = await res.arrayBuffer()
  if (buf.byteLength < 10_000) throw new Error(`Image trop petite (${buf.byteLength} o)`)

  writeFileSync(filepath, Buffer.from(buf))
  return { filename, sizeBytes: buf.byteLength, ext }
}

async function fetchWithTimeout(url, timeout = 12_000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'JaimeLequebec/1.0 (philippegoupil@jaimelequebec.com)' },
    })
    clearTimeout(timer)
    return res
  } catch (e) {
    clearTimeout(timer)
    throw e
  }
}

// ─── TRAITEMENT D'UNE ATTRACTION ──────────────────────────────────────────────

async function processAttraction(attraction) {
  const slug    = attraction.slug
  const titreFr = attraction.fr?.titre ?? ''
  const titreEn = attraction.en?.title ?? ''

  try {
    const found = await findWikipediaImage(titreFr, titreEn)

    if (!found) {
      return {
        slug, titreFr, status: 'not_found',
        imageUrl: null, localFile: null,
        wikiLang: null, wikiTitle: null, error: 'Aucun article Wikipédia avec image',
      }
    }

    const { filename } = await downloadImage(found.imageUrl, slug)

    return {
      slug, titreFr, status: 'ok',
      imageUrl: found.imageUrl,
      localFile: `/images/attractions/${filename}`,
      wikiLang: found.wikiLang,
      wikiTitle: found.wikiTitle,
      dimensions: `${found.width}×${found.height}`,
      error: null,
    }

  } catch (e) {
    return {
      slug, titreFr, status: 'error',
      imageUrl: null, localFile: null,
      wikiLang: null, wikiTitle: null, error: e.message,
    }
  }
}

// ─── RAPPORT HTML ─────────────────────────────────────────────────────────────

function generateHtmlReport(results) {
  const list  = Object.values(results)
  const total = list.length
  const ok    = list.filter(r => r.status === 'ok').length
  const nf    = list.filter(r => r.status === 'not_found').length
  const err   = list.filter(r => r.status === 'error').length

  const STATUS_COLOR = { ok: '#22c55e', not_found: '#f59e0b', error: '#ef4444' }

  const rows = list.map(r => {
    const imgHtml = r.localFile
      ? `<img src="${r.localFile}" loading="lazy" style="width:180px;height:120px;object-fit:cover;border-radius:6px;display:block;">`
      : `<div style="width:180px;height:120px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#94a3b8;text-align:center;padding:8px;">${r.error ?? r.status}</div>`

    const badge  = `<span style="background:${STATUS_COLOR[r.status] ?? '#94a3b8'};color:white;padding:2px 10px;border-radius:999px;font-size:11px;">${r.status}</span>`
    const wiki   = r.wikiTitle ? `<a href="https://${r.wikiLang}.wikipedia.org/wiki/${encodeURIComponent(r.wikiTitle)}" target="_blank" style="font-size:11px;color:#6366f1;">${r.wikiTitle} (${r.wikiLang})</a>` : '—'

    return `<tr>
      <td style="padding:8px 10px;">${imgHtml}</td>
      <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#1e293b;min-width:200px;">${r.titreFr ?? r.slug}</td>
      <td style="padding:8px 10px;">${badge}</td>
      <td style="padding:8px 10px;">${wiki}</td>
      <td style="padding:8px 10px;font-size:11px;color:#94a3b8;">${r.dimensions ?? (r.error ?? '')}</td>
    </tr>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport images Wikipédia — J'aime le Québec</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 28px; color: #334155; }
    h1 { font-size: 22px; margin-bottom: 12px; color: #0f172a; }
    .stats { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat { background: white; border-radius: 10px; padding: 14px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
    .stat strong { font-size: 24px; display: block; }
    .ok   { color: #22c55e; }
    .nf   { color: #f59e0b; }
    .err  { color: #ef4444; }
    table { border-collapse: collapse; width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
    thead th { background: #003087; color: white; padding: 10px 10px; text-align: left; font-size: 12px; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eff6ff; }
  </style>
</head>
<body>
  <h1>Rapport images Wikipédia — J'aime le Québec</h1>
  <div class="stats">
    <div class="stat"><strong class="ok">${ok}</strong> images OK</div>
    <div class="stat"><strong class="nf">${nf}</strong> non trouvées</div>
    <div class="stat"><strong class="err">${err}</strong> erreurs</div>
    <div class="stat"><strong>${total}</strong> traitées / 200</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:200px">Photo</th>
        <th>Attraction</th>
        <th style="width:110px">Statut</th>
        <th>Article Wikipédia</th>
        <th style="width:100px">Dimensions</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const batch = attractions.slice(BATCH_START, BATCH_START + BATCH_SIZE)
console.log(`\n▶  Lot ${BATCH_START} → ${BATCH_START + batch.length - 1}  (${batch.length} attractions)\n`)

for (let i = 0; i < batch.length; i++) {
  const attraction = batch[i]
  const n = `[${BATCH_START + i + 1}/200]`

  if (report[attraction.slug]) {
    console.log(`${n} ⏭  ${attraction.slug}  (déjà traité)`)
    continue
  }

  process.stdout.write(`${n} ⏳  ${attraction.fr?.titre ?? attraction.slug} … `)
  const result = await processAttraction(attraction)
  report[attraction.slug] = result

  const icon   = { ok: '✓', not_found: '?', error: '✗' }[result.status] ?? '?'
  const detail = result.wikiTitle
    ? `  Wikipedia/${result.wikiLang}: "${result.wikiTitle}"  ${result.dimensions}`
    : `  ${result.error ?? ''}`
  console.log(`${icon}  ${result.status}${detail}`)

  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2))
  writeFileSync(REPORT_HTML, generateHtmlReport(report))

  if (i < batch.length - 1) await sleep(DELAY_MS)
}

const ok    = Object.values(report).filter(r => r.status === 'ok').length
const total = Object.keys(report).length
console.log(`\n✅  Lot terminé — ${ok}/${total} images OK`)
console.log(`📋  Ouvrez le rapport :  public/fetch-images-report.html\n`)
