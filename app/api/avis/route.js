import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

// ── Adaptateur : Redis (production) ou fichier JSON (dev local) ────────
const USE_REDIS = !!process.env.KV_REST_API_URL

function redisKey(type, cible) {
  return `avis:${type}:${encodeURIComponent(cible)}`
}

function getRedis() {
  const { Redis } = require('@upstash/redis')
  return new Redis({
    url:   process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

async function redisGet(type, cible) {
  const data = await getRedis().get(redisKey(type, cible))
  return Array.isArray(data) ? data : []
}

async function redisSet(type, cible, data) {
  await getRedis().set(redisKey(type, cible), data)
}

// ── Adaptateur fichier (dev local) ────────────────────────────────────
const FILE_PATH = join(process.cwd(), 'data', 'avis.json')

function fileLoad() {
  try { if (existsSync(FILE_PATH)) return JSON.parse(readFileSync(FILE_PATH, 'utf8')) } catch {}
  return []
}

function fileSave(data) {
  writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8')
}

// ── Validation ────────────────────────────────────────────────────────
function validate(body) {
  const { prenom, ville, note, texte, type, cible, _hp } = body
  if (_hp)                                                          return 'spam'
  if (!prenom || prenom.trim().length < 2 || prenom.trim().length > 50) return 'prenom invalide'
  if (!ville  || ville.trim().length  < 2 || ville.trim().length  > 50) return 'ville invalide'
  if (!Number.isInteger(note) || note < 1 || note > 5)             return 'note invalide'
  if (!texte  || texte.trim().length  < 10 || texte.trim().length > 500) return 'texte invalide (10-500 caractères)'
  if (!['site', 'activite', 'region'].includes(type) || !cible)    return 'type/cible invalide'
  return null
}

// ── GET ───────────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type  = searchParams.get('type')
  const cible = searchParams.get('cible')
  if (!type || !cible) return NextResponse.json([], { status: 400 })

  let result
  if (USE_REDIS) {
    result = await redisGet(type, cible)
  } else {
    const all = fileLoad()
    result = all.filter(a => a.type === type && a.cible === cible)
  }

  result.sort((a, b) => new Date(b.date) - new Date(a.date))
  return NextResponse.json(result)
}

// ── POST ──────────────────────────────────────────────────────────────
export async function POST(request) {
  const body = await request.json()
  const err  = validate(body)
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 })

  const { prenom, ville, note, texte, type, cible } = body
  const avis = {
    id:     randomUUID(),
    prenom: prenom.trim(),
    ville:  ville.trim(),
    note,
    texte:  texte.trim(),
    type,
    cible,
    date:   new Date().toISOString().slice(0, 10),
  }

  if (USE_REDIS) {
    const existing = await redisGet(type, cible)
    existing.unshift(avis)
    await redisSet(type, cible, existing)
  } else {
    const all = fileLoad()
    all.push(avis)
    fileSave(all)
  }

  return NextResponse.json({ ok: true, avis })
}
