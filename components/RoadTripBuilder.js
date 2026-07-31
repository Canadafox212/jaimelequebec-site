'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { routeCacheGet, routeCacheSet } from '@/lib/routeCache'
import { bookingSearchUrl } from '@/lib/affiliates'
import { CITIES_QC } from '@/lib/citiesQC'

const PlanifierMap = dynamic(() => import('./PlanifierMap'), { ssr: false })

const LS_KEY = 'jmlq_roadtrip'
const WINTER_COEFF = 1.35
const MAX_DRIVING_MIN = 360
const EV_DISTANCE_KM = 260

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

function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ' ')
}

function fmtTime(min) {
  if (min === null || min === undefined) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return `${h} h ${m.toString().padStart(2, '0')}`
}

// ─── Traversiers du Saint-Laurent ────────────────────────────────────────────

const FERRIES = [
  {
    id: 'matane-bce',
    name: 'Matane ↔ Baie-Comeau / Godbout',
    company: 'Traversiers du Québec',
    url: 'https://www.traversiers.com/fr/nos-traverses',
    south: 'Matane',          southLat: 48.8467, southLng: -67.5322,
    northSide: 'Baie-Comeau', northLat: 49.2169, northLng: -68.1506,
    crossingMin: 140,
    note: 'Réduit considérablement la distance depuis la Gaspésie. Réservation véhicule conseillée.',
  },
  {
    id: 'rdl-stsimeon',
    name: 'Rivière-du-Loup ↔ Saint-Siméon',
    company: 'Traversiers du Québec',
    url: 'https://www.traversiers.com/fr/nos-traverses',
    south: 'Rivière-du-Loup', southLat: 47.8269, southLng: -69.5345,
    northSide: 'Saint-Siméon', northLat: 47.8385, northLng: -69.8833,
    crossingMin: 65,
    note: 'La traversée la plus rapide du fleuve Saint-Laurent.',
  },
  {
    id: 'souris-capmaux',
    name: 'Souris (Î.-P.-É.) ↔ Cap-aux-Meules (Îles-de-la-Madeleine)',
    company: 'CTMA',
    url: 'https://www.traversierctma.ca/fr/',
    south: 'Souris, Î.-P.-É.',   southLat: 46.3527, southLng: -62.2558,
    northSide: 'Cap-aux-Meules', northLat: 47.3810, northLng: -61.8621,
    crossingMin: 300,
    mandatory: true,
    note: 'Seul accès aux Îles-de-la-Madeleine par bateau. Réservation à l\'avance obligatoire — saison d\'été très chargée.',
  },
  {
    id: 'tp-escoumins',
    name: 'Trois-Pistoles ↔ Les Escoumins',
    company: 'Compagnie de navigation des Basques',
    url: 'https://www.traversiertp.com',
    south: 'Trois-Pistoles', southLat: 48.1192, southLng: -69.1788,
    northSide: 'Les Escoumins', northLat: 48.3567, northLng: -69.5186,
    crossingMin: 75,
    note: 'Liaison saisonnière (mai–octobre). Réseau privé — réservation recommandée. Raccourci BSL ↔ Haute-Côte-Nord sans passer par Matane.',
  },
]

// ── Shore classification ──────────────────────────────────────────────────────
// Gaspésie / sud-est : rive sud est de Matane, connectée par route 132 sans traverser
const isGaspesie = (lat, lng) => lat > 47.5 && lng > -68.5
// Îles-de-la-Madeleine : archipel isolé dans le golfe, aucun accès routier
const isIlesMadeleine = (lat, lng) => lat > 47.0 && lat < 48.0 && lng > -62.5 && lng < -61.0

// Rive nord : Charlevoix + Côte-Nord (accessible uniquement par traversier depuis la rive sud est)
// La "ligne de rive sud" monte vers l'est : à lng=-70.5 lat~47.1, à lng=-69.5 lat~47.9
const isNorthShore = (lat, lng) => {
  // Côte-Nord (Baie-Comeau 49.22°N, Godbout 49.32°N, Sept-Îles 50.2°N)
  // Seuil 49.2 pour ne pas classer Matane (48.85°N) ou Ste-Anne-des-Monts (49.12°N) comme rive nord
  if (lat > 49.2 && lng > -72 && lng < -60) return true
  // Charlevoix + Tadoussac : au-dessus de la ligne de rive sud (avec marge 0.1°)
  if (lng > -71.5 && lng < -69.0) {
    const southBankLat = 47.1 + 0.85 * (lng + 70.5)
    return lat > southBankLat
  }
  return false
}

// Bas-Saint-Laurent rive sud (Rivière-du-Loup, Rimouski) : entre lng -70.5 et -68.5, pas rive nord
const isBSL = (lat, lng) =>
  lat > 47 && lat < 49 && lng > -70.5 && lng < -68.5 && !isNorthShore(lat, lng)

function getSuggestedFerries(fromLat, fromLng, toLat, toLng, distanceKm) {
  const ferries = []

  // Îles-de-la-Madeleine : traversier obligatoire (aucun accès routier), avant le garde de distance
  const fromIdlM = isIlesMadeleine(fromLat, fromLng)
  const toIdlM   = isIlesMadeleine(toLat, toLng)
  if (fromIdlM !== toIdlM) {
    ferries.push(FERRIES[2])
    return ferries
  }

  if (!distanceKm || distanceKm < 150) return ferries

  // Matane ↔ Baie-Comeau : utile uniquement Gaspésie ↔ vraie Côte-Nord (Baie-Comeau 49.22°N, Sept-Îles 50.2°N)
  // NE PAS déclencher pour Québec, Charlevoix, Saguenay — accessibles par route sans traversier
  const isCoteNord = (la, lo) => la > 49.0 && lo > -72 && lo < -60
  if ((isGaspesie(fromLat, fromLng) && isCoteNord(toLat, toLng)) ||
      (isCoteNord(fromLat, fromLng) && isGaspesie(toLat, toLng))) {
    ferries.push(FERRIES[0])
  }

  // Rivière-du-Loup ↔ Saint-Siméon : utile quand Bas-Saint-Laurent ↔ rive nord
  if ((isBSL(fromLat, fromLng) && isNorthShore(toLat, toLng)) ||
      (isNorthShore(fromLat, fromLng) && isBSL(toLat, toLng))) {
    ferries.push(FERRIES[1])
  }

  // Trois-Pistoles ↔ Les Escoumins : alternative privée BSL ↔ Haute-Côte-Nord (mai–oct)
  // Utile sur les mêmes tronçons que RDL-StSimeon — l'utilisateur choisit
  if ((isBSL(fromLat, fromLng) && isNorthShore(toLat, toLng)) ||
      (isNorthShore(fromLat, fromLng) && isBSL(toLat, toLng))) {
    ferries.push(FERRIES[3])
  }

  return ferries
}

// ─── Popular cities (instant, no API) ────────────────────────────────────────

