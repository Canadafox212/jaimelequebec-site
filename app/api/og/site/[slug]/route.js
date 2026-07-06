import { ImageResponse } from 'next/og'
import attractionsData from '@/data/attractions.json'

export const runtime = 'nodejs'

const W = 1200
const H = 630
const PHOTO_H = 410
const BAND_H = 220

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

async function toJpegDataUrl(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const sharp = (await import('sharp')).default
    const jpeg = await sharp(buf).resize(W, PHOTO_H, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'fr'
    const photoPath = searchParams.get('photo')

    const attraction = getAttractionBySlug(slug)
    if (!attraction) return new Response('Not found', { status: 404 })

    const { title, region } = resolveOgContent(attraction, lang)

    const origin = new URL(request.url).origin
    const logoUrl = `${origin}/images/logo.png`

    const photoDataUrl = photoPath ? await toJpegDataUrl(`${origin}${photoPath}`) : null

    const titleSize = title.length > 55 ? 26 : title.length > 40 ? 32 : title.length > 28 ? 38 : 44

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: W,
            height: H,
            background: '#003087',
            overflow: 'hidden',
            fontFamily: 'Georgia, serif',
          }}
        >
          {/* Zone photo */}
          <div
            style={{
              display: 'flex',
              width: W,
              height: PHOTO_H,
              position: 'relative',
              overflow: 'hidden',
              background: '#002070',
            }}
          >
            {photoDataUrl && (
              <img
                src={photoDataUrl}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: PHOTO_H,
                  objectFit: 'cover',
                }}
              />
            )}
            {/* Dégradé de transition vers le bandeau */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: W,
                height: 90,
                background: 'linear-gradient(to bottom, transparent, #003087)',
                display: 'flex',
              }}
            />
          </div>

          {/* Bandeau bleu */}
          <div
            style={{
              display: 'flex',
              width: W,
              height: BAND_H,
              background: '#003087',
              alignItems: 'center',
              paddingLeft: 48,
              paddingRight: 48,
              gap: 36,
            }}
          >
            {/* Logo dans rectangle blanc */}
            <div
              style={{
                display: 'flex',
                background: 'white',
                borderRadius: 16,
                padding: '10px 22px',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={logoUrl} style={{ height: 110, objectFit: 'contain' }} />
            </div>

            {/* Titre + région */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                gap: 10,
              }}
            >
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: titleSize,
                  fontWeight: 'bold',
                  lineHeight: 1.15,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {title}
              </span>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 22,
                  fontFamily: 'sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {region}
              </span>
            </div>

          </div>
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
