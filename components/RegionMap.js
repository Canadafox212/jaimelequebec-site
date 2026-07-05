'use client'
import { useEffect, useRef } from 'react'

// Chargement unique de Leaflet depuis CDN
let leafletPromise = null
function loadLeaflet() {
  if (leafletPromise) return leafletPromise
  if (typeof window !== 'undefined' && window.L) return Promise.resolve(window.L)
  leafletPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = (e) => { leafletPromise = null; reject(e) }
    document.head.appendChild(script)
  })
  return leafletPromise
}

// Québec complet — point de départ de l'animation
const QC = { lat: 53.0, lng: -71.5, zoom: 4.2 }

export default function RegionMap({ lat, lng, zoom = 9, height = '420px' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let active = true

    loadLeaflet().then((L) => {
      if (!active || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center: [QC.lat, QC.lng],
        zoom: QC.zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        touchZoom: false,
      })

      // Couche satellite Esri
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map)

      // Couche labels (villes, routes, frontières) par-dessus le satellite
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, opacity: 0.9 }
      ).addTo(map)

      mapRef.current = map

      // 1,5 s sur le Québec entier → puis vol vers la région
      setTimeout(() => {
        if (!active || !mapRef.current) return
        map.flyTo([lat, lng], zoom, { animate: true, duration: 3.0 })
      }, 1500)
    }).catch((err) => console.error('[RegionMap]', err))

    return () => {
      active = false
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [lat, lng, zoom])

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', backgroundColor: '#0f172a' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
