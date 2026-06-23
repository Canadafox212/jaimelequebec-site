'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function FilterBar({ lang, t, filtres, currentRegion, currentCategorie }) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key, value) {
    const params = new URLSearchParams()
    if (key !== 'region' && currentRegion) params.set('region', currentRegion)
    if (key !== 'categorie' && currentCategorie) params.set('categorie', currentCategorie)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const categories = lang === 'fr'
    ? filtres.categories_thematiques.fr
    : filtres.categories_thematiques.en

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
          <option value="">{t.list.filter_all}</option>
          {filtres.regions.map((r) => (
            <option key={r.num} value={r.num}>
              {lang === 'fr' ? r.nom_fr : r.nom_en}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre catégorie */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t.list.filter_category}
        </label>
        <select
          value={currentCategorie ?? ''}
          onChange={(e) => update('categorie', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
        >
          <option value="">{t.list.filter_all}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
