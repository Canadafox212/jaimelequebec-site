'use client'

import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// CartoDB Voyager — tiles de rue légères, lisibles à tout zoom, pas de clé API
const CARTO_TILES = [
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
]

const CARTO_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '© <a href="https://carto.com/attributions">CARTO</a>'

// Vue initiale centrée sur la province
const QC_CENTER = [-71.5, 52.5]
const QC_ZOOM   = 4.5

function resolveContent(attraction, lang) {
  if (lang === 'fr') return { title: attraction.fr?.titre, category: attraction.fr?.categorie_thematique }
  if (lang === 'en') return { title: attraction.en?.title, category: attraction.en?.theme_category }
  const tr = attraction[lang]
  return {
    title:    tr?.titre ?? tr?.title ?? attraction.en?.title ?? attraction.fr?.titre,
    category: attraction.en?.theme_category ?? attraction.fr?.categorie_thematique,
  }
}

function SitePopupContent({ attraction, lang, t }) {
  const { title, category } = resolveContent(attraction, lang)
  const href = `/${lang}/sites/${attraction.slug}`

  return (
    <div style={{ width: 260, fontFamily: 'system-ui, -apple-system, sans-serif', borderRadius: 10, overflow: 'hidden' }}>
      {attraction._imageSrc && (
        <img
          src={attraction._imageSrc}
          alt={title ?? ''}
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
        />
      )}
      <div style={{ padding: '10px 14px 14px' }}>
        {category && (
          <div style={{ fontSize: 10, fontWeight: 700, color: '#C9922A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {category}
          </div>
        )}
        <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: '#111827' }}>
          {title}
        </h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
          📍 {attraction.localisation.region_touristique}
        </div>
        <a
          href={href}
          style={{
            display: 'inline-block',
            background: '#003087',
            color: 'white',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#001a4d' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#003087' }}
        >
          {t.home?.featured_link ?? (lang === 'fr' ? 'Voir la fiche' : 'View details')} →
        </a>
      </div>
    </div>
  )
}

function buildFeatures(attractions) {
  return attractions
    .filter(a => a.localisation?.latitude != null && a.localisation?.longitude != null)
    .map(a => ({
      type: 'Feature',
      id: a.id,
      geometry: { type: 'Point', coordinates: [a.localisation.longitude, a.localisation.latitude] },
      properties: { id: a.id },
    }))
}

function fitToFeatures(map, features) {
  if (!features.length) return
  const bounds = new maplibregl.LngLatBounds()
  features.forEach(f => bounds.extend(f.geometry.coordinates))
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 700 })
  }
}

