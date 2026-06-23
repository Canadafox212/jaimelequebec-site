/**
 * fetch-service-images.mjs — Photos des hôtels, restaurants et activités
 *
 * Usage :
 *   node scripts/fetch-service-images.mjs [start] [taille_lot]
 *
 * Exemples :
 *   node scripts/fetch-service-images.mjs 0 30   → premiers 30 services
 *   node scripts/fetch-service-images.mjs 30 30  → lot suivant
 *
 * Images sauvegardées dans : public/images/services/{slug}.jpg
 * Rapport visuel           : public/fetch-services-report.html
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BATCH_START = parseInt(process.argv[2] ?? '0')
const BATCH_SIZE  = parseInt(process.argv[3] ?? '30')
const DELAY_MS    = 1200

const OUTPUT_DIR  = join(ROOT, 'public', 'images', 'services')
const REPORT_JSON = join(ROOT, 'fetch-services-report.json')
const REPORT_HTML = join(ROOT, 'public', 'fetch-services-report.html')

const SKIP_RE = /logo|banner|ad[-_]|ads[-_]|sponsor|icon|pixel|tracking|1x1|sprite|button|social|favicon|avatar|placeholder/i
const CT_TO_EXT = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg',
  'image/png': '.png', 'image/webp': '.webp',
  'image/gif': '.gif', 'image/avif': '.avif',
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const attractions = JSON.parse(readFileSync(join(ROOT, 'data', 'attractions.json'), 'utf8'))
const report = existsSync(REPORT_JSON) ? JSON.parse(readFileSync(REPORT_JSON, 'utf8')) : {}

// ─── EXTRACTION DE TOUS LES SERVICES UNIQUES ──────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function collectServices() {
  const seen = new Map()  // slug → service (dédupliquer les mêmes endroits)

  for (const a of attractions) {
    const heb = a.hebergement ?? {}

    for (const tier of ['economique', 'confort', 'haut_gamme']) {
      for (const h of heb[tier] ?? []) {
        if (!h.web) continue
        const slug = slugify(h.nom)
        if (!seen.has(slug)) seen.set(slug, { slug, nom: h.nom, web: h.web, categorie: 'hebergement', type: h.type })
      }
    }

    for (const r of a.restaurants_proximite ?? []) {
      if (!r.web) continue
      const slug = slugify(r.nom)
      if (!seen.has(slug)) seen.set(slug, { slug, nom: r.nom, web: r.web, categorie: 'restaurant', type: r.type, cuisine: r.cuisine })
    }

    for (const season of ['ete', 'hiver']) {
      for (const act of a.activites?.[season] ?? []) {
        // Les activités n'ont généralement pas de site web dans les données — on skip
        // (on peut ajouter plus tard si le champ est ajouté)
      }
    }
  }

  return [...seen.values()]
}

const services = collectServices()
console.log(`\n📋 Total services avec site web : ${services.length}`)

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function normalizeUrl(raw) {
  if (!raw) return null
  raw = raw.trim()
  return raw.startsWith('http') ? raw : `https://${raw}`
}

function resolveUrl(base, relative) {
  try { return new URL(relative, base).href } catch { return null }
}

function extFromUrl(url) {
  try {
    const e = extname(new URL(url).pathname).toLowerCase()
    if (['.jpg','.jpeg','.png','.webp','.gif','.avif'].includes(e)) return e === '.jpeg' ? '.jpg' : e
  } catch {}
  return null
}

async function fetchWithTimeout(url, timeout = 12_000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)
    return res
  } catch (e) { clearTimeout(timer); throw e }
}

function extractMetaImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) { const r = resolveUrl(baseUrl, m[1]); if (r) return r }
  }
  return null
}

function extractFallbackImage(html, baseUrl) {
  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let m
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1]
    if (src.startsWith('data:') || SKIP_RE.test(src)) continue
    const r = resolveUrl(baseUrl, src)
    if (r) return r
  }
  return null
}

async function downloadImage(imageUrl, slug, origin) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20_000)
  try {
    const res = await fetch(imageUrl, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': origin },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = (res.headers.get('content-type') ?? '').split(';')[0].trim()
    if (!ct.startsWith('image/')) throw new Error(`Pas une image (${ct})`)
    const ext = extFromUrl(imageUrl) ?? CT_TO_EXT[ct] ?? '.jpg'
    const filename = `${slug}${ext}`
    const buf = await res.arrayBuffer()
    if (buf.byteLength < 5_000) throw new Error(`Image trop petite (${buf.byteLength} o)`)
    writeFileSync(join(OUTPUT_DIR, filename), Buffer.from(buf))
    return `/images/services/${filename}`
  } catch (e) { clearTimeout(timer); throw e }
}

// ─── TRAITEMENT D'UN SERVICE ───────────────────────────────────────────────────

async function processService(service) {
  const siteUrl = normalizeUrl(service.web)
  try {
    const res = await fetchWithTimeout(siteUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html')) throw new Error(`Non-HTML (${ct.split(';')[0]})`)
    const html = await res.text()
    const finalUrl = res.url
    const origin = new URL(finalUrl).origin

    let imageUrl = extractMetaImage(html, finalUrl) ?? extractFallbackImage(html, finalUrl)
    if (!imageUrl) return { ...service, status: 'no_image', siteUrl, localFile: null, error: 'Aucune image trouvée' }

    const localFile = await downloadImage(imageUrl, service.slug, origin)
    return { ...service, status: 'ok', siteUrl, localFile, error: null }
  } catch (e) {
    return { ...service, status: 'error', siteUrl, localFile: null, error: e.message }
  }
}

// ─── RAPPORT HTML ─────────────────────────────────────────────────────────────

function generateReport(results) {
  const list  = Object.values(results)
  const ok    = list.filter(r => r.status === 'ok').length
  const nf    = list.filter(r => r.status === 'no_image').length
  const err   = list.filter(r => r.status === 'error').length

  const catIcon = { hebergement: '🏨', restaurant: '🍽️', activite: '🎯' }
  const statusColor = { ok: '#22c55e', no_image: '#f59e0b', error: '#ef4444' }

  const rows = list.map(r => `<tr>
    <td style="padding:8px">${r.localFile ? `<img src="${r.localFile.replace(/^\//, '')}" style="width:120px;height:80px;object-fit:cover;border-radius:6px">` : `<div style="width:120px;height:80px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:22px">${catIcon[r.categorie] ?? '📍'}</div>`}</td>
    <td style="padding:8px;font-weight:700;font-size:13px">${r.nom}</td>
    <td style="padding:8px"><span style="background:${statusColor[r.status]};color:white;padding:2px 8px;border-radius:999px;font-size:11px">${r.status}</span></td>
    <td style="padding:8px;font-size:11px;color:#6366f1">${catIcon[r.categorie] ?? ''} ${r.categorie}</td>
    <td style="padding:8px;font-size:11px;color:#94a3b8">${r.error ?? ''}</td>
  </tr>`).join('\n')

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Services — Rapport images</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f8fafc;padding:24px}
  h1{font-size:20px;margin-bottom:16px}.stats{display:flex;gap:16px;margin-bottom:20px}
  .stat{background:white;border-radius:10px;padding:12px 18px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
  .stat strong{font-size:22px;display:block}
  table{border-collapse:collapse;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08)}
  thead th{background:#003087;color:white;padding:10px;text-align:left;font-size:12px}
  tbody tr:nth-child(even){background:#f8fafc}</style></head><body>
  <h1>Rapport photos — Hôtels & Restaurants</h1>
  <div class="stats">
    <div class="stat"><strong style="color:#22c55e">${ok}</strong>OK</div>
    <div class="stat"><strong style="color:#f59e0b">${nf}</strong>Sans image</div>
    <div class="stat"><strong style="color:#ef4444">${err}</strong>Erreurs</div>
    <div class="stat"><strong>${list.length}</strong>Total</div>
  </div>
  <table><thead><tr><th>Photo</th><th>Nom</th><th>Statut</th><th>Catégorie</th><th>Détail</th></tr></thead>
  <tbody>${rows}</tbody></table></body></html>`
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const batch = services.slice(BATCH_START, BATCH_START + BATCH_SIZE)
console.log(`\n▶  Lot ${BATCH_START} → ${BATCH_START + batch.length - 1}  (${batch.length} services)\n`)

for (let i = 0; i < batch.length; i++) {
  const service = batch[i]
  const n = `[${BATCH_START + i + 1}/${services.length}]`

  if (report[service.slug]) {
    console.log(`${n} ⏭  ${service.nom}  (déjà traité)`)
    continue
  }

  process.stdout.write(`${n} ⏳  ${service.nom} … `)
  const result = await processService(service)
  report[service.slug] = result

  const icon = { ok: '✓', no_image: '?', error: '✗' }[result.status] ?? '?'
  console.log(`${icon}  ${result.status}${result.error ? '  ← ' + result.error : ''}`)

  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2))
  writeFileSync(REPORT_HTML, generateReport(report))

  if (i < batch.length - 1) await sleep(DELAY_MS)
}

const ok = Object.values(report).filter(r => r.status === 'ok').length
console.log(`\n✅  Lot terminé — ${ok}/${Object.keys(report).length} images OK`)
console.log(`📋  Rapport : public/fetch-services-report.html\n`)
