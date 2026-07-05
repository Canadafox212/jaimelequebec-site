import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const LANGS = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Simplified)',
  hi: 'Hindi',
}

function extractMarker(text, marker) {
  const prefix = `${marker}:`
  const start = text.indexOf(prefix)
  if (start === -1) return ''
  const afterMarker = text.slice(start + prefix.length)
  const nextMarker = afterMarker.search(/\n[A-Z_]+:/)
  return (nextMarker === -1 ? afterMarker : afterMarker.slice(0, nextMarker)).trim()
}

async function translateOne(client, fr, langName) {
  const prompt = `Translate the following article fields from French to ${langName}.
Use EXACTLY this format — no extra text, no markdown, no explanations:

TITRE: [translated title here]
RESUME: [translated summary here]
CORPS:
[translated body here, preserving all Markdown formatting: # headings, **bold**, - lists, tables]

--- FRENCH CONTENT ---
TITRE: ${fr.titre}
RESUME: ${fr.resume}
CORPS:
${fr.corps}
--- END ---`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]?.text?.trim() ?? ''

  const titre = extractMarker(raw, 'TITRE')
  const resume = extractMarker(raw, 'RESUME')

  const corpsStart = raw.indexOf('CORPS:')
  const corps = corpsStart === -1 ? '' : raw.slice(corpsStart + 6).trim()

  if (!titre) throw new Error(`Titre manquant dans la réponse pour ${langName}`)

  return { titre, resume, corps }
}

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquant dans .env.local' }, { status: 500 })

  let fr
  try {
    const body = await req.json()
    fr = body.fr
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  if (!fr?.titre) return NextResponse.json({ error: 'Contenu FR manquant' }, { status: 400 })

  try {
    const client = new Anthropic({ apiKey })
    const translations = {}

    for (const [code, name] of Object.entries(LANGS)) {
      try {
        translations[code] = await translateOne(client, fr, name)
      } catch (err) {
        return NextResponse.json({
          error: `Erreur pour ${name} (${code}) : ${err.message}`,
          traduit_jusqualors: Object.keys(translations),
        }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, translations })

  } catch (err) {
    return NextResponse.json({ error: 'Erreur API Anthropic : ' + (err?.message ?? String(err)) }, { status: 500 })
  }
}