export default function MapSitesView({ attractions, lang, t, userPos }) {
  const containerRef   = useRef(null)
  const mapRef         = useRef(null)
  const userMarkerRef  = useRef(null)
  const popupRef       = useRef(null)
  const popupRootRef   = useRef(null)
  const attractionsRef = useRef(attractions)
  const hoveredIdRef   = useRef(null)

  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => { attractionsRef.current = attractions }, [attractions])

  // ── Initialisation de la carte (une seule fois) ────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        sources: {
          carto: {
            type: 'raster',
            tiles: CARTO_TILES,
            tileSize: 256,
            attribution: CARTO_ATTRIBUTION,
          },
        },
        layers: [{ id: 'carto-bg', type: 'raster', source: 'carto' }],
      },
      center: QC_CENTER,
      zoom: QC_ZOOM,
      attributionControl: { compact: true },
    })

    map.on('error', () => { if (!cancelled) setMapError(true) })

    map.on('load', () => {
      if (cancelled) { map.remove(); return }

      const features = buildFeatures(attractionsRef.current)

      if (process.env.NODE_ENV === 'development') {
        const skipped = attractionsRef.current.length - features.length
        if (skipped > 0) console.warn(`[MapSitesView] ${skipped} site(s) sans coordonnées ignorés (itinéraires).`)
      }

      map.addSource('sites', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
        generateId: false,
      })

      // Couche principale des pins
      map.addLayer({
        id: 'sites-pins',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius':       ['interpolate', ['linear'], ['zoom'], 4, 5, 10, 10],
          'circle-color':        ['case', ['boolean', ['feature-state', 'hover'], false], '#C9922A', '#003087'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity':      1,
        },
      })

      fitToFeatures(map, features)

      // ── Interactions ────────────────────────────────────────────────────

      map.on('mouseenter', 'sites-pins', e => {
        map.getCanvas().style.cursor = 'pointer'
        const id = e.features?.[0]?.id
        if (id == null) return
        if (hoveredIdRef.current != null) map.setFeatureState({ source: 'sites', id: hoveredIdRef.current }, { hover: false })
        hoveredIdRef.current = id
        map.setFeatureState({ source: 'sites', id }, { hover: true })
      })

      map.on('mouseleave', 'sites-pins', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredIdRef.current != null) {
          map.setFeatureState({ source: 'sites', id: hoveredIdRef.current }, { hover: false })
          hoveredIdRef.current = null
        }
      })

      map.on('click', 'sites-pins', e => {
        e.preventDefault()
        const id = e.features?.[0]?.properties?.id
        const attraction = attractionsRef.current.find(a => a.id === id)
        if (!attraction) return
        openPopup(map, attraction, e.lngLat)
      })

      // Clic sur fond de carte → ferme popup
      map.on('click', e => {
        if (e.defaultPrevented) return
        closePopup()
      })

      mapRef.current = map
      setReady(true)
    })

    return () => {
      cancelled = true
      closePopup()
      userMarkerRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mise à jour des données quand les filtres changent ────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const source = map.getSource('sites')
    if (!source) return

    const features = buildFeatures(attractions)
    source.setData({ type: 'FeatureCollection', features })
    fitToFeatures(map, features)
    closePopup()
  }, [attractions])

  // ── Marker position utilisateur ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    userMarkerRef.current?.remove()
    userMarkerRef.current = null

    if (!userPos) return

    const el = document.createElement('div')
    el.style.cssText = [
      'width:20px', 'height:20px', 'border-radius:50%',
      'background:#3B82F6', 'border:3px solid white',
      'box-shadow:0 2px 10px rgba(59,130,246,0.5)',
    ].join(';')

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userPos.lon, userPos.lat])
      .addTo(map)

    map.flyTo({ center: [userPos.lon, userPos.lat], zoom: 12, duration: 1200 })
  }, [userPos])

  // ── Helpers ────────────────────────────────────────────────────────────

  function closePopup() {
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
    if (popupRootRef.current) {
      setTimeout(() => { popupRootRef.current?.unmount(); popupRootRef.current = null }, 50)
    }
  }

  function openPopup(map, attraction, lngLat) {
    closePopup()

    const el = document.createElement('div')
    el.setAttribute('tabindex', '-1')
    el.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup() })

    const root = createRoot(el)
    root.render(<SitePopupContent attraction={attraction} lang={lang} t={t} />)
    popupRootRef.current = root

    const popup = new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: '300px' })
      .setLngLat(lngLat)
      .setDOMContent(el)
      .addTo(map)

    popup.on('close', () => {
      if (popupRef.current === popup) popupRef.current = null
      setTimeout(() => { root.unmount(); if (popupRootRef.current === root) popupRootRef.current = null }, 50)
    })

    popupRef.current = popup
    setTimeout(() => el.focus(), 0)
  }

  // ── Rendu ──────────────────────────────────────────────────────────────

  if (mapError) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3" style={{ height: 400 }}>
        <p className="text-gray-500 text-sm text-center px-4">
          {lang === 'fr' ? 'La carte ne peut pas se charger.' : 'The map could not load.'}
        </p>
        <button
          onClick={() => setMapError(false)}
          className="text-sm text-quebec-blue underline hover:text-quebec-navy"
        >
          {lang === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    )
  }

  const withCoords = attractions.filter(a => a.localisation?.latitude != null)

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-card"
      style={{ height: 'min(680px, calc(100dvh - 200px))' }}
    >
      {/* Indicateur de chargement */}
      {!ready && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <p className="text-gray-400 text-sm animate-pulse">
            {lang === 'fr' ? 'Chargement de la carte…' : 'Loading map…'}
          </p>
        </div>
      )}

      {/* Overlay "aucun résultat" */}
      {ready && withCoords.length === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <p className="text-gray-600 font-medium text-center px-6">{t.list.no_results}</p>
        </div>
      )}

      {/* Conteneur MapLibre */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
