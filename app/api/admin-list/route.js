import { NextResponse } from 'next/server'
import { getAllAttractions, getAttractionImageSrc } from '@/lib/attractions'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }

  const all = getAllAttractions()
  const list = all.map(a => {
    const imageSrc = getAttractionImageSrc(a.slug)
    return {
      slug:     a.slug,
      titre:    a.fr?.titre ?? a.slug,
      region:   a.localisation?.region_touristique ?? '',
      hasImage: imageSrc !== null,
      imageSrc: imageSrc,
    }
  })

  return NextResponse.json(list)
}
