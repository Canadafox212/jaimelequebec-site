import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'
import es from '@/dictionaries/es'
import de from '@/dictionaries/de'
import pt from '@/dictionaries/pt'
import ru from '@/dictionaries/ru'
import zh from '@/dictionaries/zh'
import hi from '@/dictionaries/hi'

export const LANGS = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']

export const dicts = { fr, en, es, de, pt, ru, zh, hi }

export function getDictionary(lang) {
  return dicts[lang] ?? dicts.en
}

export function contentLang(lang) {
  return lang === 'fr' ? 'fr' : 'en'
}
