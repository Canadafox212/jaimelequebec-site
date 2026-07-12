'use client'
import { useRouter, usePathname } from 'next/navigation'

const SAISONS = [
  { id: 'ete',   fr: '☀️ Été',              en: '☀️ Summer'      },
  { id: 'hiver', fr: '❄️ Hiver',            en: '❄️ Winter'      },
]

function saisonCompat(theme, saison) {
  if (!saison || !theme) return true
  if (saison === 'ete')   return theme.saison === 'ete'   || theme.saison === 'les_deux'
  if (saison === 'hiver') return theme.saison === 'hiver' || theme.saison === 'les_deux'
  return true
}

export default function FilterBar({ lang, t, filtres, themes, currentRegion, currentTheme, currentSaison, currentQuery, hideTheme, hideSaison }) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key, value) {
    const params = new URLSearchParams()
    if (currentQuery) params.set('q', currentQuery)

    const newRegion = key === 'region' ? value : currentRegion
    const newSaison = key === 'saison' ? value : currentSaison
    const newTheme  = key === 'theme'  ? value : currentTheme
    const selTheme  = themes?.find((th) => th.id === newTheme)

    if (newRegion) params.set('region', newRegion)
    if (newSaison && saisonCompat(selTheme, newSaison)) params.set('saison', newSaison)
    if (newTheme  && saisonCompat(selTheme, newSaison)) params.set('theme', newTheme)

    router.push(`${pathname}?${params.toString()}`)
  }

  // Thèmes filtrés par saison sélectionnée, triés alphabétiquement
  const availableThemes = themes
    ? themes
        .filter((th) => saisonCompat(th, currentSaison))
        .sort((a, b) => (a[`nom_${lang}`] ?? a.nom_fr).localeCompare(b[`nom_${lang}`] ?? b.nom_fr, lang))
    : []

  // Saisons compatibles avec le thème sélectionné
  const selTheme = themes?.find((th) => th.id === currentTheme)
  const availableSaisons = selTheme
    ? SAISONS.filter((s) => saisonCompat(selTheme, s.id))
    : SAISONS

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Filtre région */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t.list.filter_region}
        </label>
        <select
          value={currentRegion ?? ''}
          onChange={(e) => update('region', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
        >
          <option value="">{lang === 'fr' ? 'Toutes' : t.list.filter_all}</option>
          {[...filtres.regions]
            .sort((a, b) => (a[`nom_${lang}`] ?? a.nom_fr).localeCompare(b[`nom_${lang}`] ?? b.nom_fr, lang))
            .map((r) => (
              <option key={r.num} value={r.num}>
                {r[`nom_${lang}`] ?? r.nom_en ?? r.nom_fr}
              </option>
            ))}
        </select>
      </div>

      {/* Filtre saison */}
      {!hideSaison && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {lang === 'fr' ? 'Saison' : 'Season'}
          </label>
          <select
            value={currentSaison ?? ''}
            onChange={(e) => update('saison', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
          >
            <option value="">{t.list.filter_all}</option>
            {availableSaisons.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === 'fr' ? s.fr : s.en}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filtre activité / thème */}
      {!hideTheme && availableThemes.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {lang === 'fr' ? 'Activité' : 'Activity'}
          </label>
          <select
            value={currentTheme ?? ''}
            onChange={(e) => update('theme', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
          >
            <option value="">{t.list.filter_all}</option>
            {availableThemes.map((th) => (
              <option key={th.id} value={th.id}>
                {th.emoji} {th[`nom_${lang}`] ?? th.nom_en ?? th.nom_fr}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
