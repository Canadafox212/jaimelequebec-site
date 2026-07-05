'use client'
import { useState } from 'react'
import Link from 'next/link'

// Coordonnées SVG en % de l'image complète 1448×1086
// (carte = ~67% largeur, légende = tiers droit)
const REGIONS_SVG = [
  { num: 18, shape: 'poly', coords: '0,0,38,0,38,4,46,0,46,44,38,44,32,52,22,52,15,47,9,44,0,44' },
  { num: 7,  shape: 'poly', coords: '38,0,67,0,67,55,55,55,48,60,42,58,37,47,38,44,46,44,46,0' },
  { num: 17, shape: 'poly', coords: '0,44,9,44,15,47,15,80,9,82,0,80' },
  { num: 6,  shape: 'poly', coords: '15,47,32,52,38,44,37,47,42,58,35,62,27,58,22,62,19,60,16,55,15,47' },
  { num: 9,  shape: 'poly', coords: '0,80,9,82,11,88,10,96,6,100,0,100' },
  { num: 12, shape: 'poly', coords: '9,82,15,80,19,78,20,85,17,90,12,92,11,88' },
  { num: 11, shape: 'poly', coords: '19,78,24,76,26,83,23,88,19,88,17,84,19,78' },
  { num: 10, shape: 'poly', coords: '19,60,27,58,35,62,36,70,31,74,26,74,24,76,19,78,16,72,16,65,19,60' },
  { num: 3,  shape: 'poly', coords: '35,62,42,58,46,62,42,68,38,70,35,68,35,62' },
  { num: 2,  shape: 'poly', coords: '27,58,35,62,35,68,34,74,31,78,27,78,26,74,31,74,36,70,35,62' },
  { num: 14, shape: 'poly', coords: '31,78,34,74,38,76,39,82,35,86,31,84,30,80' },
  { num: 15, shape: 'poly', coords: '23,80,27,78,30,80,28,88,26,90,22,88,22,84' },
  { num: 5,  shape: 'poly', coords: '38,70,46,62,48,60,50,68,47,76,42,78,38,76,38,70' },
  { num: 4,  shape: 'poly', coords: '48,60,55,55,67,55,67,78,59,80,51,80,46,76,46,66,48,60' },
  { num: 16, shape: 'poly', coords: '56,70,62,66,64,70,62,78,56,78,54,74' },
  { num: 13, shape: 'poly', coords: '12,92,20,88,23,90,22,100,11,100,10,96' },
  { num: 8,  shape: 'poly', coords: '23,90,28,88,32,90,31,100,23,100' },
  { num: 1,  shape: 'rect', coords: '1,93,8,100' },
  { num: 19, shape: 'rect', coords: '3,89,7,93' },
]

const REGION_IMAGES = {
  1:  '/images/REGIONS/montréal_.png',
  2:  '/images/REGIONS/québec.png',
  3:  '/images/REGIONS/Charlevoix.png',
  4:  '/images/REGIONS/Gaspesie.png',
  5:  '/images/REGIONS/bas st laurent.png',
  6:  '/images/REGIONS/saguenay lac st jean 2.png',
  7:  '/images/REGIONS/cote nord.png',
  8:  '/images/REGIONS/Cantons de l est.png',
  9:  '/images/REGIONS/outaouais.png',
  10: '/images/REGIONS/mauricie.png',
  11: '/images/REGIONS/lanaudiere.png',
  12: '/images/REGIONS/laurentides.png',
  13: '/images/REGIONS/Monteregie.png',
  14: '/images/REGIONS/chaudiere appalaches 2.png',
  15: '/images/REGIONS/centre du QC.png',
  16: '/images/REGIONS/Iles de la madeleine.png',
  17: '/images/REGIONS/Abitibi.png',
  18: '/images/REGIONS/Nord du Québec.png',
  19: '/images/REGIONS/laval.png',
}

