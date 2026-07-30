const CACHE_KEY = 'jmlq_routes'
const CACHE_MAX = 300

const _mem = {}

function cacheKey(fromLat, fromLng, toLat, toLng) {
  return `${Number(fromLat).toFixed(3)},${Number(fromLng).toFixed(3)}->${Number(toLat).toFixed(3)},${Number(toLng).toFixed(3)}`
}

export function routeCacheGet(fromLat, fromLng, toLat, toLng) {
  const k = cacheKey(fromLat, fromLng, toLat, toLng)
  if (_mem[k]) return _mem[k]
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    if (cache[k]) _mem[k] = cache[k]
    return cache[k] ?? null
  } catch { return null }
}

export function routeCacheSet(fromLat, fromLng, toLat, toLng, route) {
  const k = cacheKey(fromLat, fromLng, toLat, toLng)
  _mem[k] = route
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    cache[k] = route
    const keys = Object.keys(cache)
    if (keys.length > CACHE_MAX) delete cache[keys[0]]
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}
