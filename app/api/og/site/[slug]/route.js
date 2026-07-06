import { ImageResponse } from 'next/og'
import attractionsData from '@/data/attractions.json'

const W = 1200
const H = 630

function getAttractionBySlug(slug) {
  return attractionsData.find(a => a.slug === slug) ?? null
}

function resolveOgContent(attraction, lang) {
  if (lang === 'en') {
    return {
      title: attraction.en?.title ?? attraction.fr?.titre ?? '',
      region: attraction.localisation?.region_touristique ?? '',
    }
  }
  return {
    title: attraction.fr?.titre ?? '',
    region: attraction.localisation?.region_touristique ?? '',
  }
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'fr'

    const attraction = getAttractionBySlug(slug)
    if (!attraction) return new Response('Not found', { status: 404 })

    const { title, region } = resolveOgContent(attraction, lang)

    const origin = new URL(request.url).origin
    const logoUrl = `${origin}/images/logo.png`

    const titleSize = title.length > 55 ? 26 : title.length > 40 ? 32 : title.length > 28 ? 38 : 44

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: W,
            height: H,
            background: 'linear-gradient(160deg, #003087 0%, #0051c8 100%)',
            overflow: 'hidden',
            fontFamily: 'Georgia, serif',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 72,
            gap: 48,
          }}
        >
          {/* Logo dans rectangle blanc */}
          <div
            style={{
              display: 'flex',
              background: 'white',
              borderRadius: 20,
              padding: '14px 32px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={logoUrl} style={{ height: 90, objectFit: 'contain' }} />
          </div>

          {/* Titre */}
          <span
            style={{
              color: '#FFFFFF',
              fontSize: titleSize,
              fontWeight: 'bold',
              lineHeight: 1.2,
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
            }}
          >
            {title}
          </span>

          {/* Région */}
          <span
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 26,
              fontFamily: 'sans-serif',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {region} — Québec
          </span>
        </div>
      ),
      {
        width: W,
        height: H,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    )
  } catch (err) {
    console.error('[OG route error]', err)
    return new Response(`OG generation failed: ${err.message}`, { status: 500 })
  }
}
