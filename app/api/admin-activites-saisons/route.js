import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ATTR_PATH   = join(process.cwd(), 'data', 'attractions.json')
const SAISONS_PATH = join(process.cwd(), 'data', 'activites-saisons.json')

function loadSaisons() {
  try { if (existsSync(SAISONS_PATH)) return JSON.parse(readFileSync(SAISONS_PATH, 'utf8')) } catch {}
  return {}
}

function typeToImg(type) {
  const t = (type ?? '').toLowerCase()
  if (t.includes('bar') || t.includes('boîte') || t.includes('nuit') || t.includes('brasserie')) return '/images/fallbacks/bar.webp'
  if (t.includes('casino') || t.includes('hippodrome')) return '/images/fallbacks/casino.webp'
  if (t.includes('spa') || t.includes('santé')) return '/images/fallbacks/spa.webp'
  if (t.includes('ski alpin') || t.includes('planche à neige')) return '/images/fallbacks/ski-alpin.webp'
  if (t.includes('ski de fond') || t.includes('raquette') || t.includes('glissoire')) return '/images/fallbacks/ski-fond.webp'
  if (t.includes('patinoire')) return '/images/fallbacks/patinoire.webp'
  if (t.includes('golf')) return '/images/fallbacks/golf.webp'
  if (t.includes('vélo') || t.includes('fatbike')) return '/images/fallbacks/velo.webp'
  if (t.includes('jardin') || t.includes('zoo')) return '/images/fallbacks/jardin.webp'
  if (t.includes('marina')) return '/images/fallbacks/marina.webp'
  if (t.includes('plage')) return '/images/fallbacks/plage.webp'
  if (t.includes('pêche') || t.includes('faunique') || t.includes('zec')) return '/images/fallbacks/peche.webp'
  if (t.includes('équestre') || t.includes('cheval')) return '/images/fallbacks/equestre.webp'
  if (t.includes('karting') || t.includes('motorisé') || t.includes('autodrome')) return '/images/fallbacks/karting.webp'
  if (t.includes('parc') || t.includes('sentier') || t.includes('piste') || t.includes('nature') || t.includes('réserve')) return '/images/fallbacks/parc.webp'
  if (t.includes('auberge') || t.includes('hôtel') || t.includes('hébergement')) return '/images/fallbacks/auberge.webp'
  return '/images/fallbacks/sport.webp'
}

export async function GET() {
  if (process.env.NODE_ENV === 'production')
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })

  const attractions = JSON.parse(readFileSync(ATTR_PATH, 'utf8'))
  const saisons     = loadSaisons()

  // Dédupliquer : nom → { type, ville, region, inEte, inHiver }
  const map = new Map()
  for (const a of attractions) {
    const ville  = a.localisation?.ville ?? null
    const region = a.localisation?.region_touristique ?? null
    for (const act of a.activites?.ete ?? []) {
      const prev = map.get(act.nom)
      if (!prev) map.set(act.nom, { nom: act.nom, type: act.type ?? null, ville, region, inEte: true,  inHiver: false })
      else { prev.inEte = true }
    }
    for (const act of a.activites?.hiver ?? []) {
      const prev = map.get(act.nom)
      if (!prev) map.set(act.nom, { nom: act.nom, type: act.type ?? null, ville, region, inEte: false, inHiver: true  })
      else { prev.inHiver = true }
    }
  }

  const list = [...map.values()].map(a => ({
    nom:    a.nom,
    type:   a.type,
    ville:  a.ville,
    region: a.region,
    img:    typeToImg(a.type),
    // Saison source (sans override)
    srcSaison: a.inEte && a.inHiver ? 'les_deux' : a.inEte ? 'ete' : 'hiver',
    // Saison effective (override prioritaire)
    saison: saisons[a.nom] ?? (a.inEte && a.inHiver ? 'les_deux' : a.inEte ? 'ete' : 'hiver'),
  })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  return NextResponse.json(list)
}

export async function POST(request) {
  if (process.env.NODE_ENV === 'production')
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })

  const { nom, saison } = await request.json()
  if (!nom || !['ete', 'hiver', 'les_deux'].includes(saison))
    return NextResponse.json({ error: 'nom et saison (ete/hiver/les_deux) requis' }, { status: 400 })

  const saisons = loadSaisons()
  saisons[nom]  = saison
  writeFileSync(SAISONS_PATH, JSON.stringify(saisons, null, 2), 'utf8')
  return NextResponse.json({ ok: true })
}
