/**
 * translate-services.js
 *
 * Traduit description_fr vers es, de, pt, ru, zh, hi dans services.json.
 * Reprend là où il s'est arrêté.
 *
 * Usage :
 *   $env:ANTHROPIC_API_KEY = "sk-ant-..."
 *   node scripts/translate-services.js
 */

const { readFileSync, writeFileSync } = require('fs')
const { join }                        = require('path')

const DATA_PATH  = join(__dirname, '../data/services.json')
const LANGS_TO   = ['es', 'de', 'pt', 'ru', 'zh', 'hi']
const BATCH_SIZE = 3    // petit lot pour éviter les coupures JSON
const MODEL      = 'claude-haiku-4-5-20251001'
const API_URL    = 'https://api.anthropic.com/v1/messages'

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('⛔  Manque ANTHROPIC_API_KEY.')
  process.exit(1)
}

// ── Chargement ────────────────────────────────────────────────────────────────
const services = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const entries  = Object.entries(services).filter(([k]) => k !== '_commentaire')

// Fiches avec description_fr manquant au moins une langue cible
const todo = entries.filter(([, s]) =>
  s.description_fr && LANGS_TO.some(l => !s[`description_${l}`])
)
console.log(`📂  ${entries.length} services chargés — ${todo.length} descriptions à traduire.`)

if (todo.length === 0) {
  console.log('✅  Toutes les descriptions sont déjà traduites !')
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
  writeFileSync(DATA_PATH, JSON.stringify(services, null, 2), 'utf8')
}

// ── Traitement ────────────────────────────────────────────────────────────────
async function main() {
  const total = Math.ceil(todo.length / BATCH_SIZE)

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE)
    const lotNum = Math.floor(i / BATCH_SIZE) + 1
    console.log(`\n📦  Lot ${lotNum}/${total} (${i+1}–${Math.min(i+BATCH_SIZE, todo.length)})`)

    // Utiliser des indices numériques pour éviter les problèmes de clés JSON avec les noms spéciaux
    const input = {}
    for (let j = 0; j < batch.length; j++) {
      input[j] = batch[j][1].description_fr
    }

    const prompt = `Translate these short tourist service descriptions from French to Spanish (es), German (de), Portuguese (pt), Russian (ru), Chinese Simplified (zh), Hindi (hi).
CRITICAL: Each translated value must be on a SINGLE LINE — absolutely no newlines inside string values.
Keep translations concise (1-2 sentences). No explanations. No markdown.

INPUT (French, indexed):
${JSON.stringify(input, null, 2)}

Respond with ONLY valid compact JSON using the same numeric keys:
{"0":{"es":"...","de":"...","pt":"...","ru":"...","zh":"...","hi":"..."},"1":{...}}`

    try {
      const raw  = await callClaude(prompt)
      const translations = extractJson(raw)
      let count = 0
      for (let j = 0; j < batch.length; j++) {
        const [nom] = batch[j]
        const tr = translations[String(j)]
        if (!tr) { console.warn(`  ⚠️  Pas de traduction pour: ${nom}`) ; continue }
        for (const l of LANGS_TO) {
          if (tr[l] && !services[nom][`description_${l}`]) {
            services[nom][`description_${l}`] = tr[l]
            count++
          }
        }
      }
      console.log(`  ✓  ${count} descriptions appliquées`)
      save()
      console.log(`  💾  Sauvegardé`)
    } catch (err) {
      console.error(`  ❌  Lot ${lotNum}: ${err.message.slice(0, 200)}`)
      save()
    }

    if (i + BATCH_SIZE < todo.length) await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n✅  Terminé ! data/services.json mis à jour.`)
}

main().catch(err => { console.error('Erreur fatale:', err) ; process.exit(1) })