export default function QuebecMapClickable({ lang, regionsData }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const isFr = lang === 'fr'

  const hoveredRegion = regionsData.find(r => r.num === hovered)
  const selectedRegion = regionsData.find(r => r.num === selected)

  function openModal(num) {
    setSelected(num)
    document.body.style.overflow = 'hidden'
  }
  function closeModal() {
    setSelected(null)
    document.body.style.overflow = ''
  }

  return (
    <>
      {/* Carte avec zones cliquables */}
      <div className="relative w-full select-none rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <img
          src="/images/carte-regions-quebec.png"
          alt={isFr ? 'Carte des régions touristiques du Québec' : 'Map of Québec tourist regions'}
          className="w-full h-auto block"
          draggable={false}
        />

        {/* SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {REGIONS_SVG.map((r) => {
            const isHov = hovered === r.num
            const pts = r.coords.split(',')

            const common = {
              fill: isHov ? 'rgba(59,130,246,0.35)' : 'transparent',
              stroke: isHov ? 'rgba(255,255,255,0.9)' : 'transparent',
              strokeWidth: '0.4',
              className: 'cursor-pointer transition-all duration-100',
              onMouseEnter: () => setHovered(r.num),
              onMouseLeave: () => setHovered(null),
              onClick: () => openModal(r.num),
            }

            if (r.shape === 'rect') {
              const [x1, y1, x2, y2] = pts.map(Number)
              return <rect key={r.num} x={x1} y={y1} width={x2 - x1} height={y2 - y1} {...common} />
            }

            const points = []
            for (let i = 0; i < pts.length; i += 2) points.push(`${pts[i]},${pts[i+1]}`)
            return <polygon key={r.num} points={points.join(' ')} {...common} />
          })}
        </svg>

        {/* Tooltip survol */}
        {hoveredRegion && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap z-10">
            {isFr ? hoveredRegion.nom_fr : hoveredRegion.nom_en}
          </div>
        )}

        {/* Hint clic */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
          {isFr ? 'Cliquez sur une région' : 'Click a region'}
        </div>
      </div>

      {/* Modal */}
      {selected && selectedRegion && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Bandeau photo région */}
              <div className="relative h-48 shrink-0 overflow-hidden">
                {REGION_IMAGES[selectedRegion.num] && (
                  <img
                    src={REGION_IMAGES[selectedRegion.num]}
                    alt={isFr ? selectedRegion.nom_fr : selectedRegion.nom_en}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                  aria-label="Fermer"
                >✕</button>
                <div className="absolute bottom-0 left-0 px-5 pb-4">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-0.5">
                    {isFr ? 'Région' : 'Region'} {String(selectedRegion.num).padStart(2, '0')}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white drop-shadow">
                    {isFr ? selectedRegion.nom_fr : selectedRegion.nom_en}
                  </h2>
                </div>
              </div>

              {/* Liste des thèmes */}
              <div className="overflow-y-auto flex-1 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {isFr ? 'Activités disponibles dans cette région' : 'Activities available in this region'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRegion.themes.map(({ theme, count }) => (
                    <Link
                      key={theme.id}
                      href={`/${lang}/activites/${selectedRegion.num}/${theme.id}`}
                      onClick={closeModal}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 px-4 py-3 transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-800 group-hover:text-quebec-navy leading-tight">
                        {isFr ? theme.nom_fr : (theme.nom_en ?? theme.nom_fr)}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-quebec-blue bg-blue-50 group-hover:bg-white rounded-full px-2.5 py-0.5">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Pied : lien page complète */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100">
                <Link
                  href={`/${lang}/activites/${selectedRegion.num}`}
                  onClick={closeModal}
                  className="block w-full text-center bg-quebec-navy hover:bg-quebec-blue text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {isFr ? `Explorer ${selectedRegion.nom_fr} →` : `Explore ${selectedRegion.nom_en} →`}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
