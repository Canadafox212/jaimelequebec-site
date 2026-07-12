// Endpoint de diagnostic — vérifie si la clé ORS fonctionne
// À supprimer après le débogage
export async function GET() {
  const apiKey = process.env.openrouteservice

  if (!apiKey) {
    return Response.json({ ok: false, error: 'Variable openrouteservice introuvable dans Vercel' })
  }

  // Test directions : Montréal → Québec
  try {
    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: [[-73.5536, 45.5089], [-71.2082, 46.8139]] }),
    })
    const data = await res.json()
    const summary = data.routes?.[0]?.summary
    return Response.json({
      ok: !!summary,
      http_status: res.status,
      key_prefix: apiKey.substring(0, 8) + '…',
      distance_km: summary ? Math.round(summary.distance / 100) / 10 : null,
      duration_min: summary ? Math.round(summary.duration / 60) : null,
      raw_error: summary ? null : (data.error ?? data),
    })
  } catch (err) {
    return Response.json({ ok: false, error: err.message })
  }
}
