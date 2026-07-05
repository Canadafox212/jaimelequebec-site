import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getAllAttractions, getFiltres, getServiceImageSrc, getActivityPhotoSrc } from './attractions'

const SAISONS_PATH = join(process.cwd(), 'data', 'activites-saisons.json')
function getSaisonsOverrides() {
  try { if (existsSync(SAISONS_PATH)) return JSON.parse(readFileSync(SAISONS_PATH, 'utf8')) } catch {}
  return {}
}

// Vérifie si une activité (par nom) est autorisée dans la saison demandée selon les overrides.
function saisonOk(nom, saison, ovr) {
  const v = ovr[nom]
  if (!v || v === 'les_deux') return true
  return v === saison
}

const tax = JSON.parse(readFileSync(join(process.cwd(), 'data', 'themes-activites.json'), 'utf8'))

// Registre des services (descriptions, liens, priorités…). Lu à chaque accès
// pour refléter immédiatement les modifications faites via l'admin.
function getServicesData() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', 'services.json'), 'utf8'))
  } catch {
    return {}
  }
}

export function getService(nom) {
  return getServicesData()[nom] ?? null
}

// Mise en avant des attractions (slug -> { priorite, coup_de_coeur }). Lu à chaque accès.
function getFeaturedData() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', 'attractions-featured.json'), 'utf8'))
  } catch {
    return {}
  }
}

// Attractions « coups de cœur » pour la page d'accueil, triées par priorité.
export function getCoupsDeCoeur(limit = 6) {
  const f = getFeaturedData()
  return getAllAttractions()
    .filter((a) => f[a.slug]?.coup_de_coeur)
    .sort((a, b) => (f[b.slug]?.priorite || 0) - (f[a.slug]?.priorite || 0))
    .slice(0, limit)
}

// Trouve un service par le slug de sa page perso (champ `page`)
export function getServiceByPage(slug) {
  for (const [nom, svc] of Object.entries(getServicesData())) {
    if (svc && typeof svc === 'object' && svc.page === slug) return { nom, ...svc }
  }
  return null
}

export function getTaxonomie() {
  return tax
}

export function getTheme(id) {
  return tax.themes.find((t) => t.id === id) ?? null
}

export function getRegions() {
  return getFiltres().regions
}

export function getRegion(num) {
  return getRegions().find((r) => r.num === Number(num)) ?? null
}

// ── Calcul des thèmes d'un élément (multi-thème) ──────────────────────────
function labelsOf(act) {
  return (act.activites || '')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'nan' && s.length > 2)
}

function themesForActivity(act) {
  const set = new Set()
  if (act.type && tax.types[act.type]) set.add(tax.types[act.type])
  for (const l of labelsOf(act)) if (tax.libelles[l]) set.add(tax.libelles[l])
  if (act.nom && tax.noms[act.nom]) set.add(tax.noms[act.nom])
  return set
}

function themeForAttraction(a) {
  const c = a.fr?.categorie_thematique
  return c ? tax.categories[c] ?? null : null
}

function getActivityPhotoForLabels(labels) {
  for (const l of labels || []) {
    const src = getActivityPhotoSrc(l)
    if (src) return src
  }
  return null
}

const SAISONS = { ete: 'ete', hiver: 'hiver' }
function themeAllowsSeason(theme, saison) {
  return theme.saison === 'les_deux' || theme.saison === saison
}