const QUICK_CITIES = [
  // ── Montréal ──────────────────────────────────────────────────────
  { label: 'Montréal, Québec',                    lat: 45.5088, lng: -73.5878 },
  { label: 'Laval, Québec',                        lat: 45.5720, lng: -73.6920 },
  { label: 'Longueuil, Québec',                    lat: 45.5312, lng: -73.5181 },
  // ── Montérégie ────────────────────────────────────────────────────
  { label: 'Granby, Québec',                       lat: 45.3987, lng: -72.7244 },
  { label: 'Saint-Hyacinthe, Québec',              lat: 45.6167, lng: -72.9500 },
  { label: 'Saint-Jean-sur-Richelieu, Québec',     lat: 45.3167, lng: -73.2667 },
  { label: 'Sorel-Tracy, Québec',                  lat: 46.0414, lng: -73.1063 },
  // ── Laurentides ───────────────────────────────────────────────────
  { label: 'Mont-Tremblant, Québec',               lat: 46.1185, lng: -74.5963 },
  { label: 'Saint-Jérôme, Québec',                 lat: 45.7784, lng: -74.0007 },
  { label: 'Sainte-Agathe-des-Monts, Québec',      lat: 46.0531, lng: -74.2847 },
  { label: 'Saint-Sauveur, Québec',                lat: 45.9008, lng: -74.1697 },
  // ── Lanaudière ────────────────────────────────────────────────────
  { label: 'Joliette, Québec',                     lat: 46.0202, lng: -73.4466 },
  { label: 'Rawdon, Québec',                        lat: 46.0567, lng: -73.7179 },
  { label: 'Saint-Donat, Québec',                  lat: 46.3194, lng: -74.2186 },
  // ── Outaouais ─────────────────────────────────────────────────────
  { label: 'Gatineau, Québec',                     lat: 45.4765, lng: -75.7013 },
  { label: 'Maniwaki, Québec',                     lat: 46.3833, lng: -75.9667 },
  { label: 'Wakefield, Québec',                    lat: 45.6417, lng: -75.9167 },
  // ── Capitale-Nationale ────────────────────────────────────────────
  { label: 'Québec, Québec',                         lat: 46.8139, lng: -71.2082 },
  { label: 'Lévis, Québec',                         lat: 46.7129, lng: -71.1740 },
  { label: 'Saint-Raymond, Québec',                lat: 46.8861, lng: -71.8331 },
  // ── Charlevoix ────────────────────────────────────────────────────
  { label: 'Baie-Saint-Paul, Québec',              lat: 47.4439, lng: -70.4988 },
  { label: 'La Malbaie, Québec',                   lat: 47.6517, lng: -70.1523 },
  { label: 'Tadoussac, Québec',                    lat: 48.1432, lng: -69.7178 },
  // ── Chaudière-Appalaches ──────────────────────────────────────────
  { label: 'Saint-Georges, Québec',                lat: 46.1167, lng: -70.6667 },
  { label: 'Thetford Mines, Québec',               lat: 46.0994, lng: -71.2994 },
  { label: 'Montmagny, Québec',                    lat: 46.9814, lng: -70.5531 },
  // ── Mauricie ──────────────────────────────────────────────────────
  { label: 'Trois-Rivières, Québec',               lat: 46.3432, lng: -72.5418 },
  { label: 'Shawinigan, Québec',                   lat: 46.5631, lng: -72.7481 },
  { label: 'La Tuque, Québec',                     lat: 47.4333, lng: -72.7833 },
  // ── Centre-du-Québec ──────────────────────────────────────────────
  { label: 'Drummondville, Québec',                lat: 45.8836, lng: -72.4833 },
  { label: 'Victoriaville, Québec',                lat: 46.0560, lng: -71.9650 },
  { label: 'Nicolet, Québec',                      lat: 46.2275, lng: -72.6148 },
  // ── Estrie ────────────────────────────────────────────────────────
  { label: 'Sherbrooke, Québec',                   lat: 45.4042, lng: -71.8929 },
  { label: 'Magog, Québec',                         lat: 45.2667, lng: -72.1500 },
  { label: 'Lac-Mégantic, Québec',                 lat: 45.5775, lng: -70.8836 },
  // ── Saguenay–Lac-Saint-Jean ───────────────────────────────────────
  { label: 'Saguenay, Québec',                     lat: 48.4284, lng: -71.0688 },
  { label: 'Alma, Québec',                          lat: 48.5500, lng: -71.6500 },
  { label: 'Roberval, Québec',                      lat: 48.5219, lng: -72.2317 },
  { label: 'Saint-Félicien, Québec',               lat: 48.6500, lng: -72.4500 },
  // ── Bas-Saint-Laurent ─────────────────────────────────────────────
  { label: 'Rimouski, Québec',                     lat: 48.4486, lng: -68.5353 },
  { label: 'Rivière-du-Loup, Québec',              lat: 47.8269, lng: -69.5345 },
  { label: 'Amqui, Québec',                         lat: 48.4625, lng: -67.4361 },
  // ── Gaspésie ──────────────────────────────────────────────────────
  { label: 'Matane, Québec',                        lat: 48.8467, lng: -67.5322 },
  { label: 'Sainte-Anne-des-Monts, Québec',        lat: 49.1289, lng: -66.4959 },
  { label: 'Gaspé, Québec',                         lat: 48.8375, lng: -64.4793 },
  { label: 'Percé, Québec',                         lat: 48.5225, lng: -64.2145 },
  // ── Îles-de-la-Madeleine ──────────────────────────────────────────
  { label: 'Cap-aux-Meules, Îles-de-la-Madeleine', lat: 47.3810, lng: -61.8621 },
  { label: 'Havre-Aubert, Îles-de-la-Madeleine',   lat: 47.2233, lng: -61.8364 },
  { label: 'Grande-Entrée, Îles-de-la-Madeleine',  lat: 47.5483, lng: -61.5617 },
  // ── Côte-Nord ─────────────────────────────────────────────────────
  { label: 'Baie-Comeau, Québec',                  lat: 49.2169, lng: -68.1506 },
  { label: 'Sept-Îles, Québec',                    lat: 50.2101, lng: -66.3735 },
  { label: 'Havre-Saint-Pierre, Québec',           lat: 50.2406, lng: -63.6036 },
  // ── Abitibi-Témiscamingue ──────────────────────────────────────────
  { label: 'Rouyn-Noranda, Québec',                lat: 48.2369, lng: -79.0267 },
  { label: "Val-d'Or, Québec",                     lat: 48.1009, lng: -77.7971 },
  { label: 'Amos, Québec',                          lat: 48.5678, lng: -78.1085 },
  { label: 'Ville-Marie, Québec',                  lat: 47.3337, lng: -79.4312 },
  // ── Nord-du-Québec ────────────────────────────────────────────────
  { label: 'Chibougamau, Québec',                  lat: 49.9167, lng: -74.3667 },
  { label: 'Matagami, Québec',                      lat: 49.7500, lng: -77.6333 },
  // ── Reste du Canada ───────────────────────────────────────────────
  { label: 'Ottawa, Ontario',                      lat: 45.4215, lng: -75.6972 },
  { label: 'Toronto, Ontario',                     lat: 43.6532, lng: -79.3832 },
  // ── France ────────────────────────────────────────────────────────
  { label: 'Paris, France',                        lat: 48.8566, lng:   2.3522 },
  { label: 'Lyon, France',                         lat: 45.7640, lng:   4.8357 },
  { label: 'Marseille, France',                    lat: 43.2965, lng:   5.3698 },
  { label: 'Bordeaux, France',                     lat: 44.8378, lng:  -0.5792 },
  { label: 'Toulouse, France',                     lat: 43.6047, lng:   1.4442 },
  { label: 'Nantes, France',                       lat: 47.2184, lng:  -1.5536 },
  { label: 'Lille, France',                        lat: 50.6292, lng:   3.0573 },
  { label: 'Strasbourg, France',                   lat: 48.5734, lng:   7.7521 },
  { label: 'Rennes, France',                       lat: 48.1173, lng:  -1.6778 },
  { label: 'Montpellier, France',                  lat: 43.6108, lng:   3.8767 },
  { label: 'Nice, France',                         lat: 43.7102, lng:   7.2620 },
  { label: 'Grenoble, France',                     lat: 45.1885, lng:   5.7245 },
  { label: 'Rouen, France',                        lat: 49.4432, lng:   1.0993 },
  // ── Belgique / Suisse / Luxembourg ───────────────────────────────
  { label: 'Bruxelles, Belgique',                  lat: 50.8503, lng:   4.3517 },
  { label: 'Liège, Belgique',                      lat: 50.6292, lng:   5.5797 },
  { label: 'Genève, Suisse',                       lat: 46.2044, lng:   6.1432 },
  { label: 'Lausanne, Suisse',                     lat: 46.5196, lng:   6.6323 },
  { label: 'Zurich, Suisse',                       lat: 47.3769, lng:   8.5417 },
  { label: 'Berne, Suisse',                        lat: 46.9481, lng:   7.4474 },
  { label: 'Luxembourg, Luxembourg',               lat: 49.6117, lng:   6.1319 },
]

