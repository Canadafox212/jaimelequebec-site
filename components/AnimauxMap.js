'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = { OUI: '#16a34a', PARTIEL: '#d97706', NON: '#dc2626' }

function netShape(site) {
  const r = site.reseau ?? ''
  if (r.includes('Parcs Canada')) return 'SQUARE'
  if (r.includes('SÉPAQ'))        return 'CIRCLE'
  return 'TRIANGLE'
}

function makeSvgIcon(L, color, picto, shape) {
  let html, size, anchor

  if (shape === 'SQUARE') {
    html = `<svg width="28" height="28" viewBox="0 0 28 28" style="cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,.3));overflow:visible" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="26" height="26" rx="3" fill="${color}" stroke="white" stroke-width="2"/>
  <text x="14" y="14" text-anchor="middle" dominant-baseline="central" font-size="14">${picto}</text>
</svg>`
    size   = [28, 28]
    anchor = [14, 14]

  } else if (shape === 'TRIANGLE') {
    html = `<svg width="32" height="28" viewBox="0 0 32 28" style="cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,.3));overflow:visible" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,2 30,26 2,26" fill="${color}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
  <text x="16" y="21" text-anchor="middle" font-size="12">${picto}</text>
</svg>`
    size   = [32, 28]
    anchor = [16, 14]

  } else {
    // CIRCLE — SÉPAQ
    html = `<svg width="30" height="30" viewBox="0 0 30 30" style="cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,.3));overflow:visible" xmlns="http://www.w3.org/2000/svg">
  <circle cx="15" cy="15" r="13" fill="${color}" stroke="white" stroke-width="2"/>
  <text x="15" y="15" text-anchor="middle" dominant-baseline="central" font-size="14">${picto}</text>
</svg>`
    size   = [30, 30]
    anchor = [15, 15]
  }

  return L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor, popupAnchor: [0, -anchor[1]] })
}

function ensureLeaflet(cb) {
  if (typeof window === 'undefined') return
  if (window.L) { cb(); return }
  if (!document.querySelector('link[href*="leaflet"]')) {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  const existing = document.querySelector('script[src*="leaflet"]')
  if (existing) {
    existing.addEventListener('load', cb, { once: true })
  } else {
    const s = document.createElement('script')
    s.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = cb
    document.head.appendChild(s)
  }
}

export default function AnimauxMap({ sites, lang, t }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const markers     = useRef([])
  const [ready, setReady] = useState(false)

  useEffect(() => { ensureLeaflet(() => setReady(true)) }, [])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const L = window.L

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: true }).setView([47.2, -71.8], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current)
    }

    markers.current.forEach(m => m.remove())
    markers.current = []

    sites.forEach(site => {
      if (!site.lat || !site.lng) return
      const nom   = lang === 'fr' ? site.nom_fr : (site.nom_en || site.nom_fr)
      const color = COLORS[site.chiens] ?? '#6b7280'
      const picto = site.chiens === 'NON' ? '🚫' : '🐾'
      const shape = netShape(site)
      const icon  = makeSvgIcon(L, color, picto, shape)

      const m = L.marker([site.lat, site.lng], { icon }).bindPopup(`
        <div style="min-width:170px;font-family:system-ui,sans-serif">
          <div style="font-weight:600;font-size:13px;margin-bottom:3px">${nom}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:6px">${site.region} · ${site.reseau}</div>
          ${site.slug_attraction
            ? `<a href="/${lang}/sites/${site.slug_attraction}" style="font-size:12px;color:#a02020;text-decoration:underline">${t.view_fiche}</a>`
            : ''}
        </div>
      `)
      m.addTo(mapInstance.current)
      markers.current.push(m)
    })
  }, [ready, sites, lang, t])

  useEffect(() => {
    return () => {
      markers.current.forEach(m => m?.remove())
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [])

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} style={{ height: 380 }} />

      {ready && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2.5 shadow-md text-xs space-y-1.5 pointer-events-none select-none">

          {/* Statut chien — couleur */}
          <p className="text-gray-400 font-semibold uppercase tracking-wide" style={{ fontSize: 9 }}>Statut chien</p>
          {[
            { color: COLORS.OUI,     picto: '🐾', label: t.badge_oui },
            { color: COLORS.PARTIEL, picto: '🐾', label: t.badge_partiel },
            { color: COLORS.NON,     picto: '🚫', label: t.badge_non },
          ].map(({ color, picto, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <circle cx="15" cy="15" r="13" fill={color} stroke="white" strokeWidth="2"/>
                <text x="15" y="15" textAnchor="middle" dominantBaseline="central" fontSize="13">{picto}</text>
              </svg>
              <span className="text-gray-700">{label}</span>
            </div>
          ))}

          <div className="border-t border-gray-200 my-1" />

          {/* Réseau — forme */}
          <p className="text-gray-400 font-semibold uppercase tracking-wide" style={{ fontSize: 9 }}>Réseau</p>

          {/* SÉPAQ — cercle */}
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <circle cx="15" cy="15" r="13" fill="#6b7280" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="text-gray-700">SÉPAQ</span>
          </div>

          {/* Parcs Canada — carré */}
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="26" height="26" rx="3" fill="#6b7280" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="text-gray-700">Parcs Canada</span>
          </div>

          {/* Autres — triangle */}
          <div className="flex items-center gap-1.5">
            <svg width="16" height="14" viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <polygon points="16,2 30,26 2,26" fill="#6b7280" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="text-gray-700">Autres</span>
          </div>
        </div>
      )}
    </div>
  )
}
