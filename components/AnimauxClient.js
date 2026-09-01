'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AnimauxMap from './AnimauxMap'

function bookingUrl(region) {
  const q = encodeURIComponent('Québec ' + region)
  return `https://www.booking.com/searchresults.fr.html?ss=${q}&nflt=hotelfacility%3D4`
}

const BADGE_COLORS = {
  OUI:     'bg-green-100 text-green-800 border border-green-300',
  PARTIEL: 'bg-amber-100 text-amber-800 border border-amber-300',
  NON:     'bg-red-100 text-red-700 border border-red-300',
}

function ChienBadge({ statut, t }) {
  const label = statut === 'OUI' ? t.badge_oui : statut === 'PARTIEL' ? t.badge_partiel : t.badge_non
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[statut] ?? ''}`}>
      {label}
    </span>
  )
}

function SiteCard({ site, t, lang }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const nom        = lang === 'fr' ? site.nom_fr        : (site.nom_en        || site.nom_fr)
  const conditions = lang === 'fr' ? site.conditions_fr : (site.conditions_en || site.conditions_fr)
  const zonesOk    = lang === 'fr' ? site.zones_ok_fr   : (site.zones_ok_en  || site.zones_ok_fr)
  const zonesNok   = lang === 'fr' ? site.zones_nok_fr  : (site.zones_nok_en || site.zones_nok_fr)
  const noteEuro   = lang === 'fr' ? site.note_euro_fr  : (site.note_euro_en || site.note_euro_fr)

  const hasDetails = zonesOk || zonesNok ||
    (site.hebergement && site.hebergement !== 'Aucun hébergement' && site.hebergement !== 'Aucun hébergement sur site') ||
    noteEuro

  const details = (
    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
      {zonesOk && (
        <div>
          <span className="font-medium text-gray-700">{t.zones_ok} : </span>
          <span className="text-gray-600">{zonesOk}</span>
        </div>
      )}
      {zonesNok && (
        <div>
          <span className="font-medium text-gray-700">{t.zones_nok} : </span>
          <span className="text-red-700">{zonesNok}</span>
        </div>
      )}
      {site.hebergement &&
        site.hebergement !== 'Aucun hébergement' &&
        site.hebergement !== 'Aucun hébergement sur site' && (
        <div>
          <span className="font-medium text-gray-700">{t.hebergement} : </span>
          <span className="text-gray-600">{site.hebergement}</span>
        </div>
      )}
      {noteEuro && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-800 mb-1">{t.note_euro}</p>
          <p className="text-xs text-blue-700">{noteEuro}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {site.slug_attraction && (
          <Link
            href={`/${lang}/sites/${site.slug_attraction}`}
            className="inline-block text-xs bg-[#a02020] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#7a1818] transition-colors"
          >
            {t.view_fiche}
          </Link>
        )}
        {site.site_web && (
          <a
            href={site.site_web}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {t.source} ↗
          </a>
        )}
        <a
          href={bookingUrl(site.region)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-block text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t.booking_cta}
        </a>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <ChienBadge statut={site.chiens} t={t} />
              <span className="text-xs text-gray-500">{site.reseau}</span>
            </div>
            <h3 className="font-semibold text-gray-900 leading-tight">{nom}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{site.region} · {site.categorie}</p>
          </div>
          {site.laisse_m > 0 && (
            <div className="text-center shrink-0">
              <div className="text-lg font-bold text-blue-700">{site.laisse_m} m</div>
              <div className="text-xs text-gray-400">{t.laisse}</div>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{conditions}</p>

        {(site.dist_mtl > 0 || site.dist_qc > 0) && (
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            {site.dist_mtl > 0 && <span>Mtl : {site.dist_mtl} km</span>}
            {site.dist_qc  > 0 && <span>Qc : {site.dist_qc} km</span>}
          </div>
        )}

        {/* Mobile only: toggle button */}
        {hasDetails && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mt-3 text-sm text-blue-600 hover:underline font-medium sm:hidden"
          >
            {mobileOpen ? t.details_hide : t.details_show}
          </button>
        )}
      </div>

      {/* Desktop: always visible — Mobile: toggle */}
      {hasDetails && (
        <>
          <div className="hidden sm:block">{details}</div>
          {mobileOpen && <div className="sm:hidden">{details}</div>}
        </>
      )}
    </div>
  )
}

export default function AnimauxClient({ animaux, t, lang }) {
  const [filterChiens, setFilterChiens] = useState('ALL')
  const [filterRegion, setFilterRegion] = useState('ALL')

  const regions = useMemo(() => {
    const set = new Set(animaux.map(s => s.region))
    return Array.from(set).sort()
  }, [animaux])

  const filtered = useMemo(() => {
    return animaux.filter(s => {
      if (filterChiens !== 'ALL' && s.chiens !== filterChiens) return false
      if (filterRegion !== 'ALL' && s.region !== filterRegion) return false
      return true
    })
  }, [animaux, filterChiens, filterRegion])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1a1a2e] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🐕</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.hero_title}</h1>
          <p className="text-lg text-gray-300 mb-6">{t.hero_sub}</p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
            <span>{animaux.length}</span>
            <span>{t.count_sites}</span>
          </div>
        </div>
      </section>

      {/* Alerte TRACES */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900">
          {t.alert_traces}
        </div>
      </div>

      {/* Règles générales */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">{t.rules_title}</h2>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">•</span>{t.rule_sepaq}</li>
            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">•</span>{t.rule_canada}</li>
            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">•</span>{t.rule_villes}</li>
            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">•</span>{t.rule_terrasses}</li>
            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">•</span>{t.rule_dejections}</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.sepaq.com/animaux/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs border border-green-300 text-green-800 bg-green-50 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors"
            >
              {t.btn_sepaq ?? 'En savoir + sur les parcs SÉPAQ'} ↗
            </a>
            <a
              href="https://www.canada.ca/fr/parcs-canada/rechercher.html?q=animaux+d+compagnie&st=s&num=10&langs=fr&st1rt=0&s5bm3ts21rch=x&wb-srch-sub="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs border border-blue-300 text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              {t.btn_mapaq ?? 'En savoir + sur la règle MAPAQ'} ↗
            </a>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'OUI', 'PARTIEL', 'NON'].map(val => {
              const labels = { ALL: t.filter_all, OUI: t.filter_oui, PARTIEL: t.filter_partiel, NON: t.filter_non }
              const active = filterChiens === val
              return (
                <button
                  key={val}
                  onClick={() => setFilterChiens(val)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-[#a02020] text-white border-[#a02020]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {labels[val]}
                </button>
              )
            })}
          </div>

          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="px-3 py-1.5 rounded-full text-sm border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#a02020]"
          >
            <option value="ALL">{t.filter_region} (tous)</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <span className="text-sm text-gray-400">{filtered.length} {t.count_sites}</span>
        </div>
      </section>

      {/* Carte */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <AnimauxMap sites={filtered} lang={lang} t={t} />
      </section>

      {/* Liste des sites */}
      <section className="max-w-4xl mx-auto px-4 mt-6 pb-16">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{t.no_results}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(site => (
              <SiteCard key={site.id} site={site} t={t} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
