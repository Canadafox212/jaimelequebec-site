'use client'
import { useEffect, useRef } from 'react'

function decodePolyline(encoded) {
  const pts = []
  let i = 0, lat = 0, lng = 0
  while (i < encoded.length) {
    let b, s = 0, r = 0
    do { b = encoded.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5 } while (b >= 32)
    lat += r & 1 ? ~(r >> 1) : r >> 1
    s = 0; r = 0
    do { b = encoded.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5 } while (b >= 32)
    lng += r & 1 ? ~(r >> 1) : r >> 1
    pts.push([lat / 1e5, lng / 1e5])
  }
  return pts
}

function buildMap(L, el, legs, displayStops) {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const map = L.map(el)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  const allPoints = []

  // Polylines from ORS geometry
  legs.forEach(leg => {
    if (!leg.geometry) return
    const pts = decodePolyline(leg.geometry)
    allPoints.push(...pts)
    L.polyline(pts, { color: '#1a3a5c', weight: 4, opacity: 0.85 }).addTo(map)
  })

  // Stop markers
  displayStops.forEach((stop, i) => {
    if (!stop.lat || !stop.lng) return
    allPoints.push([stop.lat, stop.lng])

    let emoji, bg
    if (stop.isCustomDeparture) { emoji = '🏁'; bg = '#2563eb' }
    else if (stop.isPort)        { emoji = '🚢'; bg = '#0891b2' }
    else if (stop.overnight)     { emoji = '🌙'; bg = '#7c3aed' }
    else                         { emoji = null;  bg = '#1a3a5c' }

    const inner = emoji
      ? `<span style="font-size:13px;line-height:1">${emoji}</span>`
      : `<span style="font-size:11px;font-weight:bold">${i}</span>`

    const html = `<div style="background:${bg};color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)">${inner}</div>`

    L.marker([stop.lat, stop.lng], {
      icon: L.divIcon({ className: '', html, iconSize: [30, 30], iconAnchor: [15, 15] }),
    }).bindPopup(`<strong>${stop.title}</strong>`).addTo(map)
  })

  if (allPoints.length >= 2) {
    map.fitBounds(allPoints, { padding: [40, 40] })
  } else if (allPoints.length === 1) {
    map.setView(allPoints[0], 10)
  } else {
    map.setView([47, -70], 6)
  }

  return map
}

export default function PlanifierMap({ legs, displayStops }) {
  const divRef = useRef(null)
  const mapRef = useRef(null)
  const legsRef = useRef(legs)
  const stopsRef = useRef(displayStops)

  // Stable key: only rebuild when geometry or stop positions actually change
  const mapKey = JSON.stringify([
    legs.map(l => l.geometry),
    displayStops.map(s => [s.slug, s.lat, s.lng, s.overnight, s.isPort, s.isCustomDeparture]),
  ])

  useEffect(() => {
    legsRef.current = legs
    stopsRef.current = displayStops
  })

  useEffect(() => {
    if (!divRef.current) return
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

    function setup() {
      if (!divRef.current || mapRef.current) return
      mapRef.current = buildMap(window.L, divRef.current, legsRef.current, stopsRef.current)
    }

    if (window.L) {
      setup()
    } else {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      const existing = document.getElementById('leaflet-js')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = setup
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', setup)
        if (window.L) setup()
      }
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [mapKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={divRef}
      className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow"
      style={{ height: '450px' }}
    />
  )
}