// ── Index région → thème → { attractions, établissements } ────────────────
// Construit une fois au chargement (données statiques).
function buildIndex() {
  const attractions = getAllAttractions()
  // regionNum -> themeId -> { attractions:Map(slug->a), eteEtab:Map(nom->etab), hiverEtab:Map }
  const idx = {}
  const ensure = (rn, id) => {
    idx[rn] = idx[rn] || {}
    idx[rn][id] = idx[rn][id] || { attractions: new Map(), ete: new Map(), hiver: new Map() }
    return idx[rn][id]
  }

  for (const a of attractions) {
    const rn = a.localisation?.region_num
    if (rn == null) continue

    // Attraction principale -> son thème
    const at = themeForAttraction(a)
    if (at) ensure(rn, at).attractions.set(a.slug, a)

    // Localisation réelle = celle de l'attraction parente (les activités n'en ont pas)
    const pville  = a.localisation?.ville ?? null
    const pregion = a.localisation?.region_touristique ?? null

    // Activités à proximité (rattachées à la région de l'attraction)
    for (const saison of ['ete', 'hiver']) {
      for (const act of a.activites?.[saison] || []) {
        const themes = themesForActivity(act)
        const d = act.dist_km ?? null
        for (const id of themes) {
          const bucket = ensure(rn, id)[saison]
          const prev = bucket.get(act.nom)
          // Ville/région = celles de l'attraction parente la PLUS PROCHE
          let ville = prev?.ville ?? null, region = prev?.region ?? null
          let best = prev?._best ?? Infinity
          if (!prev || (d != null && d < best)) { ville = pville; region = pregion; best = d != null ? d : best }
          const merged = {
            nom: act.nom,
            type: act.type ?? prev?.type ?? null,
            labels: [...new Set([...(prev?.labels || []), ...labelsOf(act)])],
            dist_km: prev?.dist_km != null ? Math.min(prev.dist_km, act.dist_km ?? prev.dist_km) : act.dist_km ?? null,
            ville, region, _best: best,
          }
          bucket.set(act.nom, merged)
        }
      }
    }
  }
  return idx
}

const INDEX = buildIndex()

// ── API publique ──────────────────────────────────────────────────────────

// Sous-catégories d'un thème dans une région/saison (libellés + types rattachés à CE thème)
function sousCategories(entry, themeId, saison) {
  const set = new Set()
  for (const e of entry[saison].values()) {
    if (e.type && tax.types[e.type] === themeId) set.add(e.type)
    for (const l of e.labels) if (tax.libelles[l] === themeId) set.add(l)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'fr')).slice(0, 12)
}

// Thèmes disponibles dans une région, séparés en blocs été / hiver, avec compte + sous-catégories.
// Conservé pour compatibilité (sites/page.js bridge + éventuels appels externes).
export function getRegionThemes(regionNum) {
  const rn = Number(regionNum)
  const regionIdx = INDEX[rn] || {}
  const ete = [], hiver = []
  for (const theme of tax.themes) {
    const entry = regionIdx[theme.id]
    if (!entry) continue
    const nbAttr = entry.attractions.size
    if (themeAllowsSeason(theme, 'ete')) {
      const n = nbAttr + entry.ete.size
      if (n > 0) ete.push({ theme, count: n, sous: sousCategories(entry, theme.id, 'ete') })
    }
    if (themeAllowsSeason(theme, 'hiver')) {
      const n = nbAttr + entry.hiver.size
      if (n > 0) hiver.push({ theme, count: n, sous: sousCategories(entry, theme.id, 'hiver') })
    }
  }
  const bySize = (a, b) => b.count - a.count
  return { ete: ete.sort(bySize), hiver: hiver.sort(bySize) }
}

// Liste unique de thèmes pour la page région (sans doublon été/hiver).
// count = max(été, hiver) pour refléter le volume réel.
export function getRegionThemeList(regionNum) {
  const rn = Number(regionNum)
  const regionIdx = INDEX[rn] || {}
  const result = []
  for (const theme of tax.themes) {
    const entry = regionIdx[theme.id]
    if (!entry) continue
    const nbAttr = entry.attractions.size
    const nEte   = themeAllowsSeason(theme, 'ete')   ? nbAttr + entry.ete.size   : 0
    const nHiver  = themeAllowsSeason(theme, 'hiver') ? nbAttr + entry.hiver.size : 0
    const count = Math.max(nEte, nHiver)
    if (count === 0) continue
    const sous = [...new Set([
      ...sousCategories(entry, theme.id, 'ete'),
      ...sousCategories(entry, theme.id, 'hiver'),
    ])].slice(0, 12)
    result.push({ theme, count, sous })
  }
  return result.sort((a, b) => b.count - a.count)
}

