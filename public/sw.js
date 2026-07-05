// Service Worker — J'aime le Québec
// Bump CACHE_VER to invalidate all caches on next deploy
const CACHE_VER     = 'v1'
const SHELL_CACHE   = `jlq-shell-${CACHE_VER}`
const PAGES_CACHE   = `jlq-pages-${CACHE_VER}`
const IMAGES_CACHE  = `jlq-images-${CACHE_VER}`
const ALL_CACHES    = [SHELL_CACHE, PAGES_CACHE, IMAGES_CACHE]

const IMAGES_MAX    = 60   // max entries in image cache
const PAGES_TTL_MS  = 7 * 24 * 60 * 60 * 1000  // 7 days

// Pre-cache only lightweight stable assets; hashed _next/static handled on demand
const PRECACHE_URLS = [
  '/manifest.json',
  '/manifest-en.json',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/apple-touch-icon.png',
]

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate — purge old caches ──────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== location.origin) return

  const path = url.pathname

  // /_next/static/ — immutable hashed assets → cache-first
  if (path.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // Images & icons & maps → cache-first with size limit
  if (
    path.startsWith('/images/') ||
    path.startsWith('/icons/')  ||
    path.startsWith('/maps/')
  ) {
    e.respondWith(cacheFirstWithLimit(request, IMAGES_CACHE, IMAGES_MAX))
    return
  }

  // HTML pages (accept: text/html) → stale-while-revalidate with TTL
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(staleWhileRevalidateTTL(request, PAGES_CACHE, PAGES_TTL_MS))
    return
  }

  // Everything else (API, fonts, other) → network-first
  e.respondWith(networkFirst(request))
})

// ── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

async function cacheFirstWithLimit(request, cacheName, max) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
    // Evict oldest entries beyond limit
    const keys = await cache.keys()
    if (keys.length > max) {
      await cache.delete(keys[0])
    }
  }
  return response
}

async function staleWhileRevalidateTTL(request, cacheName, ttlMs) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    const cachedAt = cached.headers.get('sw-cached-at')
    const fresh = !cachedAt || (Date.now() - Number(cachedAt)) < ttlMs

    // Revalidate in background regardless of freshness
    const revalidate = fetch(request).then((response) => {
      if (response.ok) {
        const headers = new Headers(response.headers)
        headers.set('sw-cached-at', String(Date.now()))
        const stamped = new Response(response.body, { status: response.status, headers })
        cache.put(request, stamped)
      }
    }).catch(() => {})

    if (fresh) return cached
    // TTL expired: wait for fresh response
    await revalidate
    return (await cache.match(request)) || cached
  }

  // Not in cache: fetch, stamp, store
  const response = await fetch(request)
  if (response.ok) {
    const headers = new Headers(response.headers)
    headers.set('sw-cached-at', String(Date.now()))
    const stamped = new Response(response.clone().body, { status: response.status, headers })
    cache.put(request, stamped)
  }
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}
