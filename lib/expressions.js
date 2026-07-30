import data from '@/data/expressions.json'

export function getAllExpressions() {
  return data
}

export function getExpressionBySlug(slug) {
  return data.find((e) => e.slug === slug) ?? null
}

export function getAllSlugs() {
  return data.map((e) => e.slug)
}

export function getCategories() {
  const counts = {}
  for (const e of data) {
    if (e.categorie) counts[e.categorie] = (counts[e.categorie] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}
