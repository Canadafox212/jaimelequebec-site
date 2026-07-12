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
