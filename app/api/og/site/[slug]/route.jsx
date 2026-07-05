import { ImageResponse } from 'next/og'
import { getAttractionBySlug } from '@/lib/attractions'

const W = 1200
const H = 630
const PHOTO_H = 410
const BAND_H = 220

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
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'fr'
  const photoPath = searchParams.get('photo') // ex: /images/attractions/tadoussac.jpg

  const attraction = getAttractionBySlug(slug)
  if (!attraction) return new Response('Not found', { status: 404 })

  const { title, region } = resolveOgContent(attraction, lang)

  const origin = new URL(request.url).origin
  const logoUrl = `${origin}/images/logo.png`
  const foxyUrl = `${origin}/images/Raton-laveur%20avec%20sac%20%C3%A0%20dos%20transparent.png`
  const photoUrl = photoPath ? `${origin}${photoPath}` : null

  // Taille du titre en fonction de la longueur
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
        {/* Zone photo (65 % du haut) */}
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
          {photoUrl && (
            <img
              src={photoUrl}
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
          {/* Dégradé bas → bleu pour transition douce */}
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

        {/* Bandeau bleu bas (35 %) */}
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
          {/* Logo dans un rectangle blanc arrondi */}
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
            <img
              src={logoUrl}
              style={{ height: 110, objectFit: 'contain' }}
            />
          </div>

          {/* Titre + région — flex:1 pour occuper l'espace disponible */}
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

          {/* Foxy — accent discret, aligné en bas à droite du bandeau */}
          <img
            src={foxyUrl}
            style={{
              width: 60,
              height: 60,
              objectFit: 'contain',
              flexShrink: 0,
              alignSelf: 'flex-end',
              marginBottom: 18,
            }}
          />
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
}
