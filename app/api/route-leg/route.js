export const runtime = 'edge'

export async function POST(request) {
  try {
    const { fromLat, fromLng, toLat, toLng } = await request.json()
    const apiKey = process.env.openrouteservice
    if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 })

    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: [[fromLng, fromLat], [toLng, toLat]] }),
    })

    const data = await res.json()
    const summary = data.routes?.[0]?.summary
    if (!summary) return Response.json({ error: 'No route' }, { status: 400 })

    return Response.json({
      distanceKm: Math.round(summary.distance / 100) / 10,
      durationMin: Math.round(summary.duration / 60),
      geometry: data.routes[0].geometry,
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
