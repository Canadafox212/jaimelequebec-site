import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'

const FALLBACKS = [
  'hotel','auberge','motel','gite','camping','restaurant','bar','cafe',
  'parc','plage','marina','peche','ski-alpin','ski-fond','patinoire',
  'velo','golf','equestre','karting','sport','jardin','spa','casino',
]

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg']

function getImageSrc(name) {
  for (const ext of EXTS) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'fallbacks', `${name}${ext}`)))
      return `/images/fallbacks/${name}${ext}`
  }
  return null
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }
  const list = FALLBACKS.map(name => ({
    name,
    imageSrc: getImageSrc(name),
  }))
  return NextResponse.json(list)
}
