// Viator Affiliate API — server-side only (clé jamais exposée côté client)
// Doc: https://docs.viator.com/partner-api/affiliate/technical/

const BASE_URL = 'https://api.viator.com/partner'

// Mapping region num → Viator destination ID
// IDs visibles dans les URLs viator.com/…/d<ID>
// Compléter via /v1/taxonomy/destinations une fois la clé active
const VIATOR_DEST = {
  1:  625,    // Montréal
  2:  626,    // Québec (Capitale-Nationale) / Québec City
  3:  16596,  // Charlevoix (attraction ID trouvé sur viator.com)
  4:  264,    // Gaspésie → province Québec par défaut
  5:  264,    // Bas-Saint-Laurent
  6:  50497,  // Saguenay–Lac-Saint-Jean / Tadoussac
  7:  50497,  // Côte-Nord
  8:  264,    // Cantons-de-l'Est
  9:  264,    // Outaouais
  10: 264,    // Mauricie
  11: 264,    // Lanaudière
  12: 264,    // Laurentides
  13: 625,    // Montérégie → Montréal area
  14: 264,    // Chaudière-Appalaches
  15: 264,    // Centre-du-Québec
  16: 264,    // Îles-de-la-Madeleine
  17: 264,    // Abitibi-Témiscamingue
  18: 264,    // Nord-du-Québec
  19: 625,    // Laval → Montréal area
  20: 264,    // Incontournables transversaux → province
}

// Mapping theme ID → tag Viator principal (UN SEUL — filtre ET sinon 0 résultats)
// Fallback : si 0 résultats avec le tag → on relance sans filtre (produits populaires région)
const THEME_PRIMARY_TAG = {
  'bars-vie-nocturne':    12054,   // Nightlife
  'musique-spectacle':    21765,   // Shows
  'culture-patrimoine':   12028,   // Cultural Tours
  'gastronomie-terroir':  12053,   // Culinary Tours
  'sports-nautiques':     12047,   // Kayaking Tours
  'sports-hiver':         19075,   // Skiing
  'rando-nature':         11902,   // Hiking Tours
  'velo':                 18902,   // Bicycle Tours
  'golf':                 12037,   // Golf Tours
  'spa-bien-etre':        null,    // Pas de tag pertinent
  'familles-attractions': 21769,   // All Activities
  'parcs-jardins-faune':  11903,   // Nature & Wildlife Tours
  'casino-jeux':          null,    // Pas de tag pertinent
  'peche':                11903,   // Nature & Wildlife Tours
  'aventure-pleinair':    22046,   // Adventure Tours
  'hebergement':          null,    // Pas de produits Viator
  'sports-mecaniques':    21421,   // ATV Tours
}

export function getViatorDestId(regionNum) {
  return VIATOR_DEST[regionNum] ?? 264
}

const LANG_HEADER = {
  fr: 'fr', en: 'en-US', es: 'es', de: 'de', pt: 'pt', ru: 'ru', zh: 'zh', hi: 'hi',
}

export async function searchViatorProducts({ regionNum, themeId, count = 6, lang = 'fr' }) {
  const apiKey = process.env.VIATOR_API_KEY
  if (!apiKey || apiKey === 'COLLE_TA_CLÉ_ICI') return []

  // Thèmes sans produits Viator pertinents
  if (themeId === 'hebergement') return []

  const destinationId = getViatorDestId(regionNum)
  const primaryTag = THEME_PRIMARY_TAG[themeId] ?? null

  const headers = {
    'exp-api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json;version=2.0',
    'Accept-Language': LANG_HEADER[lang] ?? 'en-US',
  }
  // Filtre de dates : produits disponibles dans les 3 prochains mois
  const today = new Date()
  const startDate = today.toISOString().slice(0, 10)
  const end = new Date(today); end.setMonth(end.getMonth() + 3)
  const endDate = end.toISOString().slice(0, 10)

  const body = (filtering) => JSON.stringify({
    filtering: { ...filtering, startDate, endDate },
    sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
    pagination: { start: 1, count },
    currency: 'CAD',
  })

  try {
    // 1er essai : avec tag thème si disponible
    if (primaryTag) {
      const res = await fetch(`${BASE_URL}/products/search`, {
        method: 'POST', headers,
        body: body({ destination: String(destinationId), tags: [primaryTag] }),
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const data = await res.json()
        if ((data.products ?? []).length > 0) return data.products
      }
    }

    // Fallback : produits populaires de la région sans filtre thème
    const res2 = await fetch(`${BASE_URL}/products/search`, {
      method: 'POST', headers,
      body: body({ destination: String(destinationId) }),
      next: { revalidate: 3600 },
    })
    if (!res2.ok) return []
    const data2 = await res2.json()
    return data2.products ?? []
  } catch {
    return []
  }
}
