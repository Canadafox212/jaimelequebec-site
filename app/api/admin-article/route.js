import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

const SP = join(process.cwd(), 'data', 'articles.json')

function load() {
  try { return JSON.parse(readFileSync(SP, 'utf8')) } catch { return [] }
}

function save(data) {
  writeFileSync(SP, JSON.stringify(data, null, 2), 'utf8')
}

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(load())
}

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const articles = load()

  const slug = body.slug || slugify(body.fr?.titre || Date.now().toString())
  const idx = articles.findIndex((a) => a.slug === slug)
  const EXTRA_LANGS = ['en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']
  const article = {
    slug,
    date: body.date || new Date().toISOString().slice(0, 10),
    photo: body.photo || null,
    photo_bandeau: body.photo_bandeau || null,
    video: body.video || null,
    auteur: body.auteur || 'Philippe Goupil',
    region: body.region || null,
    themeId: body.themeId || null,
    featured: body.featured ?? false,
    fr: { titre: body.fr?.titre || '', resume: body.fr?.resume || '', corps: body.fr?.corps || '' },
    ...Object.fromEntries(
      EXTRA_LANGS.map(l => [l, body[l]?.titre
        ? { titre: body[l].titre, resume: body[l].resume || '', corps: body[l].corps || '' }
        : null
      ]).filter(([, v]) => v !== null)
    ),
  }

  if (idx >= 0) articles[idx] = article
  else articles.unshift(article)
  save(articles)
  return NextResponse.json({ ok: true, slug })
}

export async function DELETE(req) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { slug } = await req.json()
  const articles = load().filter((a) => a.slug !== slug)
  save(articles)
  return NextResponse.json({ ok: true })
}
