import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Récupère l'image de partage (og:image) d'un site et l'enregistre en local.
// Réservé au développement.
const JUNK = /logo|sprite|favicon|hero-image|placeholder|default|\/hero|fbshare/i

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}
const extFromType = (ct) => ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('avif') ? 'avif' : 'jpg'

function ogImage(html, base) {
  const pats = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ]
  for (const p of pats) {
    const m = html.match(p)
    if (m && m[1] && !JUNK.test(m[1])) { try { return new URL(m[1].replace(/&amp;/g, '&'), base).href } catch {} }
  }
  return null
}

export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  let { site, filename } = body
  if (!site || !filename) return NextResponse.json({ error: 'site et filename requis' }, { status: 400 })
  if (!site.startsWith('http')) site = 'https://' + site

  try {
    const ua = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    const res = await fetch(site, { headers: ua, redirect: 'follow' })
    if (!res.ok) return NextResponse.json({ error: `Site injoignable (HTTP ${res.status})` }, { status: 502 })
    const html = await res.text()
    const img = ogImage(html, site)
    if (!img) return NextResponse.json({ error: "Aucune image de partage (og:image) trouvée sur ce site" }, { status: 404 })

    const ir = await fetch(img, { headers: ua })
    const ct = (ir.headers.get('content-type') || '').toLowerCase()
    if (!ir.ok || !ct.startsWith('image/')) return NextResponse.json({ error: 'Image non récupérable' }, { status: 502 })
    const buf = Buffer.from(await ir.arrayBuffer())
    if (buf.length < 4000) return NextResponse.json({ error: 'Image trop petite (probablement un logo)' }, { status: 422 })

    const dir = join(process.cwd(), 'public', 'images', 'services')
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    const file = `${slugify(filename)}.${extFromType(ct)}`
    await writeFile(join(dir, file), buf)
    return NextResponse.json({ ok: true, path: `/images/services/${file}`, source: img })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
