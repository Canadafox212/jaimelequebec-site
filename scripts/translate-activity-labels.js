/**
 * translate-activity-labels.js
 *
 * Collecte tous les type/labels uniques dans attractions.json,
 * les traduit en es, de, pt, ru, zh, hi,
 * et crée data/activity-labels-i18n.json.
 *
 * Usage :
 *   $env:ANTHROPIC_API_KEY = "sk-ant-..."
 *   node scripts/translate-activity-labels.js
 */

const { readFileSync, writeFileSync } = require('fs')
const { join }                        = require('path')

const ATTRACTIONS_PATH = join(__dirname, '../data/attractions.json')
const OUTPUT_PATH      = join(__dirname, '../data/activity-labels-i18n.json')
const MODEL            = 'claude-haiku-4-5-20251001'
const API_URL          = 'https://api.anthropic.com/v1/messages'

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) { console.error('⛔  Manque ANTHROPIC_API_KEY.') ; process.exit(1) }

// ── Collecte des valeurs uniques ──────────────────────────────────────────────
const attractions = JSON.parse(readFileSync(ATTRACTIONS_PATH, 'utf8'))
const unique = new Set()

for (const a of attractions) {
  for (const saison of ['ete', 'hiver']) {
    for (const act of a.activites?.[saison] || []) {
      if (act.type) unique.add(act.type.trim())
      const labels = (act.activites || '').split('|').map(s => s.trim()).filter(s => s && s !== 'nan' && s.length > 2)
      for (const l of labels) unique.add(l)
    }
  }
}

const allLabels = [...unique].sort()
console.log(`📝  ${allLabels.length} valeurs uniques à traduire.`)

// Charger le fichier existant si présent (pour reprendre)
let existing = {}
try { existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')) } catch {}
const todo = allLabels.filter(l => !existing[l])
console.log(`🔄  ${todo.length} valeurs manquantes.`)

if (todo.length === 0) {
  console.log('✅  Toutes les valeurs sont déjà traduites !')
  process.exit(0)
}

// ── Appel API ─────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const body = { model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }
  let delay = 2000
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 529 || res.status === 429 || res.status === 503) {
      console.warn(`  ⏳  Tentative ${attempt}/5 – attente ${delay/1000}s...`)
      await new Promise(r => setTimeout(r, delay))
      delay *= 2
      continue
    }
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return (await res.json()).content[0].text
  }
  throw new Error('Échec après 5 tentatives.')
}

function extractJson(text) {
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  const start = clean.indexOf('{')
  if (start === -1) throw new Error('Pas de JSON:\n' + text.slice(0, 200))
  const end = clean.lastIndexOf('}')
  return JSON.parse(clean.slice(start, end + 1))
}

function save() {
  writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), 'utf8')
}

// ── Traitement par lots de 30 valeurs ─────────────────────────────────────────
const BATCH = 30
async function main() {
  const total = Math.ceil(todo.length / BATCH)
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    const lotNum = Math.floor(i / BATCH) + 1
    console.log(`\n📦  Lot ${lotNum}/${total}`)

    const prompt = `Translate these Quebec outdoor/tourism activity category labels from French to Spanish (es), German (de), Portuguese (pt), Russian (ru), Chinese Simplified (zh), Hindi (hi).
These are short labels like activity types and sub-categories. Keep them concise (1-5 words max). No explanations.

LABELS (French):
${JSON.stringify(batch)}

Respond with ONLY valid JSON where each key is the original French label:
{"French label":{"es":"...","de":"...","pt":"...","ru":"...","zh":"...","hi":"..."}}`

    try {
      const raw = await callClaude(prompt)
      const tr = extractJson(raw)
      let count = 0
      for (const label of batch) {
        if (tr[label]) { existing[label] = tr[label] ; count++ }
        else { console.warn(`  ⚠️  Manque: ${label}`) }
      }
      console.log(`  ✓  ${count}/${batch.length} traduits`)
      save()
    } catch (err) {
      console.error(`  ❌  Lot ${lotNum}: ${err.message.slice(0, 150)}`)
      save()
    }

    if (i + BATCH < todo.length) await new Promise(r => setTimeout(r, 400))
  }
  console.log(`\n✅  Terminé ! data/activity-labels-i18n.json créé (${Object.keys(existing).length} entrées).`)
}

main().catch(err => { console.error('Erreur fatale:', err) ; process.exit(1) })
