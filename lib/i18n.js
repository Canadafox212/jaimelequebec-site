import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'
import es from '@/dictionaries/es'
import de from '@/dictionaries/de'
import pt from '@/dictionaries/pt'
import ru from '@/dictionaries/ru'
import zh from '@/dictionaries/zh'
import hi from '@/dictionaries/hi'
import it from '@/dictionaries/it'

export const LANGS = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'zh', 'hi', 'it']

// Fusionne la traduction sur le français : toute clé manquante retombe sur fr.
function withFallback(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base
  const out = { ...base }
  for (const k of Object.keys(over ?? {})) {
    out[k] = k in base ? withFallback(base[k], over[k]) : over[k]
  }
  return out
}

const raw = { fr, en, es, de, pt, ru, zh, hi, it }
export const dicts = Object.fromEntries(
  Object.entries(raw).map(([l, d]) => [l, l === 'fr' ? d : withFallback(fr, d)])
)

export function isValidLang(lang) {
  return LANGS.includes(lang)
}

// Renvoie undefined si la langue n'est pas prise en charge (la page doit appeler notFound()).
export function getDictionary(lang) {
  return dicts[lang]
}

export function contentLang(lang) {
  return LANGS.includes(lang) ? lang : 'en'
}

const BASE = 'https://jaimelequebec.org'

export function getAlternates(path = '') {
  return {
    canonical: `${BASE}/fr${path}`,
    languages: Object.fromEntries([
      ...LANGS.map((l) => [l, `${BASE}/${l}${path}`]),
      ['x-default', `${BASE}/fr${path}`],
    ]),
  }
}
