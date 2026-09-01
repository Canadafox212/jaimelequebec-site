'use client'
import { useState, useEffect, useRef } from 'react'

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

const QC = { lat: 53.0, lng: -71.5, zoom: 4.2 }

function LeafletMap({ lat, lng, zoom }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  function flyToDestination(map) {
    map.setView([QC.lat, QC.lng], QC.zoom, { animate: false })
    setTimeout(() => {
      map.flyTo([lat, lng], zoom, { animate: true, duration: 5.0, easeLinearity: 0.1 })
    }, 1200)
  }

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

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map)

      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.9 }
      ).addTo(map)

      mapRef.current = map

      // Clic sur la carte = rejouer l'animation depuis le Québec entier
      map.on('click', () => flyToDestination(map))

      // Lancement initial
      flyToDestination(map)
    }).catch((err) => console.error('[MapModal]', err))

    return () => {
      active = false
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [lat, lng, zoom])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'pointer' }} title="Cliquer pour rejouer" />
  )
}

export default function MapModal({ lat, lng, zoom = 9, regionName = '', light = false }) {
  const [open, setOpen] = useState(false)

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const btnBase = light
    ? { background: '#1e3a5f', border: '1px solid #1e3a5f', color: 'white' }
    : { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', backdropFilter: 'blur(4px)' }
  const btnHover = light ? '#16304f' : 'rgba(255,255,255,0.25)'
  const btnLeave = light ? '#1e3a5f' : 'rgba(255,255,255,0.15)'

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          ...btnBase,
          borderRadius: '9999px',
          padding: '8px 18px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = btnHover}
        onMouseLeave={(e) => e.currentTarget.style.background = btnLeave}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {regionName ? `📍 Localiser — ${regionName}` : '📍 Voir sur la carte'}
      </button>

      {/* Calque modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Fond sombre cliquable pour fermer */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Fenêtre carte */}
          <div
            style={{
              position: 'relative',
              width: '90vw',
              maxWidth: '960px',
              height: '72vh',
              maxHeight: '680px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              background: '#0f172a',
            }}
          >
            {/* Croix fermeture — haut gauche */}
            <button
              onClick={() => setOpen(false)}
              title="Fermer"
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 10,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#1e293b',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Étiquette région — haut droite */}
            {regionName && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  background: 'rgba(0,48,135,0.85)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {regionName}
              </div>
            )}

            {/* Dégradé bas */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />

            {/* Carte Leaflet */}
            <LeafletMap lat={lat} lng={lng} zoom={zoom} />
          </div>
        </div>
      )}
    </>
  )
}
