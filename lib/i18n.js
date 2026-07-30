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

export const dicts = { fr, en, es, de, pt, ru, zh, hi, it }

export function getDictionary(lang) {
  return dicts[lang] ?? dicts.en
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
