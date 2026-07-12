const CACHE_KEY = 'jmlq_routes'
const CACHE_MAX = 300

function cacheKey(fromLat, fromLng, toLat, toLng) {
  return `${Number(fromLat).toFixed(3)},${Number(fromLng).toFixed(3)}->${Number(toLat).toFixed(3)},${Number(toLng).toFixed(3)}`
}

export function routeCacheGet(fromLat, fromLng, toLat, toLng) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    return cache[cacheKey(fromLat, fromLng, toLat, toLng)] ?? null
  } catch { return null }
}

export function routeCacheSet(fromLat, fromLng, toLat, toLng, route) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    cache[cacheKey(fromLat, fromLng, toLat, toLng)] = route
    const keys = Object.keys(cache)
    if (keys.length > CACHE_MAX) delete cache[keys[0]]
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}