// Régions ayant au moins un thème, avec total d'éléments (pour la page d'accueil activités).
export function getRegionsWithCounts() {
  return getRegions()
    .map((r) => {
      const themes = INDEX[r.num] || {}
      let total = 0
      for (const id in themes) total += themes[id].attractions.size + themes[id].ete.size + themes[id].hiver.size
      return { ...r, total }
    })
    .filter((r) => r.total > 0)
}

// Liste dédupliquée de TOUS les établissements (pour l'admin)
export function getAllEtablissements() {
  const map = new Map()
  for (const rn in INDEX) {
    for (const id in INDEX[rn]) {
      for (const saison of ['ete', 'hiver']) {
        for (const [nom, e] of INDEX[rn][id][saison]) {
          const prev = map.get(nom)
          const best = e._best ?? Infinity
          if (!prev) map.set(nom, { nom, type: e.type, ville: e.ville, region: e.region, _best: best })
          else if (best < prev._best) { prev.ville = e.ville; prev.region = e.region; prev.type = e.type ?? prev.type; prev._best = best }
        }
      }
    }
  }
  return [...map.values()]
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    .map(({ _best, ...r }) => r)
}

// Index des établissements pour la RECHERCHE : un par nom, avec sa région/thème
// représentatifs (les plus proches) + page perso éventuelle.
export function getEtablissementsIndex() {
  const services = getServicesData()
  const regions = getRegions()
  const regionFr = n => regions.find(r => r.num === n)?.nom_fr ?? ''
  const regionEn = n => regions.find(r => r.num === n)?.nom_en ?? ''
  const themeOf = id => tax.themes.find(t => t.id === id)
  const map = new Map()
  for (const rn in INDEX) {
    for (const themeId in INDEX[rn]) {
      for (const saison of ['ete', 'hiver']) {
        for (const [nom, e] of INDEX[rn][themeId][saison]) {
          let cur = map.get(nom)
          if (!cur) { cur = { nom, type: e.type, labels: new Set(), regionNum: Number(rn), themeId, _best: e._best ?? Infinity }; map.set(nom, cur) }
          for (const l of e.labels) cur.labels.add(l)
          if ((e._best ?? Infinity) < cur._best) { cur.regionNum = Number(rn); cur.themeId = themeId; cur._best = e._best ?? Infinity; if (e.type) cur.type = e.type }
        }
      }
    }
  }
  return [...map.values()].map(c => {
    const th = themeOf(c.themeId)
    const svc = services[c.nom]
    return {
      nom: c.nom, type: c.type, labels: [...c.labels],
      regionNum: c.regionNum, region_fr: regionFr(c.regionNum), region_en: regionEn(c.regionNum),
      themeId: c.themeId, theme_fr: th?.nom_fr ?? '', theme_en: th?.nom_en ?? '', emoji: th?.emoji ?? '📍',
      page: svc?.page ?? null,
      url: svc?.url ?? null,
      site_web: svc?.site_web ?? null,
      photo: svc?.photo ?? getServiceImageSrc(c.nom) ?? null,
      activity_photo: getActivityPhotoForLabels([...c.labels]),
    }
  })
}

// Version légère pour l'admin : pas de lookups photos (existsSync × 3000+ = lent sur N:)
export function getEtablissementsForAdmin() {
  const services = getServicesData()
  const regions = getRegions()
  const regionFr = n => regions.find(r => r.num === n)?.nom_fr ?? ''
  const themeOf = id => tax.themes.find(t => t.id === id)
  const map = new Map()
  for (const rn in INDEX) {
    for (const themeId in INDEX[rn]) {
      for (const saison of ['ete', 'hiver']) {
        for (const [nom, e] of INDEX[rn][themeId][saison]) {
          let cur = map.get(nom)
          if (!cur) { cur = { nom, type: e.type, regionNum: Number(rn), themeId, _best: e._best ?? Infinity }; map.set(nom, cur) }
          if ((e._best ?? Infinity) < cur._best) { cur.regionNum = Number(rn); cur.themeId = themeId; cur._best = e._best ?? Infinity; if (e.type) cur.type = e.type }
        }
      }
    }
  }
  return [...map.values()].map(c => {
    const th = themeOf(c.themeId)
    const svc = services[c.nom]
    return {
      nom: c.nom, type: c.type,
      regionNum: c.regionNum, region: regionFr(c.regionNum),
      themeId: c.themeId, theme: th?.nom_fr ?? '',
      photo: svc?.photo ?? null,
    }
  })
}

