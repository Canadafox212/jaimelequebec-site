'use client'
import { useState } from 'react'
import Link from 'next/link'

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

export default function QuebecMapClickable({ lang, regionsData, sectionTitle, sectionSub }) {
  const [selected, setSelected] = useState(null)
  const isFr = lang === 'fr'

  const selectedRegion = regionsData.find(r => r.num === selected)
  const sorted = [...regionsData].sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''))

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
      {/* Carte décorative */}
      <div className="relative w-full select-none rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-10">
        <img
          src="/images/carte-regions-quebec.png"
          alt={isFr ? 'Carte des régions touristiques du Québec' : 'Map of Québec tourist regions'}
          className="w-full h-auto block"
          draggable={false}
        />
      </div>

      {/* Liste des régions — clic ouvre le modal */}
      {sectionTitle && (
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">{sectionTitle}</h2>
      )}
      {sectionSub && (
        <p className="text-gray-500 text-sm mb-6">{sectionSub}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((r) => (
          <button
            key={r.num}
            onClick={() => openModal(r.num)}
            className="group flex gap-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-quebec-blue p-4 transition-all text-left w-full"
          >
            <div className="flex-shrink-0 text-center">
              <span className="flex w-8 h-8 rounded-full bg-quebec-navy text-white text-sm font-bold items-center justify-center group-hover:bg-quebec-blue transition-colors">
                {r.label}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-quebec-navy transition-colors">
                {isFr ? r.nom_fr : r.nom_en}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                {isFr ? r.desc_fr : r.desc_en}
              </p>
            </div>
          </button>
        ))}
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
                  <h2 className="font-display text-2xl font-bold text-white drop-shadow">
                    {isFr ? selectedRegion.nom_fr : selectedRegion.nom_en}
                  </h2>
                  {(isFr ? selectedRegion.desc_fr : selectedRegion.desc_en) && (
                    <p className="text-sm text-white/80 mt-1">
                      {isFr ? selectedRegion.desc_fr : selectedRegion.desc_en}
                    </p>
                  )}
                </div>
              </div>

              {/* Liste des thèmes */}
              <div className="overflow-y-auto flex-1 p-5">
                {selectedRegion.themes?.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {isFr ? 'Aucune activité répertoriée pour cette région.' : 'No activities listed for this region.'}
                  </p>
                )}
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
