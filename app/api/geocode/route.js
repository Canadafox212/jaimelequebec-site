export const runtime = 'edge'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('q')?.trim()
    if (!text || text.length < 2) return Response.json({ results: [] })

    const apiKey = process.env.openrouteservice
    if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 })

    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(text)}&layers=locality,county&boundary.country=CA&boundary.rect.min_lat=44.9&boundary.rect.max_lat=62.6&boundary.rect.min_lon=-79.8&boundary.rect.max_lon=-56.9&size=6`
    const res = await fetch(url)
    const data = await res.json()

    const results = (data.features ?? [])
      .filter(f => {
        const [lng, lat] = f.geometry.coordinates
        return lat >= 44.9 && lat <= 62.6 && lng >= -79.8 && lng <= -56.9
      })
      .map((f) => ({
        label: f.properties.label,
        lat:   f.geometry.coordinates[1],
        lng:   f.geometry.coordinates[0],
      }))

    return Response.json({ results })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
