import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const attractionsData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'attractions.json'), 'utf8'))
const filtresData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'filtres.json'), 'utf8'))
const distancesData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'distances.json'), 'utf8'))

export function getAllAttractions() {
  return attractionsData
}

export function getAttractionBySlug(slug) {
  return attractionsData.find((a) => a.slug === slug) ?? null
}

export function getAttractionById(id) {
  return attractionsData.find((a) => a.id === id) ?? null
}

export function getFiltres() {
  return filtresData
}

export function getNearbyAttractions(attractionId, limit = 6) {
  const neighbors = distancesData[String(attractionId)] ?? []
  return neighbors
    .slice(0, limit)
    .map((n) => {
      const a = getAttractionById(n.id)
      return a ? { ...a, distanceKm: n.distance_routiere_estimee_km, dureeH: n.duree_estimee_h, mode: n.mode_estime } : null
    })
    .filter(Boolean)
}

export function getAttractionImageSrc(slug) {
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  for (const ext of exts) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'attractions', `${slug}${ext}`)))
      return `/images/attractions/${slug}${ext}`
  }
  return null
}

export function getActivitesForPage(attraction) {
  const overridesPath = join(process.cwd(), 'data', 'activites-overrides.json')
  let overrides = {}
  try {
    if (existsSync(overridesPath)) overrides = JSON.parse(readFileSync(overridesPath, 'utf8'))
  } catch {}
  const slugOv = overrides[attraction.slug] ?? {}

  function merge(arr, saison) {
    return (arr ?? []).map(a => {
      const extra = slugOv[saison]?.[a.nom] ?? []
      if (!extra.length) return a
      const base = (a.activites ?? '').split('|').map(s => s.trim()).filter(s => s && s !== 'nan')
      return { ...a, activites: [...new Set([...base, ...extra])].join(' | ') }
    })
  }
  return {
    ete:   merge(attraction.activites?.ete,   'ete'),
    hiver: merge(attraction.activites?.hiver, 'hiver'),
  }
}

export function getActivityPhotoSrc(label) {
  const slug = slugify(label)
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  for (const ext of exts) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'activites', `${slug}${ext}`)))
      return `/images/activites/${slug}${ext}`
  }
  return null
}

export function getServiceImageSrc(nom) {
  const slug = slugify(nom)
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  for (const ext of exts) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'services', `${slug}${ext}`)))
      return `/images/services/${slug}${ext}`
  }
  return null
}

export function filterAttractions({ region, categorie, saison } = {}) {
  return attractionsData.filter((a) => {
    if (region && a.localisation.region_num !== Number(region)) return false
    if (categorie) {
      const cat = a.fr?.categorie_thematique
      if (!cat || !cat.toLowerCase().includes(categorie.toLowerCase())) return false
    }
    if (saison && saison !== 'all') {
      if (saison === 'ete' && !a.activites?.ete?.length) return false
      if (saison === 'hiver' && !a.activites?.hiver?.length) return false
    }
    return true
  })
}
