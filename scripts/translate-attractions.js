/**
 * translate-attractions.js
 *
 * Traduit texte_complet vers es, de, pt, ru, zh, hi.
 * Sortie en texte brut (pas JSON) pour éviter les problèmes d'échappement.
 * Reprend là où il s'est arrêté.
 */

const { readFileSync, writeFileSync } = require('fs')
const { join }                        = require('path')

const DATA_PATH = join(__dirname, '../data/attractions.json')
const MODEL     = 'claude-haiku-4-5-20251001'
const API_URL   = 'https://api.anthropic.com/v1/messages'

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('⛔  Manque ANTHROPIC_API_KEY.')
  process.exit(1)
}

const attractions = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
console.log(`📂  ${attractions.length} attractions chargées.`)

const todo = attractions.filter(a =>
  (a.fr?.texte_complet || a.en?.full_text) &&
  ['es', 'de', 'pt', 'ru', 'zh', 'hi'].some(l => !a[l]?.texte_complet)
)
console.log(`📝  ${todo.length} fiches avec texte long à traduire.`)

if (todo.length === 0) {
  console.log('✅  Tous les textes longs sont déjà traduits !')
  process.exit(0)
}

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
    return (await res.json()).content[0].text.trim()
  }
  throw new Error('Échec après 5 tentatives.')
}

function save() {
  writeFileSync(DATA_PATH, JSON.stringify(attractions, null, 2), 'utf8')
}

const LANG_NAMES = {
  es: 'Spanish', de: 'German', pt: 'Portuguese',
  ru: 'Russian', zh: 'Chinese (Simplified)', hi: 'Hindi'
}

// Traduit vers une seule langue, retourne du texte brut
async function translateOne(texte, lang) {
  const prompt = `Translate the following French tourist attraction text to ${LANG_NAMES[lang]}.
Preserve paragraph breaks. Output ONLY the translated text — no JSON, no markdown, no explanation.

---
${texte}
---`
  return await callClaude(prompt)
}

async function main() {
  for (let i = 0; i < todo.length; i++) {
    const a = todo[i]
    console.log(`\n📦  Fiche ${i+1}/${todo.length} — id=${a.id} (${a.fr?.titre ?? a.en?.title ?? a.slug})`)

    const texte  = a.fr?.texte_complet ?? a.en?.full_text ?? ''
    const missing = ['es', 'de', 'pt', 'ru', 'zh', 'hi'].filter(l => !a[l]?.texte_complet)
    let count = 0

    for (const l of missing) {
      try {
        const translated = await translateOne(texte, l)
        if (translated) {
          a[l] = { ...(a[l] ?? {}), texte_complet: translated }
          count++
          console.log(`  ✓  ${l}`)
        }
      } catch (err) {
        console.error(`  ❌  ${l}: ${err.message.slice(0, 120)}`)
      }
      await new Promise(r => setTimeout(r, 400))
    }

    save()
    console.log(`  💾  ${count} textes sauvegardés`)
  }

  console.log(`\n✅  Terminé ! data/attractions.json mis à jour.`)
}

main().catch(err => { console.error('Erreur fatale:', err) ; process.exit(1) })
