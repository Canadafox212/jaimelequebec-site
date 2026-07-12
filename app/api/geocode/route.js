export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('q')?.trim()
    if (!text || text.length < 2) return Response.json({ results: [] })

    const apiKey = process.env.openrouteservice
    if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 })

    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(text)}&layers=locality,county,region,country&size=6`
    const res = await fetch(url)
    const data = await res.json()

    const results = (data.features ?? []).map((f) => ({
      label: f.properties.label,
      lat:   f.geometry.coordinates[1],
      lng:   f.geometry.coordinates[0],
    }))

    return Response.json({ results })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
