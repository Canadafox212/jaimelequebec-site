import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { getAllAttractions } from '@/lib/attractions'

const PATH = join(process.cwd(), 'data', 'attractions-featured.json')

async function lire() {
  try { return JSON.parse(await readFile(PATH, 'utf8')) } catch { return {} }
}
async function ecrire(data) {
  await writeFile(PATH, JSON.stringify(data, null, 2), 'utf8') // UTF-8 sans BOM
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }
  const featured = await lire()
  const attractions = getAllAttractions().map((a) => ({
    slug: a.slug,
    titre: a.fr?.titre ?? a.slug,
    region: a.localisation?.region_touristique ?? '',
  })).sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
  return NextResponse.json({ attractions, featured })
}

export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const { slug, data, supprimer } = body
  if (!slug || typeof slug !== 'string') return NextResponse.json({ error: 'slug requis' }, { status: 400 })

  const reg = await lire()
  if (supprimer) {
    delete reg[slug]
    await ecrire(reg)
    return NextResponse.json({ ok: true, supprime: slug })
  }

  const coup = !!data?.coup_de_coeur
  const prio = Number(data?.priorite)
  const entry = {}
  if (prio && !Number.isNaN(prio)) entry.priorite = prio
  if (coup) entry.coup_de_coeur = true

  if (Object.keys(entry).length === 0) {
    delete reg[slug] // ni priorité ni coup de cœur → on retire
    await ecrire(reg)
    return NextResponse.json({ ok: true, supprime: slug })
  }
  reg[slug] = entry
  await ecrire(reg)
  return NextResponse.json({ ok: true, slug, entry })
}
