// ─── Identifiants affiliés ────────────────────────────────────────────────────
// Remplir ces valeurs dès réception des IDs — tous les liens du site
// se mettront à jour automatiquement.

const IDS = {
  gyg:     'A069RD0',   // GetYourGuide  → partner_id reçu lors de l'inscription
  viator:  '',   // Viator        → pid reçu lors de l'inscription
  booking: '',   // Booking.com   → aid reçu via CJ Affiliate
}

// ─── GetYourGuide ─────────────────────────────────────────────────────────────
// destination : slug GYG (ex: 'province-de-quebec-l561', 'montreal-l157')
export function gygUrl(destination = 'province-de-quebec-l561', lang = 'fr') {
  const locale = lang === 'fr' ? 'fr-fr' : 'en'
  const base   = `https://www.getyourguide.com/${locale}/${destination}/`
  return IDS.gyg ? `${base}?partner_id=${IDS.gyg}` : base
}

// ─── Viator ───────────────────────────────────────────────────────────────────
export function viatorUrl(lang = 'fr') {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'
  const base   = `https://www.viator.com/${locale}/searchResults/all?text=province+de+quebec`
  return IDS.viator
    ? `${base}&pid=${IDS.viator}&mcid=42383&medium=link`
    : base
}

// ─── Booking.com — page région/destination ───────────────────────────────────
export function bookingRegionUrl(lang = 'fr') {
  const base = `https://www.booking.com/region/ca/quebec.${lang}.html`
  return IDS.booking ? `${base}?aid=${IDS.booking}` : base
}

// ─── Booking.com — recherche par ville (road trip, fiches sites) ──────────────
export function bookingSearchUrl(ville, lang = 'fr') {
  const ss   = encodeURIComponent(`${ville}, Québec, Canada`)
  const base = `https://www.booking.com/searchresults.html?ss=${ss}&lang=${lang}`
  return IDS.booking ? `${base}&aid=${IDS.booking}` : base
}

// ─── DiscoverCars — location de voitures ──────────────────────────────────────
// Mapping ville normalisée → slug DiscoverCars
const DC_SLUGS = {
  montreal:           'montreal',
  yul:                'montreal/yul',
  chicoutimi:         'chicoutimi',
  saguenay:           'chicoutimi',
  tremblant:          'mont-tremblant',
  'mont-tremblant':   'mont-tremblant',
  quebec:             'quebec',
  'quebec city':      'quebec',
  yqb:                'quebec/yqb',
}

function normCity(str) {
  return (str ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

// ville : nom de ville libre (ex: 'Montréal', 'Chicoutimi') ou null pour URL générique
// lang  : 'fr' | 'en' | 'de' | 'es' | 'pt' | …
export function discovercarsUrl(ville = null, lang = 'fr') {
  const AID = 'Canadafox'
  const localeMap = { fr: 'fr', de: 'de', es: 'es', pt: 'pt' }
  const locale = localeMap[lang] ?? 'en'
  const slug = ville ? (DC_SLUGS[normCity(ville)] ?? null) : null
  const path = slug ? `/canada/${slug}` : ''
  return `https://www.discovercars.com/${locale}${path}?a_aid=${AID}`
}
