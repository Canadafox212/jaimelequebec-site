'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { routeCacheGet, routeCacheSet } from '@/lib/routeCache'

const LS_KEY = 'jmlq_roadtrip'

function loadTrip() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || { stops: [], legs: [], season: 'summer' }
  } catch {
    return { stops: [], legs: [], season: 'summer' }
  }
}

function saveTrip(trip) {
  localStorage.setItem(LS_KEY, JSON.stringify(trip))
  window.dispatchEvent(new Event('roadtrip-updated'))
}

export default function AddToRoadTripButton({ slug, title, lat, lng, image, lang, t }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const trip = loadTrip()
    setAdded(trip.stops.some((s) => s.slug === slug))
  }, [slug])

  async function handleClick() {
    if (added) {
      router.push(`/${lang}/planifier`)
      return
    }
    setLoading(true)
    const trip = loadTrip()
    const newStop = { slug, title, lat, lng, image: image || null }
    trip.stops.push(newStop)

    if (trip.stops.length >= 2) {
      const prev = trip.stops[trip.stops.length - 2]
      const cur = trip.stops[trip.stops.length - 1]
      try {
        const cached = routeCacheGet(prev.lat, prev.lng, cur.lat, cur.lng)
        const res = cached ? null : await fetch('/api/route-leg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromLat: prev.lat, fromLng: prev.lng, toLat: cur.lat, toLng: cur.lng }),
        })
        const data = cached ?? await res.json()
        if (!cached && data.distanceKm) routeCacheSet(prev.lat, prev.lng, cur.lat, cur.lng, data)
        trip.legs.push({
          id: `${prev.slug}__${cur.slug}__${Date.now()}`,
          fromSlug: prev.slug,
          toSlug: cur.slug,
          distanceKm: data.distanceKm ?? null,
          durationMin: data.durationMin ?? null,
          extra: [],
        })
      } catch {
        trip.legs.push({
          id: `${prev.slug}__${cur.slug}__${Date.now()}`,
          fromSlug: prev.slug,
          toSlug: cur.slug,
          distanceKm: null,
          durationMin: null,
          extra: [],
        })
      }
    }

    saveTrip(trip)
    setAdded(true)
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
        added
          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
          : loading
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-wait'
            : 'bg-white border-quebec-blue text-quebec-blue hover:bg-quebec-blue hover:text-white'
      }`}
    >
      {added ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t.added}
        </>
      ) : loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t.computing}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-9.293A1 1 0 014.382 9h15.236a1 1 0 01.851 1.707L15 20M9 20h6M9 20V12m6 8V12" />
          </svg>
          {t.add_stop}
        </>
      )}
    </button>
  )
}
