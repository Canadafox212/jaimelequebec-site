import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'

export const LANGS = ['fr', 'en']

export const dicts = { fr, en }

export function getDictionary(lang) {
  return dicts[lang] ?? dicts.en
}

export function contentLang(lang) {
  return lang === 'fr' ? 'fr' : 'en'
}
