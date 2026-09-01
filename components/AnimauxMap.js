'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = { OUI: '#16a34a', PARTIEL: '#d97706', NON: '#dc2626' }

function ensureLeaflet(cb) {
  if (typeof window === 'undefined') return
  if (window.L) { cb(); return }

  if (!document.querySelector('link[href*="leaflet"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  const existing = document.querySelector('script[src*="leaflet"]')
  if (existing) {
    existing.addEventListener('load', cb, { once: true })
  } else {
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = cb
    document.head.appendChild(s)
  }
}

export default function AnimauxMap({ sites, lang, t }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markers = useRef([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureLeaflet(() => setReady(true))
  }, [])

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
      const nom = lang === 'fr' ? site.nom_fr : (site.nom_en || site.nom_fr)
      const color = COLORS[site.chiens] ?? '#6b7280'
      const picto = site.chiens === 'NON' ? '🚫' : '🐾'

      const icon = L.divIcon({
        html: `<div style="background:${color};border:2px solid white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer">${picto}</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      })

      const m = L.marker([site.lat, site.lng], { icon }).bindPopup(`
        <div style="min-width:170px;font-family:system-ui,sans-serif">
          <div style="font-weight:600;font-size:13px;margin-bottom:3px">${nom}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:6px">${site.region} · ${site.categorie}</div>
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
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} style={{ height: 380 }} />
      {ready && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/92 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-xs space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 text-xs" style={{ background: COLORS.OUI, border: '1.5px solid white' }}>🐾</span>
            <span className="text-gray-700">{t.badge_oui}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 text-xs" style={{ background: COLORS.PARTIEL, border: '1.5px solid white' }}>🐾</span>
            <span className="text-gray-700">{t.badge_partiel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 text-xs" style={{ background: COLORS.NON, border: '1.5px solid white' }}>🚫</span>
            <span className="text-gray-700">{t.badge_non}</span>
          </div>
        </div>
      )}
    </div>
  )
}
