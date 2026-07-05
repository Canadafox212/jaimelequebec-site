import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { getEtablissementsForAdmin } from '@/lib/activites'

const SERVICES_PATH = join(process.cwd(), 'data', 'services.json')

// Champs autorisés dans une fiche service (on ignore le reste)
const CHAMPS = [
  'description_fr', 'description_en', 'featured', 'priorite',
  'page', 'page_contenu_fr', 'page_contenu_en',
  'url', 'site_web', 'photo', 'adresse', 'telephone', 'courriel',
]

async function lireRegistre() {
  try {
    return JSON.parse(await readFile(SERVICES_PATH, 'utf8'))
  } catch {
    return {}
  }
}

// Écrit le registre en UTF-8 SANS BOM (writeFile string = utf8 sans BOM)
async function ecrireRegistre(data) {
  await writeFile(SERVICES_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }
  const services = await lireRegistre()
  const etablissements = getEtablissementsForAdmin()
  return NextResponse.json({ services, etablissements })
}

export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const { nom, data, supprimer } = body
  if (!nom || typeof nom !== 'string') {
    return NextResponse.json({ error: 'nom requis' }, { status: 400 })
  }

  const registre = await lireRegistre()

  if (supprimer) {
    delete registre[nom]
    await ecrireRegistre(registre)
    return NextResponse.json({ ok: true, supprime: nom })
  }

  // Nettoyage : ne garde que les champs connus et non vides
  const fiche = {}
  for (const champ of CHAMPS) {
    let v = data?.[champ]
    if (champ === 'featured') { if (v) fiche.featured = true; continue }
    if (champ === 'priorite') { const n = Number(v); if (!Number.isNaN(n) && n !== 0) fiche.priorite = n; continue }
    if (typeof v === 'string') { v = v.trim(); if (v) fiche[champ] = v }
  }

  // Visibilité publique par champ de contact (booléens)
  const VIS_KEYS = ['adresse', 'telephone', 'site_web', 'courriel']
  const vis = {}
  for (const k of VIS_KEYS) {
    const b = data?.visibilite?.[k]
    if (typeof b === 'boolean') vis[k] = b
  }
  if (Object.keys(vis).length) fiche.visibilite = vis

  registre[nom] = fiche
  await ecrireRegistre(registre)
  return NextResponse.json({ ok: true, nom, fiche })
}
