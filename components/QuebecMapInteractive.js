'use client'
import { useState } from 'react'

// Zones cliquables basées sur la carte de référence (image 960×875 map area)
// Coordonnées en pourcentage de la largeur et hauteur de l'image
// Coordonnées en % de l'image COMPLÈTE (1448×1086).
// La carte occupe ~67% de la largeur (légende sur le tiers droit).
// Toutes les coordonnées x sont = position_dans_carte × 0.67
const REGIONS = [
  {
    num: 18, nom: 'Nord-du-Québec', shape: 'poly',
    coords: '0,0,38,0,38,4,46,0,46,44,38,44,32,52,22,52,15,47,9,44,0,44',
  },
  {
    num: 7, nom: 'Côte-Nord', shape: 'poly',
    coords: '38,0,67,0,67,55,55,55,48,60,42,58,37,47,38,44,46,44,46,0',
  },
  {
    num: 17, nom: 'Abitibi-Témiscamingue', shape: 'poly',
    coords: '0,44,9,44,15,47,15,80,9,82,0,80',
  },
  {
    num: 6, nom: 'Saguenay–Lac-Saint-Jean', shape: 'poly',
    coords: '15,47,32,52,38,44,37,47,42,58,35,62,27,58,22,62,19,60,16,55,15,47',
  },
  {
    num: 9, nom: 'Outaouais', shape: 'poly',
    coords: '0,80,9,82,11,88,10,96,6,100,0,100',
  },
  {
    num: 12, nom: 'Laurentides', shape: 'poly',
    coords: '9,82,15,80,19,78,20,85,17,90,12,92,11,88',
  },
  {
    num: 11, nom: 'Lanaudière', shape: 'poly',
    coords: '19,78,24,76,26,83,23,88,19,88,17,84,19,78',
  },
  {
    num: 10, nom: 'Mauricie', shape: 'poly',
    coords: '19,60,27,58,35,62,36,70,31,74,26,74,24,76,19,78,16,72,16,65,19,60',
  },
  {
    num: 3, nom: 'Charlevoix', shape: 'poly',
    coords: '35,62,42,58,46,62,42,68,38,70,35,68,35,62',
  },
  {
    num: 2, nom: 'Québec (Capitale-Nationale)', shape: 'poly',
    coords: '27,58,35,62,35,68,34,74,31,78,27,78,26,74,31,74,36,70,35,62',
  },
  {
    num: 14, nom: 'Chaudière-Appalaches', shape: 'poly',
    coords: '31,78,34,74,38,76,39,82,35,86,31,84,30,80',
  },
  {
    num: 15, nom: 'Centre-du-Québec', shape: 'poly',
    coords: '23,80,27,78,30,80,28,88,26,90,22,88,22,84',
  },
  {
    num: 5, nom: 'Bas-Saint-Laurent', shape: 'poly',
    coords: '38,70,46,62,48,60,50,68,47,76,42,78,38,76,38,70',
  },
  {
    num: 4, nom: 'Gaspésie', shape: 'poly',
    coords: '48,60,55,55,67,55,67,78,59,80,51,80,46,76,46,66,48,60',
  },
  {
    num: 16, nom: 'Îles-de-la-Madeleine', shape: 'poly',
    coords: '56,70,62,66,64,70,62,78,56,78,54,74',
  },
  {
    num: 13, nom: 'Montérégie', shape: 'poly',
    coords: '12,92,20,88,23,90,22,100,11,100,10,96',
  },
  {
    num: 8, nom: "Cantons-de-l'Est", shape: 'poly',
    coords: '23,90,28,88,32,90,31,100,23,100',
  },
  {
    num: 1, nom: 'Montréal', shape: 'rect',
    coords: '1,93,8,100',
  },
  {
    num: 19, nom: 'Laval', shape: 'rect',
    coords: '3,89,7,93',
  },
]

export default function QuebecMapInteractive({ lang, onRegionClick }) {
  const [hovered, setHovered] = useState(null)

  const region = REGIONS.find(r => r.num === hovered)

  // Convertit les coords % en px pour un conteneur 100%×auto
  // On utilise une image-map HTML5 pour la compatibilité maximale
  // avec fallback SVG overlay en pourcentage

  return (
    <div className="relative w-full select-none">
      {/* Image de la carte */}
      <img
        src="/images/carte-regions-quebec.png"
        alt="Carte des régions touristiques du Québec"
        className="w-full rounded-xl block"
        draggable={false}
        useMap="#quebec-regions"
      />

      {/* SVG overlay transparent avec zones cliquables */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {REGIONS.map((r) => {
          const isHovered = hovered === r.num
          const pts = r.coords.split(',')

          let shape
          if (r.shape === 'rect') {
            const [x1, y1, x2, y2] = pts.map(Number)
            shape = (
              <rect
                key={r.num}
                x={x1} y={y1} width={x2 - x1} height={y2 - y1}
                fill={isHovered ? 'rgba(255,255,255,0.3)' : 'transparent'}
                stroke={isHovered ? 'white' : 'transparent'}
                strokeWidth="0.3"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHovered(r.num)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onRegionClick(r.num)}
              />
            )
          } else {
            const points = []
            for (let i = 0; i < pts.length; i += 2) {
              points.push(`${pts[i]},${pts[i + 1]}`)
            }
            shape = (
              <polygon
                key={r.num}
                points={points.join(' ')}
                fill={isHovered ? 'rgba(255,255,255,0.25)' : 'transparent'}
                stroke={isHovered ? 'white' : 'transparent'}
                strokeWidth="0.3"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHovered(r.num)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onRegionClick(r.num)}
              />
            )
          }
          return shape
        })}
      </svg>

      {/* Tooltip région survolée */}
      {region && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
          {region.nom}
        </div>
      )}

      {/* Fallback si image absente */}
      <noscript>
        <p className="text-center text-sm text-gray-400 mt-2">
          Carte des régions du Québec
        </p>
      </noscript>
    </div>
  )
}
