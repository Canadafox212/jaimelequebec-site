'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import QuebecMapInteractive from './QuebecMapInteractive'

export default function FoxyPanel({ lang, onClose }) {
  const router = useRouter()
  const isFr = lang === 'fr'

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function goToRegion(num) {
    onClose()
    router.push(`/${lang}/activites/${num}`)
  }

  function go(path) {
    onClose()
    router.push(`/${lang}${path}`)
  }

  return (
    <>
      {/* Fond */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panneau */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up flex justify-center">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">

          {/* Poignée */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦝</span>
              <div>
                <p className="text-xs font-bold text-quebec-blue uppercase tracking-widest">
                  {isFr ? 'Explorez' : 'Explore'}
                </p>
                <h2 className="font-display text-lg font-bold text-gray-900 leading-tight">
                  J&apos;aime le Québec
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors font-bold text-sm"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <div className="px-4 pt-4 pb-10 flex flex-col gap-5">

            {/* Carte interactive des régions */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {isFr ? 'Carte des régions — cliquez pour explorer' : 'Regional map — click to explore'}
              </p>
              <QuebecMapInteractive lang={lang} onRegionClick={goToRegion} />
            </div>

            {/* Deux boutons action */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => go('/toutes-les-activites')}
                className="group relative rounded-2xl overflow-hidden h-36 text-left"
              >
                <img
                  src="/images/fallbacks/parc.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                    {isFr ? '130+ activités' : '130+ activities'}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight">
                    {isFr ? 'Activités touristiques' : 'Tourist activities'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => go('/nouvelles')}
                className="group relative rounded-2xl overflow-hidden h-36 text-left"
              >
                <img
                  src="/images/attractions/station-mont-tremblant.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                    {isFr ? 'Blog' : 'Blog'}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight">
                    {isFr ? 'Dernières nouvelles' : 'Latest news'}
                  </p>
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