// ─── Departure input ──────────────────────────────────────────────────────────

function DepartureInput({ value, onSelect, t }) {
  const [query, setQuery]     = useState(value?.label ?? '')
  const [orsResults, setOrs]  = useState([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const debounce = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => { setQuery(value?.label?.split(',')[0] ?? '') }, [value])

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const q = norm(query.trim())
  const quickMatches = q.length < 2 ? [] : QUICK_CITIES.filter(c => norm(c.label.split(',')[0]).includes(q)).slice(0, 4)
  const cityMatches  = q.length < 2 ? [] : CITIES_QC
    .filter(c => norm(c).includes(q) && !quickMatches.some(qc => norm(qc.label).startsWith(norm(c) + ',')))
    .slice(0, 5)
    .map(c => ({ label: `${c}, Québec`, _name: c }))
  const allResults = [
    ...quickMatches,
    ...cityMatches,
    ...orsResults.filter(r =>
      !quickMatches.some(qc => norm(qc.label) === norm(r.label)) &&
      !cityMatches.some(cm => norm(cm.label) === norm(r.label))
    ),
  ].slice(0, 8)

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    setOrs([])
    clearTimeout(debounce.current)
    if (val.trim().length < 3) return
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(val.trim())}`)
        const data = await res.json()
        setOrs(data.results ?? [])
      } catch { setOrs([]) }
      setLoading(false)
    }, 800)
  }

  async function selectQcCity(cityName) {
    setQuery(cityName)
    setOpen(false)
    setOrs([])
    setLoading(true)
    try {
      const res  = await fetch(`/api/geocode?q=${encodeURIComponent(cityName + ', Québec, Canada')}`)
      const data = await res.json()
      const first = data.results?.[0]
      if (first) onSelect({ ...first, label: cityName })
    } catch {}
    setLoading(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {t.departure_label}
      </label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={t.departure_placeholder}
        autoComplete="off"
        className="w-full border-2 border-quebec-blue rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue/30"
      />
      {loading && (
        <div className="absolute right-3 top-9">
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
      {open && allResults.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[1100] overflow-hidden">
          {allResults.map((r, i) => (
            <button
              key={i}
              onMouseDown={() => {
                if (r._name) {
                  selectQcCity(r._name)
                } else {
                  onSelect(r); setQuery(r.label.split(',')[0]); setOpen(false); setOrs([])
                }
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <span className="text-gray-400">{r._name ? '🏘️' : '📍'}</span>
              <span>{r._name ? r._name : r.label.split(',')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── StopCard ─────────────────────────────────────────────────────────────────

function StopCard({ stop, index, lang, onRemove, removeLabel, onMoveUp, onMoveDown, canMoveUp, canMoveDown, onSetNights }) {
  const isDep  = stop.isCustomDeparture
  const nights = stop.nights ?? (stop.overnight ? 1 : 0)
  const isOvn  = nights > 0
  const isPort = !!stop.isPort
  const isCity = !!stop.isCity
  const ferry  = isPort ? FERRIES.find(f => f.id === stop.ferryId) : null

  return (
    <div className={`flex items-center gap-2 rounded-xl border shadow-sm p-3 ${isDep ? 'bg-blue-50 border-blue-200' : isPort ? 'bg-cyan-50 border-cyan-200' : isOvn ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>

      {/* ↑↓ buttons */}
      {!isDep && (
        <div className="flex flex-col shrink-0">
          <button onClick={onMoveUp} disabled={!canMoveUp} title="Monter"
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors leading-none py-0.5 px-1">▲</button>
          <button onClick={onMoveDown} disabled={!canMoveDown} title="Descendre"
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors leading-none py-0.5 px-1">▼</button>
        </div>
      )}

      {/* Badge */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-base ${isDep ? 'bg-blue-100 text-blue-600' : isPort ? 'bg-cyan-500 text-white' : isOvn ? 'bg-purple-500 text-white' : 'bg-quebec-blue text-white'}`}>
        {isDep ? '🏁' : isPort ? '🚢' : isOvn ? '🌙' : index}
      </div>

      {/* Image */}
      {!isDep && !isPort && stop.image && (
        <Image src={stop.image} alt={stop.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-quebec-navy text-sm truncate">{stop.title}</p>
        {isDep  && <p className="text-xs text-blue-500">{stop.subtitle ?? ''}</p>}
        {isPort && ferry && <p className="text-xs text-cyan-700">Traversée vers {ferry.northSide} : {fmtTime(ferry.crossingMin)}</p>}
        {!isDep && !isPort && !isCity && (
          <Link href={`/${lang}/sites/${stop.pageSlug || stop.slug}`} className="text-xs text-gray-400 hover:text-quebec-blue transition-colors">Voir la fiche →</Link>
        )}
        {isCity && <p className="text-xs text-gray-400">📍 Étape ville</p>}
        {isOvn && <p className="text-xs text-purple-600 font-medium mt-0.5">{nights === 1 ? 'Étape nuit' : `${nights} nuits`}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center shrink-0 gap-0.5">
        {!isDep && !isPort && (
          <div className="flex items-center gap-0.5">
            {isOvn && (
              <button onClick={() => onSetNights(nights - 1)} title="Retirer une nuit"
                className="w-5 h-7 flex items-center justify-center text-xs font-bold text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors">−</button>
            )}
            <div className="relative group">
              <button onClick={() => onSetNights(Math.min(14, nights + 1))}
                className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-sm transition-colors ${isOvn ? 'text-purple-500 bg-purple-100 hover:bg-purple-200' : 'text-gray-300 hover:text-purple-400 hover:bg-purple-50'}`}>
                <span>🌙</span>
                {nights > 1 && <span className="text-xs font-bold leading-none">{nights}</span>}
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block z-20 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                  {isOvn ? 'Cliquer pour ajouter une nuit de plus' : 'Cliquer pour dormir ici'}
                  <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
          </div>
        )}
        <button onClick={onRemove} title={removeLabel} className="text-gray-300 hover:text-red-400 transition-colors p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── LegConnector ─────────────────────────────────────────────────────────────

