// Normaliseur phonétique pour le français québécois
// Permet de retrouver "tabarnac" en tapant "tabarnak", "tabarnak", "câlice" → "kalis", etc.

export function normalizePhonetic(str) {
  if (!str) return ''
  let s = str.toLowerCase().trim()

  // 1. Supprimer les accents
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '')

  // 2. Equivalences phonétiques québécoises
  s = s.replace(/qu/g, 'k')
  s = s.replace(/ck/g, 'k')
  s = s.replace(/ph/g, 'f')
  s = s.replace(/eau/g, 'o')
  s = s.replace(/au/g, 'o')
  s = s.replace(/ai|ei/g, 'e')
  s = s.replace(/ou/g, 'u')
  s = s.replace(/oi/g, 'wa')
  s = s.replace(/an|en|am|em/g, 'an')
  s = s.replace(/in|im|ain|ein/g, 'in')
  s = s.replace(/on|om/g, 'on')
  s = s.replace(/un|um/g, 'un')

  // c devant a/o/u → k  |  c devant e/i → s
  s = s.replace(/c(?=[aouklrn])/g, 'k')
  s = s.replace(/c(?=[ei])/g, 's')
  s = s.replace(/c$/g, 'k')

  // g devant e/i → j
  s = s.replace(/g(?=[ei])/g, 'j')

  // 3. Réduire les doublons consonantiques
  s = s.replace(/(.)\1+/g, '$1')

  // 4. Supprimer le -e final muet
  s = s.replace(/e$/, '')

  // 5. Supprimer les caractères non-alphabétiques
  s = s.replace(/[^a-z]/g, '')

  return s
}