// Retrouve un établissement dans tout l'index (par nom) → type, mots-clés, ville
export function findEtablissement(nom) {
  let found = null
  for (const rn in INDEX) {
    for (const id in INDEX[rn]) {
      for (const saison of ['ete', 'hiver']) {
        const e = INDEX[rn][id][saison].get(nom)
        if (!e) continue
        if (!found) {
          found = { type: e.type, labels: [...e.labels], ville: e.ville, region: e.region, _best: e._best ?? Infinity }
        } else {
          found.labels = [...new Set([...found.labels, ...e.labels])]
          if ((e._best ?? Infinity) < found._best) { found.ville = e.ville; found.region = e.region; found._best = e._best ?? Infinity }
        }
      }
    }
  }
  return found
}

// Résultats d'un (région, thème, saison) : Bloc 2 = attractions (nos pages),
// Bloc 1 = établissements à proximité (liens Google).
export function getRegionThemeResults(regionNum, themeId, saison) {
  const rn = Number(regionNum)
  const entry = (INDEX[rn] || {})[themeId]
  if (!entry) return { attractions: [], etablissements: [] }

  const feat = getFeaturedData()
  const attractions = [...entry.attractions.values()]
    .sort((a, b) => (feat[b.slug]?.priorite || 0) - (feat[a.slug]?.priorite || 0))

  // Établissements selon la saison demandée (sinon les deux, dédupliqués par nom)
  const ovr = getSaisonsOverrides()
  const merge = new Map()
  const add = (m, saisonSrc) => {
    for (const [nom, etab] of m) {
      if (!saisonOk(nom, saisonSrc, ovr)) continue
      const prev = merge.get(nom)
      if (!prev) merge.set(nom, { ...etab })
      else {
        prev.labels = [...new Set([...prev.labels, ...etab.labels])]
        if (etab._best != null && etab._best < (prev._best ?? Infinity)) {
          prev.ville = etab.ville; prev.region = etab.region; prev._best = etab._best
        }
        if (etab.dist_km != null) prev.dist_km = prev.dist_km != null ? Math.min(prev.dist_km, etab.dist_km) : etab.dist_km
      }
    }
  }
  if (saison === 'ete') add(entry.ete, 'ete')
  else if (saison === 'hiver') add(entry.hiver, 'hiver')
  else { add(entry.ete, 'ete'); add(entry.hiver, 'hiver') }

  const services = getServicesData()
  const tous = [...merge.values()].map((e) => {
    const svc = services[e.nom] ?? {}
    const cure = !!(svc.featured || svc.url || svc.page)
    return {
      nom: e.nom,
      type: e.type,
      labels: e.labels,
      dist_km: e.dist_km,
      ville: e.ville,
      region: e.region,
      description_fr: svc.description_fr ?? null,
      description_en: svc.description_en ?? null,
      description_es: svc.description_es ?? null,
      description_de: svc.description_de ?? null,
      description_pt: svc.description_pt ?? null,
      description_ru: svc.description_ru ?? null,
      description_zh: svc.description_zh ?? null,
      description_hi: svc.description_hi ?? null,
      url: svc.url ?? null,
      site_web: svc.site_web ?? null,
      page: svc.page ?? null,
      photo: svc.photo ?? getServiceImageSrc(e.nom) ?? null,
      activity_photo: getActivityPhotoForLabels(e.labels),
      priorite: svc.priorite ?? 0,
      cure,
    }
  })

  // Bloc 2 « Nos sélections » = services pilotés (mis en avant, lien d'affiliation ou page perso)
  const selections = tous.filter((e) => e.cure).sort((a, b) => b.priorite - a.priorite || (a.dist_km ?? 9999) - (b.dist_km ?? 9999))
  // Bloc 1 « Sur Google » = le reste
  const etablissements = tous.filter((e) => !e.cure).sort((a, b) => (a.dist_km ?? 9999) - (b.dist_km ?? 9999))

  return { attractions, selections, etablissements }
}
