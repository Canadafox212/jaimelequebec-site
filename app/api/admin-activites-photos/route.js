import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function slugify(str) {
  return (str || '').toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 60)
}

function getImageSrc(slug) {
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  for (const ext of exts) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'activites', `${slug}${ext}`)))
      return `/images/activites/${slug}${ext}`
  }
  return null
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }

  const attractions = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'attractions.json'), 'utf8')
  )

  const labelsSet = new Set()
  for (const a of attractions) {
    for (const act of [...(a.activites?.ete ?? []), ...(a.activites?.hiver ?? [])]) {
      if (!act.activites) continue
      for (const l of act.activites.split('|')) {
        const t = l.trim()
        if (t && t !== 'nan' && t.length > 2) labelsSet.add(t)
      }
    }
  }

  const all = [...labelsSet].sort((a, b) => a.localeCompare(b, 'fr'))

  // Supprime les tronqués : garde seulement la version la plus longue
  // Ex: "Randonnée pé" est supprimé si "Randonnée pédestre" existe (coupure en milieu de mot)
  const labels = all.filter(label =>
    !all.some(
      other =>
        other !== label &&
        other.startsWith(label) &&
        other.length > label.length &&
        /[a-zA-ZÀ-ž0-9]/.test(other[label.length])
    )
  )

  const list = labels.map(nom => {
    const slug = slugify(nom)
    const imageSrc = getImageSrc(slug)
    return { nom, slug, hasImage: imageSrc !== null, imageSrc }
  })

  return NextResponse.json(list)
}
