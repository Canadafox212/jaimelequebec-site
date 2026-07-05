'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import NearMeSortedList from './NearMeSortedList'

// MapSitesView chargé uniquement côté client et seulement quand la vue carte est activée
const MapSitesView = lazy(() => import('./MapSitesView'))

const LS_KEY_VIEW = 'jlq:sitesViewMode'
const LS_KEY_GEO  = 'jlq:sortByProximity'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = x => x * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

export default function SitesViewContainer({ attractions, lang, t, initialView }) {
  const router = useRouter()

  // ── État vue ──────────────────────────────────────────────────────────
  const [view, setView] = useState(initialView ?? 'list')

  // Lecture localStorage après hydratation (évite mismatch serveur/client)
  useEffect(() => {
    if (initialView) return // URL a la priorité
    const saved = localStorage.getItem(LS_KEY_VIEW)
    if (saved === 'map' || saved === 'list') setView(saved)
  }, [initialView])

  function changeView(v) {
    setView(v)
    localStorage.setItem(LS_KEY_VIEW, v)
    const params = new URLSearchParams(window.location.search)
    if (v === 'list') params.delete('view')
    else params.set('view', v)
    const qs = params.toString()
    router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false })
  }

  // ── État géolocalisation (Autour de moi) ──────────────────────────────
  const [sorted,    setSorted]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [distances, setDistances] = useState({})
  const [userPos,   setUserPos]   = useState(null) // { lat, lon }

  // Restaure la session précédente
  useEffect(() => {
    if (localStorage.getItem(LS_KEY_GEO) !== 'true') return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setSorted(true)
      },
      () => { localStorage.removeItem(LS_KEY_GEO) }
    )
  }, [])

  // Recalcule les distances quand les attractions ou la position changent
  useEffect(() => {
    if (!sorted || !userPos) return
    const dist = {}
    attractions.forEach(a => {
      if (a.localisation?.latitude != null && a.localisation?.longitude != null) {
        dist[a.id] = haversine(userPos.lat, userPos.lon, a.localisation.latitude, a.localisation.longitude)
      }
    })
    setDistances(dist)
  }, [attractions, userPos, sorted])

  function handleNearMe() {
    if (!navigator.geolocation) { setError(t.list.near_me_denied); return }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setSorted(true)
        setLoading(false)
        localStorage.setItem(LS_KEY_GEO, 'true')
      },
      () => {
        setError(t.list.near_me_denied)
        setLoading(false)
        localStorage.removeItem(LS_KEY_GEO)
      }
    )
  }

  function handleReset() {
    setSorted(false)
    setDistances({})
    setUserPos(null)
    setError(null)
    localStorage.removeItem(LS_KEY_GEO)
  }

  // ── Rendu ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Barre de contrôles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        {/* Toggle Liste / Carte */}
        <div
          className="flex items-center gap-1 bg-gray-100 rounded-full p-1"
          role="group"
          aria-label={lang === 'fr' ? "Mode d'affichage" : 'Display mode'}
        >
          <button
            onClick={() => changeView('list')}
            aria-pressed={view === 'list'}
            aria-label={lang === 'fr' ? 'Vue liste' : 'List view'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-quebec-blue focus:ring-offset-1 ${
              view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 {t.list.view_list}
          </button>
          <button
            onClick={() => changeView('map')}
            aria-pressed={view === 'map'}
            aria-label={lang === 'fr' ? 'Vue carte' : 'Map view'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-quebec-blue focus:ring-offset-1 ${
              view === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺️ {t.list.view_map}
          </button>
        </div>

        {/* Bouton Autour de moi */}
        {!sorted ? (
          <button
            onClick={handleNearMe}
            disabled={loading}
            aria-label={lang === 'fr'
              ? 'Trier les sites par proximité de ma position'
              : 'Sort sites by proximity to my location'}
            className="inline-flex items-center gap-2 bg-quebec-blue text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-quebec-navy transition-colors focus:outline-none focus:ring-2 focus:ring-quebec-blue focus:ring-offset-2 disabled:opacity-60"
          >
            🧭 {loading ? t.list.near_me_loading : t.list.near_me}
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 bg-quebec-blue text-white text-sm font-semibold px-4 py-2 rounded-full">
              🧭 {t.list.near_me}
            </span>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-800 underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
            >
              {t.list.near_me_reset}
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Vue active */}
      {view === 'list' ? (
        attractions.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">{t.list.no_results}</p>
        ) : (
          <NearMeSortedList
            attractions={attractions}
            lang={lang}
            t={t}
            sorted={sorted}
            distances={distances}
          />
        )
      ) : (
        <Suspense
          fallback={
            <div className="rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center" style={{ height: 400 }}>
              <p className="text-gray-400 text-sm animate-pulse">
                {lang === 'fr' ? 'Chargement de la carte…' : 'Loading map…'}
              </p>
            </div>
          }
        >
          <MapSitesView
            attractions={attractions}
            lang={lang}
            t={t}
            userPos={sorted ? userPos : null}
          />
        </Suspense>
      )}
    </>
  )
}