function LegConnector({ leg, legIndex, legBase, legTotal, cumulKm, stopTypes, openExtraMenu, setOpenExtraMenu, onAddExtra, onRemoveExtra, onAddFerryPort, t }) {
  const menuRef = useRef(null)
  const [ferryOpen, setFerryOpen] = useState(false)
  const showEVTip = leg.distanceKm && leg.distanceKm > EV_DISTANCE_KM
  const suggestedFerries = (leg.fromLat != null)
    ? getSuggestedFerries(leg.fromLat, leg.fromLng, leg.toLat, leg.toLng, leg.distanceKm)
    : []

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (openExtraMenu === legIndex) setOpenExtraMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [legIndex, openExtraMenu, setOpenExtraMenu])

  return (
    <div className="ml-3 my-1 border-l-2 border-dashed border-gray-300 pl-6 py-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-9.293A1 1 0 014.382 9h15.236a1 1 0 01.851 1.707L15 20M9 20h6M9 20V12m6 8V12" />
        </svg>
        {leg.distanceKm ? (
          <span className="text-sm font-medium text-gray-700">
            {leg.distanceKm} km · {fmtTime(legBase)}
            {cumulKm != null && cumulKm > (leg.distanceKm || 0) && (
              <span className="text-xs text-gray-400 font-normal ml-2">· total {cumulKm} km</span>
            )}
          </span>
        ) : (
          <span className="text-sm text-gray-400 animate-pulse">{t.computing}</span>
        )}
        {leg.extra.map(e => (
          <span key={e.id} className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
            {e.label}{e.minutes > 0 && <span>+{e.minutes} min</span>}
            <button onClick={() => onRemoveExtra(legIndex, e.id)} className="hover:text-red-500 ml-0.5">×</button>
          </span>
        ))}
        {leg.extra.length > 0 && leg.durationMin && (
          <span className="text-xs font-semibold text-quebec-blue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            {t.subtotal}: {fmtTime(legTotal)}
          </span>
        )}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpenExtraMenu(openExtraMenu === legIndex ? null : legIndex)}
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5 hover:border-gray-400 hover:text-gray-700 transition-colors">
            {t.add_break}
          </button>
          {openExtraMenu === legIndex && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[200px]">
              {stopTypes.map(st => (
                <button key={st.key} onMouseDown={() => onAddExtra(legIndex, st)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex justify-between items-center gap-3">
                  <span>{st.label}</span>
                  {st.minutes > 0 && <span className="text-gray-400 text-xs">+{st.minutes} min</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEVTip && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">{t.ev_tip}</p>
      )}

      {/* Ferry alternatives */}
      {suggestedFerries.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg overflow-hidden">
          <button onClick={() => setFerryOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-cyan-800 font-medium hover:bg-cyan-100 transition-colors">
            <span>🚢 {suggestedFerries.some(f => f.mandatory) ? 'Traversier obligatoire sur ce tronçon' : 'Traversier disponible sur ce tronçon'}</span>
            <span className="text-cyan-400 text-xs">{ferryOpen ? '▲' : '▼'}</span>
          </button>
          {ferryOpen && (
            <div className="px-3 pb-3 space-y-3 border-t border-cyan-200 pt-2">
              {suggestedFerries.map(f => (
                <div key={f.id} className="text-xs text-cyan-900 space-y-1">
                  <p className="font-semibold">{f.name}</p>
                  <p>Traversée : <strong>{fmtTime(f.crossingMin)}</strong> · {f.company}</p>
                  <p className="text-cyan-700 leading-relaxed">{f.note}</p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <a href={f.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-white border border-cyan-300 text-cyan-700 px-3 py-1 rounded-full hover:bg-cyan-100 transition-colors">
                      Horaires & réservations ↗
                    </a>
                    <button onClick={() => { onAddFerryPort(f, leg.fromSlug, leg.toSlug); setFerryOpen(false) }}
                      className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-full hover:bg-cyan-700 transition-colors">
                      + Ajouter le port comme étape
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── OvernightPanel ───────────────────────────────────────────────────────────

function OvernightPanel({ stop, attractions }) {
  const slug = stop.pageSlug || stop.slug
  const attr = attractions.find(a => a.slug === slug)
  const h = attr?.hebergement
  const ville = (attr?.ville || attr?.region || stop.title || '').split(',')[0].trim()

  const bookingUrl = bookingSearchUrl(ville, 'fr')

  const tiers = [
    { key: 'economique',  label: '$',   color: 'text-green-700',  items: h?.economique  ?? [] },
    { key: 'confort',     label: '$$',  color: 'text-amber-700',  items: h?.confort     ?? [] },
    { key: 'haut_gamme',  label: '$$$', color: 'text-purple-700', items: h?.haut_gamme  ?? [] },
  ].filter(t => t.items.length > 0)

  return (
    <div className="ml-6 -mt-0.5 mb-1 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-purple-800">🏨 Hébergements à proximité</p>
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full hover:bg-blue-700 transition-colors shrink-0">
          Voir les disponibilités →
        </a>
      </div>
      {tiers.length > 0 ? (
        <div className="space-y-1.5">
          {tiers.flatMap(tier => tier.items.map((item, i) => (
            <div key={tier.key + i} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-1.5">
                <span className={`text-xs font-bold shrink-0 ${tier.color}`}>{tier.label}</span>
                <span className="text-xs text-gray-800 truncate">{item.nom}</span>
                <span className="text-xs text-gray-400 shrink-0">· {item.dist_km} km</span>
              </div>
              {item.web && (
                <a href={item.web} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline shrink-0">↗</a>
              )}
            </div>
          )))}
        </div>
      ) : (
        <p className="text-xs text-purple-600 italic">Rechercher des hébergements pour cette étape.</p>
      )}
    </div>
  )
}

// ─── AttractionDropdown ───────────────────────────────────────────────────────

function AttractionDropdown({ cities, filtered, onSelectCity, onSelect, lang }) {
  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[1100] overflow-hidden max-h-72 overflow-y-auto">
      {cities.length > 0 && (
        <>
          <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">Villes</div>
          {cities.map((c, i) => (
            <button key={i} onMouseDown={() => onSelectCity(c)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-3">
              <span className="text-gray-400 shrink-0">📍</span>
              <span className="text-gray-800">{c.label.split(',')[0]}</span>
            </button>
          ))}
        </>
      )}
      {filtered.length > 0 && (
        <>
          {cities.length > 0 && <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">Sites touristiques</div>}
          {filtered.map((a) => {
            const title = lang === 'fr' ? a.titleFr : (a.titleEn || a.titleFr)
            return (
              <button key={a.slug} onMouseDown={() => onSelect(a)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-3">
                {a.image && <Image src={a.image} alt={title} width={32} height={32} className="w-8 h-8 rounded-md object-cover shrink-0" />}
                <div className="min-w-0">
                  <span className="text-gray-800 block truncate">{title}</span>
                  <span className="text-xs text-gray-400">{a.region}</span>
                </div>
              </button>
            )
          })}
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
// Estimation routière instantanée (~40% de plus que la ligne droite, ~85 km/h moy.)
function quickEstimate(fromStop, toStop) {
  const km = Math.round(haversineKm(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng) * 1.4)
  return { distanceKm: km, durationMin: Math.round(km / 85 * 60), geometry: null, estimated: true }
}

export default function RoadTripBuilder({ lang, t, attractions }) {
  const [stops, setStops]         = useState([])
  const [legs, setLegs]           = useState([])
  const [season, setSeason]       = useState('summer')
  const [computing, setComputing] = useState(false)
  const [query, setQuery]         = useState('')
  const [dropdownOpen, setDropdown] = useState(false)
  const [openExtraMenu, setExtra] = useState(null)
  const [departure, setDeparture] = useState(null)
  const [showMap, setShowMap]     = useState(true)
  const [copied, setCopied]       = useState(false)
  const loadedRef      = useRef(false)
  const autoComputeRef = useRef(false)
  const dropRef        = useRef(null)

  // ── Load — URL ?trip= prioritaire sur localStorage ──────────────────────────
  useEffect(() => {
    let trip = null
    try {
      const param = new URLSearchParams(window.location.search).get('trip')
      if (param) {
        const data = JSON.parse(decodeURIComponent(escape(atob(param))))
        trip = {
          departure: data.d ? { label: data.d.l, lat: data.d.la, lng: data.d.ln } : null,
          stops: (data.s || []).map(s => ({
            slug: s.sl, title: s.t, lat: s.la, lng: s.ln,
            nights: typeof s.on === 'number' ? s.on : (s.on ? 1 : 0), extra: s.ex || [],
          })),
          legs: [],
          season: data.se || 'summer',
        }
      }
    } catch {}
    if (!trip) trip = loadTrip()
    setStops(trip.stops || [])
    setLegs(trip.legs || [])
    setSeason(trip.season || 'summer')
    setDeparture(trip.departure || null)
    loadedRef.current = true
  }, [])

  // ── Save ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loadedRef.current) return
    saveTrip({ stops, legs, season, departure })
  }, [stops, legs, season, departure])

  // ── Close attraction dropdown on outside click ──────────────────────────────
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Auto-recompute missing legs (parallel, with cache) ──────────────────────
  useEffect(() => {
    if (!loadedRef.current || autoComputeRef.current) return
    const dStops = [
      ...(departure ? [{ slug: '__departure__', lat: departure.lat, lng: departure.lng }] : []),
      ...stops,
    ]
    if (dStops.length < 2) return
    autoComputeRef.current = true

    const missing = []
    for (let i = 0; i < dStops.length - 1; i++) {
      const from = dStops[i], to = dStops[i + 1]
      // Relancer si absent OU si estimé sans géométrie (rechargement de page)
      // Ne pas relancer les legs null intentionnels (traversier, îles) : estimated === undefined
      const legOk = legs.some(l => l.fromSlug === from.slug && l.toSlug === to.slug && (!l.estimated || l.geometry))
      if (!legOk) missing.push({ from, to })
    }
    if (missing.length === 0) { autoComputeRef.current = false; return }

    setComputing(true)
    let done = 0
    missing.forEach(({ from, to }) => {
      computeRoute(from, to).then(route => {
        done++
        // Toujours stocker le leg (même distanceKm null) pour éviter les retentes infinies
        setLegs(prev => {
          const next = prev.filter(l => !(l.fromSlug === from.slug && l.toSlug === to.slug))
          return [...next, mkLeg(from, to, route)]
        })
        if (done === missing.length) {
          setComputing(false)
          autoComputeRef.current = false
        }
      })
    })
  }, [departure, stops, legs])

  function mkLeg(from, to, route) {
    return {
      id: `${from.slug}__${to.slug}__${Date.now()}`,
      fromSlug: from.slug, toSlug: to.slug,
      fromLat: from.lat, fromLng: from.lng,
      toLat: to.lat, toLng: to.lng,
      ...route,
      extra: [],
    }
  }

  const STOP_TYPES = [
    { key: 'meal',      label: t.stop_meal,      minutes: t.stop_meal_min },
    { key: 'coffee',    label: t.stop_coffee,    minutes: t.stop_coffee_min },
    { key: 'kids',      label: t.stop_kids,      minutes: t.stop_kids_min },
    { key: 'gas',       label: t.stop_gas,       minutes: t.stop_gas_min },
    { key: 'overnight', label: t.stop_overnight, minutes: t.stop_overnight_min },
    { key: 'ev',        label: t.stop_ev,        minutes: t.stop_ev_min },
  ]

  // City search in stop dropdown — match only on city name (before the comma, not province)
  const cityFiltered = query.trim().length < 2 ? [] :
    QUICK_CITIES.filter(c => norm(c.label.split(',')[0]).includes(norm(query.trim()))).slice(0, 5)

  // Accent-insensitive attraction search (min 3 chars)
  const filtered = query.trim().length < 3 ? [] : attractions.filter(a => {
    const title = lang === 'fr' ? a.titleFr : (a.titleEn || a.titleFr)
    return norm(title).includes(norm(query))
  }).slice(0, 6)

  // ── Route API with cache + geometry ─────────────────────────────────────────
  async function computeRoute(fromStop, toStop) {
    // Îles-de-la-Madeleine : aucune route terrestre possible, ne pas appeler ORS
    if (isIlesMadeleine(fromStop.lat, fromStop.lng) || isIlesMadeleine(toStop.lat, toStop.lng)) {
      return { distanceKm: null, durationMin: null, geometry: null }
    }
    const cached = routeCacheGet(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng)
    if (cached) return cached
    try {
      const res = await fetch('/api/route-leg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromLat: fromStop.lat, fromLng: fromStop.lng, toLat: toStop.lat, toLng: toStop.lng }),
      })
      const data = await res.json()
      const route = { distanceKm: data.distanceKm ?? null, durationMin: data.durationMin ?? null, geometry: data.geometry ?? null }
      if (route.distanceKm) routeCacheSet(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng, route)
      return route
    } catch {
      return { distanceKm: null, durationMin: null, geometry: null }
    }
  }

  // ── Departure ───────────────────────────────────────────────────────────────
  async function handleDepartureSelect(city) {
    setDeparture(city)
    if (stops.length === 0) return
    const depStop = { slug: '__departure__', lat: city.lat, lng: city.lng }
    const currentStops = stops
    const firstIsIdlM = isIlesMadeleine(currentStops[0].lat, currentStops[0].lng)
    const sourisPresent = currentStops.some(s => s.ferryId === 'souris-capmaux')
    if (firstIsIdlM && !sourisPresent) {
      // Auto-insérer Souris entre le départ et les Îles
      const f = FERRIES[2]
      const portStop = { slug: '__port__souris-capmaux', title: 'Port de Souris, Î.-P.-É.', lat: f.southLat, lng: f.southLng, isPort: true, ferryId: f.id, ferryCrossingMin: f.crossingMin }
      const idlMStop = currentStops[0]
      setStops(prev => { const idx = prev.findIndex(s => isIlesMadeleine(s.lat, s.lng)); const next = [...prev]; if (idx !== -1) next.splice(idx, 0, portStop); return next })
      setLegs(prev => [mkLeg(depStop, portStop, quickEstimate(depStop, portStop)), mkLeg(portStop, idlMStop, { distanceKm: null, durationMin: null, geometry: null }), ...prev.filter(l => l.fromSlug !== '__departure__')])
      const route = await computeRoute(depStop, portStop)
      if (route.distanceKm) {
        setLegs(prev => { const next = prev.filter(l => !(l.fromSlug === depStop.slug && l.toSlug === portStop.slug && l.estimated)); return [mkLeg(depStop, portStop, route), ...next] })
      }
    } else {
      const firstStop = currentStops[0]
      const noRoad = isIlesMadeleine(firstStop.lat, firstStop.lng)
      setLegs(prev => [mkLeg(depStop, firstStop, noRoad ? { distanceKm: null, durationMin: null, geometry: null } : quickEstimate(depStop, firstStop)), ...prev.filter(l => l.fromSlug !== '__departure__')])
      if (!noRoad) {
        const route = await computeRoute(depStop, firstStop)
        if (route.distanceKm) setLegs(prev => [mkLeg(depStop, firstStop, route), ...prev.filter(l => l.fromSlug !== '__departure__')])
      }
    }
  }

  function removeDeparture() {
    setDeparture(null)
    setLegs(prev => prev.filter(l => l.fromSlug !== '__departure__'))
  }

  // ── Add stop ────────────────────────────────────────────────────────────────
  async function addStop(attraction) {
    setQuery('')
    setDropdown(false)
    const isDuplicate = stops.some(s => (s.pageSlug || s.slug) === attraction.slug)
    const newStop = {
      slug:     isDuplicate ? `${attraction.slug}__${Date.now()}` : attraction.slug,
      pageSlug: attraction.slug,
      title: lang === 'fr' ? attraction.titleFr : (attraction.titleEn || attraction.titleFr),
      lat:   attraction.lat,
      lng:   attraction.lng,
      image: attraction.image || null,
    }
    addStopImpl(newStop)
  }

  // ── Shared stop-add logic (attraction + city) ───────────────────────────────
  function addStopImpl(newStop) {
    const currentStops = stops
    const fromPoint = currentStops.length > 0 ? currentStops[currentStops.length - 1] : (departure ?? null)
    if (!fromPoint) { setStops(prev => [...prev, newStop]); return }
    const fromStop = currentStops.length > 0 ? fromPoint : { slug: '__departure__', lat: fromPoint.lat, lng: fromPoint.lng }
    const isNewIdlM  = isIlesMadeleine(newStop.lat, newStop.lng)
    const isFromIdlM = isIlesMadeleine(fromStop.lat, fromStop.lng)
    const sourisPresent = currentStops.some(s => s.ferryId === 'souris-capmaux') || fromStop.ferryId === 'souris-capmaux'
    if (isNewIdlM && !isFromIdlM && !sourisPresent) {
      // Auto-insérer Souris comme port intermédiaire obligatoire
      const f = FERRIES[2]
      const portStop = { slug: '__port__souris-capmaux', title: 'Port de Souris, Î.-P.-É.', lat: f.southLat, lng: f.southLng, isPort: true, ferryId: f.id, ferryCrossingMin: f.crossingMin }
      setLegs(ll => [...ll, mkLeg(fromStop, portStop, quickEstimate(fromStop, portStop)), mkLeg(portStop, newStop, { distanceKm: null, durationMin: null, geometry: null })])
      computeRoute(fromStop, portStop).then(route => {
        if (route.distanceKm) setLegs(ll => { const next = ll.filter(l => !(l.fromSlug === fromStop.slug && l.toSlug === portStop.slug && l.estimated)); return [...next, mkLeg(fromStop, portStop, route)] })
      })
      setStops(prev => [...prev, portStop, newStop])
    } else {
      const noRoad = isFromIdlM || isNewIdlM
      setLegs(ll => [...ll, mkLeg(fromStop, newStop, noRoad ? { distanceKm: null, durationMin: null, geometry: null } : quickEstimate(fromStop, newStop))])
      if (!noRoad) computeRoute(fromStop, newStop).then(route => {
        if (route.distanceKm) setLegs(ll => { const next = ll.filter(l => !(l.fromSlug === fromStop.slug && l.toSlug === newStop.slug && l.estimated)); return [...next, mkLeg(fromStop, newStop, route)] })
      })
      setStops(prev => [...prev, newStop])
    }
  }

  // ── Add city as intermediate stop ──────────────────────────────────────────
  function addCityStop(city) {
    setQuery('')
    setDropdown(false)
    addStopImpl({
      slug:   `__city__${Date.now()}`,
      title:  city.label.split(',')[0],
      lat:    city.lat,
      lng:    city.lng,
      isCity: true,
    })
  }

  // ── Move stop (reorder) ─────────────────────────────────────────────────────
  function moveStop(slug, dir) {
    setStops(prev => {
      const idx = prev.findIndex(s => s.slug === slug)
      if (idx === -1) return prev
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const ti = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[ti]] = [next[ti], next[idx]]
      return next
    })
    // Vider tous les legs — l'auto-recompute les recalcule (depuis le cache = rapide)
    setLegs([])
    autoComputeRef.current = false
  }

  // ── Remove stop ─────────────────────────────────────────────────────────────
  function removeStop(slug) {
    setStops(prevStops => {
      const idx = prevStops.findIndex(s => s.slug === slug)
      if (idx === -1) return prevStops
      const newStops = prevStops.filter(s => s.slug !== slug)
      setLegs(prevLegs => {
        const newLegs = prevLegs.filter(l => l.fromSlug !== slug && l.toSlug !== slug)
        const fromStop = idx > 0 ? prevStops[idx - 1] : departure
        const toStop   = idx < prevStops.length - 1 ? prevStops[idx + 1] : null
        const fromSlug = idx > 0 ? prevStops[idx - 1].slug : '__departure__'
        const fromSt = idx > 0
          ? fromStop
          : { slug: '__departure__', lat: departure?.lat, lng: departure?.lng }
        if (fromSt && toStop && fromSt.lat) {
          const noRoad = isIlesMadeleine(fromSt.lat, fromSt.lng) || isIlesMadeleine(toStop.lat, toStop.lng)
          setLegs(ll => [...ll.filter(l => l.toSlug !== toStop.slug), mkLeg(fromSt, toStop, noRoad ? { distanceKm: null, durationMin: null, geometry: null } : quickEstimate(fromSt, toStop))])
          if (!noRoad) {
            computeRoute(fromSt, toStop).then(route => {
              if (route.distanceKm) {
                setLegs(ll => {
                  const next = ll.filter(l => !(l.toSlug === toStop.slug && l.estimated))
                  return [...next, mkLeg(fromSt, toStop, route)]
                })
              }
            })
          }
        }
        return newLegs
      })
      return newStops
    })
  }

  // ── Nights counter ───────────────────────────────────────────────────────────
  function setNights(slug, n) {
    setStops(prev => prev.map(s => s.slug === slug ? { ...s, nights: Math.max(0, n) } : s))
  }

  // ── Add ferry port ────────────────────────────────────────────────────────────
  function addFerryPort(ferry, fromSlug, toSlug) {
    const allStops = [
      ...(departure ? [{ slug: '__departure__', lat: departure.lat, lng: departure.lng }] : []),
      ...stops,
    ]
    const fromStop = allStops.find(s => s.slug === fromSlug)
    if (!fromStop) return
    const dToSouth = Math.hypot(fromStop.lat - ferry.southLat, fromStop.lng - ferry.southLng)
    const dToNorth = Math.hypot(fromStop.lat - ferry.northLat, fromStop.lng - ferry.northLng)
    const useSouth = dToSouth <= dToNorth
    const portStop = {
      slug: `__port__${ferry.id}`,
      title: `Port de ${useSouth ? ferry.south : ferry.northSide}`,
      lat: useSouth ? ferry.southLat : ferry.northLat,
      lng: useSouth ? ferry.southLng : ferry.northLng,
      isPort: true, ferryId: ferry.id, ferryCrossingMin: ferry.crossingMin,
    }
    setStops(prev => {
      const toIdx = prev.findIndex(s => s.slug === toSlug)
      const next = [...prev]
      if (toIdx < 0) next.push(portStop); else next.splice(toIdx, 0, portStop)
      return next
    })
    setLegs([]); autoComputeRef.current = false
  }

  // ── Extra stops ─────────────────────────────────────────────────────────────
  function addExtraStop(legIndex, stopType) {
    setExtra(null)
    setLegs(prev => prev.map((l, i) => i === legIndex ? { ...l, extra: [...l.extra, { id: `${stopType.key}-${Date.now()}`, ...stopType }] } : l))
  }
  function removeExtraStop(legIndex, extraId) {
    setLegs(prev => prev.map((l, i) => i === legIndex ? { ...l, extra: l.extra.filter(e => e.id !== extraId) } : l))
  }

  function clearAll() {
    setStops([]); setLegs([]); setDeparture(null)
    autoComputeRef.current = false
    localStorage.removeItem(LS_KEY)
    window.dispatchEvent(new Event('roadtrip-updated'))
  }

  function retryMissingLegs() {
    autoComputeRef.current = false
    setLegs(prev => prev.filter(l => l.distanceKm))
  }

  // ── Calculations ────────────────────────────────────────────────────────────
  function legBaseMin(leg) {
    if (!leg.durationMin) return null
    return season === 'winter' ? Math.round(leg.durationMin * WINTER_COEFF) : leg.durationMin
  }
  function legTotalMin(leg) {
    return (legBaseMin(leg) ?? 0) + leg.extra.reduce((s, e) => s + (e.minutes || 0), 0)
  }

  const totalKm    = legs.reduce((s, l) => s + (l.distanceKm || 0), 0)
  const drivingMin = legs.reduce((s, l) => s + (legBaseMin(l) || 0), 0)
  const ferryMin   = stops.reduce((s, st) => s + (st.ferryCrossingMin || 0), 0)
  const totalMin   = legs.reduce((s, l) => s + legTotalMin(l), 0) + ferryMin

  const displayStops = [
    ...(departure ? [{ slug: '__departure__', title: departure.label.split(',')[0], isCustomDeparture: true, lat: departure.lat, lng: departure.lng }] : []),
    ...stops,
  ]

  function getLeg(fromSlug, toSlug) {
    return legs.find(l => l.fromSlug === fromSlug && l.toSlug === toSlug) ?? null
  }

  // Pre-compute cumulative km/time and missing-leg detection
  let _ck = 0, _cm = 0
  const legCumul = displayStops.slice(0, -1).map((stop, i) => {
    const leg = getLeg(stop.slug, displayStops[i + 1].slug)
    _ck += leg?.distanceKm || 0
    _cm += leg ? legTotalMin(leg) : 0
    return { cumulKm: Math.round(_ck * 10) / 10, cumulMin: _cm }
  })
  const hasMissingLegs = displayStops.length >= 2 &&
    displayStops.some((stop, i) => i < displayStops.length - 1 && !getLeg(stop.slug, displayStops[i + 1].slug))

  // ── Partage URL ─────────────────────────────────────────────────────────────
  function buildShareUrl() {
    const data = {
      d: departure ? { l: departure.label, la: departure.lat, ln: departure.lng } : null,
      s: stops.map(s => ({ sl: s.slug, t: s.title, la: s.lat, ln: s.lng, on: s.nights ?? (s.overnight ? 1 : 0), ex: s.extra || [] })),
      se: season,
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    return `${window.location.origin}/${lang}/planifier?trip=${encoded}`
  }

  function handleShare() {
    const url = buildShareUrl()
    if (navigator.share) {
      navigator.share({ title: t.page_title, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  function handlePrint() {
    window.print()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-quebec-navy">{t.page_title}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.page_sub}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            <button onClick={() => setSeason('summer')} className={`px-4 py-2 transition-colors ${season === 'summer' ? 'bg-amber-400 text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}>{t.summer}</button>
            <button onClick={() => setSeason('winter')} className={`px-4 py-2 transition-colors ${season === 'winter' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>{t.winter}</button>
          </div>
          {hasMissingLegs && !computing && (
            <button onClick={retryMissingLegs} className="text-sm text-amber-700 bg-amber-50 border border-amber-300 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors">↻ Recalculer</button>
          )}
          {(stops.length > 0 || departure) && (<>
            {/* Partager */}
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-quebec-blue border border-quebec-blue/30 px-3 py-2 rounded-lg hover:bg-quebec-blue/5 transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? (t.share_copied ?? '✓ Lien copié !') : (t.share ?? 'Partager')}
            </button>
            {/* Imprimer */}
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t.print ?? 'Imprimer'}
            </button>
            {/* Vider */}
            <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">{t.clear_all}</button>
          </>)}
        </div>
      </div>

      <div className="relative z-[10] flex flex-col lg:flex-row gap-6">

        {/* Left */}
        <div className="flex-1 min-w-0 space-y-4">

          <DepartureInput value={departure} onSelect={handleDepartureSelect} t={t} />

          {stops.length === 0 && !departure && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{t.empty_title}</h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">{t.empty_sub}</p>
            </div>
          )}

          {displayStops.length > 0 && (
            <div className="space-y-0">
              {displayStops.map((stop, i) => {
                const stopIdx = stop.isCustomDeparture ? -1 : stops.findIndex(s => s.slug === stop.slug)
                return (
                  <div key={stop.slug}>
                    <StopCard
                      stop={stop}
                      index={stop.isCustomDeparture ? 0 : stopIdx + 1}
                      lang={lang}
                      onRemove={() => stop.isCustomDeparture ? removeDeparture() : removeStop(stop.slug)}
                      removeLabel={t.remove_stop}
                      onMoveUp={() => moveStop(stop.slug, 'up')}
                      onMoveDown={() => moveStop(stop.slug, 'down')}
                      canMoveUp={!stop.isCustomDeparture && stopIdx > 0}
                      canMoveDown={!stop.isCustomDeparture && stopIdx < stops.length - 1}
                      onSetNights={(n) => setNights(stop.slug, n)}
                    />
                    {(stop.nights ?? (stop.overnight ? 1 : 0)) > 0 && !stop.isCustomDeparture && !stop.isPort && (
                      <OvernightPanel stop={stop} attractions={attractions} />
                    )}
                    {i < displayStops.length - 1 && (() => {
                      const nextStop = displayStops[i + 1]
                      const leg = getLeg(stop.slug, nextStop.slug)
                      return leg ? (
                        <LegConnector
                          leg={leg}
                          legIndex={legs.indexOf(leg)}
                          legBase={legBaseMin(leg)}
                          legTotal={legTotalMin(leg)}
                          cumulKm={legCumul[i]?.cumulKm}
                          stopTypes={STOP_TYPES}
                          openExtraMenu={openExtraMenu}
                          setOpenExtraMenu={setExtra}
                          onAddExtra={addExtraStop}
                          onRemoveExtra={removeExtraStop}
                          onAddFerryPort={addFerryPort}
                          t={t}
                        />
                      ) : (
                        <div className="ml-3 my-1 border-l-2 border-dashed border-gray-300 pl-6 py-3">
                          <span className="text-sm text-gray-400 animate-pulse">{t.computing}</span>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          )}

          {/* Add stop search */}
          <div ref={dropRef} className="relative">
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setDropdown(true) }}
              onFocus={() => setDropdown(true)}
              placeholder={t.search_placeholder}
              autoComplete="off"
              className="w-full border-2 border-dashed border-gray-300 hover:border-quebec-blue focus:border-quebec-blue rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            />
            {dropdownOpen && (cityFiltered.length > 0 || filtered.length > 0) && (
              <AttractionDropdown
                cities={cityFiltered}
                filtered={filtered}
                onSelectCity={addCityStop}
                onSelect={addStop}
                lang={lang}
              />
            )}
            {dropdownOpen && query.trim().length >= 3 && filtered.length === 0 && cityFiltered.length === 0 && (
              <p className="mt-2 text-sm text-gray-400 text-center">{t.no_results}</p>
            )}
          </div>
        </div>

        {/* Right — summary */}
        {stops.length >= 1 && legs.length >= 1 && (
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-quebec-navy px-5 py-4">
                <h2 className="text-white font-bold">{t.total_title}</h2>
              </div>
              <div className="px-5 py-4">
                <div className="space-y-3 mb-4">
                  {legs.map((leg) => {
                    const fromLabel = leg.fromSlug === '__departure__'
                      ? departure?.label?.split(',')[0]
                      : stops.find(s => s.slug === leg.fromSlug)?.title?.split(' ').slice(0, 2).join(' ')
                    const toStop  = stops.find(s => s.slug === leg.toSlug)
                    const toLabel = toStop?.title?.split(' ').slice(0, 2).join(' ')
                    return (
                      <div key={leg.id} className="text-sm">
                        <div className="flex justify-between text-gray-700 font-medium">
                          <span className="truncate mr-2">{fromLabel} →</span>
                          <span className="shrink-0 text-quebec-blue font-semibold">{fmtTime(legTotalMin(leg))}</span>
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                          <span>{toLabel}{leg.distanceKm ? ` · ${leg.distanceKm} km` : ''}</span>
                          {(toStop?.nights ?? (toStop?.overnight ? 1 : 0)) > 0 && <span title="Étape nuit">🌙</span>}
                          {toStop?.isPort && <span title="Port traversier">🚢</span>}
                        </div>
                        {toStop?.isPort && <div className="text-xs text-cyan-600 mt-0.5">+ Traversée {fmtTime(toStop.ferryCrossingMin)}</div>}
                        {leg.extra.length > 0 && (
                          <div className="text-xs text-amber-600 mt-0.5">+ {leg.extra.map(e => e.label).join(', ')}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">{Math.round(totalKm * 10) / 10} {t.total_km}</span>
                    <span className="text-xl font-bold text-quebec-navy">{fmtTime(totalMin)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t.total_drive}</p>
                  {drivingMin > MAX_DRIVING_MIN && (
                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{t.warning_long}</div>
                  )}
                  {ferryMin > 0 && (
                    <p className="text-xs text-cyan-600 mt-0.5">dont {fmtTime(ferryMin)} de traversier 🚢</p>
                  )}
                  <p className="mt-3 text-xs text-gray-400 leading-relaxed">{t.tip}</p>
                </div>

                {/* ── Boutons navigation ── */}
                {displayStops.length >= 2 && displayStops.every(s => s.lat && s.lng) && (
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {t.nav_open ?? 'Ouvrir dans…'}
                    </p>
                    {/* Google Maps */}
                    <a
                      href={`https://www.google.com/maps/dir/${displayStops.map(s => `${s.lat},${s.lng}`).join('/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-semibold text-gray-700"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                      Google Maps
                    </a>
                    {/* Waze — destination finale */}
                    <a
                      href={`https://www.waze.com/ul?ll=${displayStops[displayStops.length - 1].lat},${displayStops[displayStops.length - 1].lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-colors text-sm font-semibold text-gray-700"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
                        <circle cx="12" cy="10" r="8" fill="#33CCFF"/>
                        <circle cx="9.5" cy="9" r="1.2" fill="white"/>
                        <circle cx="14.5" cy="9" r="1.2" fill="white"/>
                        <path d="M9 13c.8 1.2 5.2 1.2 6 0" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M8 19l4-3 4 3" fill="#33CCFF" stroke="#33CCFF"/>
                      </svg>
                      Waze
                      <span className="text-xs text-gray-400 font-normal ml-auto">
                        {t.nav_waze_hint ?? '→ destination finale'}
                      </span>
                    </a>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── LAYOUT IMPRESSION — caché à l'écran, visible uniquement à l'impression ── */}
      <div className="hidden print:block print-layout">
        <div className="print-header">
          <div>
            <div className="print-logo">J'AIME LE QUÉBEC</div>
            <div className="print-sub">jaimelequebec.com · Votre guide touristique du Québec</div>
          </div>
          <div className="print-title-block">
            <div className="print-title">{t.page_title}</div>
            <div className="print-meta">
              {season === 'summer' ? '☀️ Été' : '❄️ Hiver'} ·{' '}
              {Math.round(totalKm * 10) / 10} km · {fmtTime(totalMin)}
            </div>
          </div>
        </div>

        <table className="print-table">
          <tbody>
            {displayStops.map((stop, i) => {
              const leg = i < displayStops.length - 1
                ? getLeg(stop.slug, displayStops[i + 1].slug)
                : null
              const cumul = legCumul[i]
              return (
                <tr key={stop.slug} className={((stop.nights ?? (stop.overnight ? 1 : 0)) > 0) ? 'print-overnight' : ''}>
                  <td className="print-num">{i + 1}</td>
                  <td className="print-stop">
                    <strong>{stop.isCustomDeparture ? `🏁 ${stop.title}` : stop.title}</strong>
                    {(() => { const n = stop.nights ?? (stop.overnight ? 1 : 0); return n > 0 ? <span className="print-badge">🌙 {n === 1 ? 'Nuit' : `${n} nuits`}</span> : null })()}
                    {stop.isPort && <span className="print-badge">🚢 Traversier</span>}
                    {stop.extra?.length > 0 && (
                      <div className="print-extras">{stop.extra.map(e => e.label).join(' · ')}</div>
                    )}
                  </td>
                  <td className="print-leg">
                    {leg && leg.distanceKm ? `${leg.distanceKm} km` : ''}
                  </td>
                  <td className="print-time">
                    {leg ? fmtTime(legTotalMin(leg)) : ''}
                  </td>
                  <td className="print-cumul">
                    {cumul ? `${cumul.cumulKm} km` : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="print-total-label">Total</td>
              <td className="print-leg">{Math.round(totalKm * 10) / 10} km</td>
              <td className="print-time print-bold">{fmtTime(totalMin)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div className="print-footer">
          Itinéraire généré sur <strong>jaimelequebec.com</strong> —
          guide touristique indépendant du Québec depuis 2008
        </div>
      </div>

      {/* Map */}
      {displayStops.length >= 2 && (
        <div className="relative z-[1] mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-quebec-navy">🗺️ Carte de l'itinéraire</h2>
            <button onClick={() => setShowMap(v => !v)}
              className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              {showMap ? 'Masquer' : 'Afficher la carte'}
            </button>
          </div>
          {showMap && (
            <PlanifierMap
              key={JSON.stringify(legs.map(l => l.geometry))}
              legs={legs}
              displayStops={displayStops}
            />
          )}
        </div>
      )}
    </div>
  )
}
