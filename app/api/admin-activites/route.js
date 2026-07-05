import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_PATH      = join(process.cwd(), 'data', 'attractions.json')
const OVERRIDES_PATH = join(process.cwd(), 'data', 'activites-overrides.json')

function loadOverrides() {
  try {
    if (existsSync(OVERRIDES_PATH)) return JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'))
  } catch {}
  return {}
}

function saveOverrides(data) {
  writeFileSync(OVERRIDES_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET(request) {
  if (process.env.NODE_ENV === 'production')
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })

  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 })

  const attractions = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  const attraction  = attractions.find(a => a.slug === slug)
  if (!attraction)  return NextResponse.json({ error: 'Non trouvée' }, { status: 404 })

  const overrides     = loadOverrides()
  const slugOverrides = overrides[slug] ?? {}

  function mapLieux(arr, saison) {
    return (arr ?? []).map(a => ({
      nom:       a.nom,
      type:      a.type,
      dist_km:   a.dist_km,
      activites: (a.activites ?? '').split('|').map(s => s.trim()).filter(s => s && s !== 'nan'),
      extra:     slugOverrides[saison]?.[a.nom] ?? [],
    }))
  }

  return NextResponse.json({
    slug,
    titre: attraction.fr?.titre ?? slug,
    ete:   mapLieux(attraction.activites?.ete,   'ete'),
    hiver: mapLieux(attraction.activites?.hiver, 'hiver'),
  })
}

export async function POST(request) {
  if (process.env.NODE_ENV === 'production')
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })

  const { slug, saison, nom, extra } = await request.json()
  if (!slug || !saison || !nom)
    return NextResponse.json({ error: 'slug, saison, nom requis' }, { status: 400 })

  const overrides = loadOverrides()
  if (!overrides[slug])         overrides[slug] = {}
  if (!overrides[slug][saison]) overrides[slug][saison] = {}
  overrides[slug][saison][nom]  = extra ?? []

  saveOverrides(overrides)
  return NextResponse.json({ ok: true })
}
