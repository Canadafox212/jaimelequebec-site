import Link from 'next/link'
import { getRegionsWithCounts, getRegionThemeList } from '@/lib/activites'
import QuebecMapClickable from '@/components/QuebecMapClickable'
import { dicts, LANGS, getAlternates } from '@/lib/i18n'

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  return {
    title: `${t.decouvrir.hero_title} — Régions, activités et attraits touristiques`,
    description: `${t.decouvrir.stat_attractions} · ${t.decouvrir.stat_regions} · ${t.decouvrir.stat_seasons}`,
    alternates: getAlternates('/decouvrir'),
  }
}

// Métadonnées d'affichage : label officiel sur la carte + description courte
const ALPHA_META = {
  17: { label: '01', desc_fr: "Forêts immenses, lacs pour pêcher, histoire minière, Val-d'Or, Rouyn-Noranda.",         desc_en: "Vast forests, fishing lakes, mining history, Val-d'Or, Rouyn-Noranda." },
  5:  { label: '02', desc_fr: 'Côte sauvage du Saint-Laurent, phares, pêche, villages authentiques.',                    desc_en: 'Wild St. Lawrence coast, lighthouses, fishing, authentic villages.' },
  8:  { label: '03', desc_fr: "Vignobles, montagnes douces, villages victoriens, ski alpin et randonnée.",               desc_en: 'Vineyards, rolling hills, Victorian villages, alpine skiing and hiking.' },
  15: { label: '04', desc_fr: "Drummondville, Village québécois d'antan, agroalimentaire et érablières.",                desc_en: 'Drummondville, heritage village, agri-food and maple farms.' },
  3:  { label: '05', desc_fr: "Fjord du Saguenay, observation des baleines, villages d'artistes, casino.",               desc_en: "Saguenay Fjord, whale watching, artists' villages, casino." },
  14: { label: '06', desc_fr: 'Chutes de la Chaudière, Lévis face à Québec, randonnée et vélo de montagne.',             desc_en: 'Chaudière Falls, Lévis facing Québec City, hiking and mountain biking.' },
  7:  { label: '07', desc_fr: 'Territoire vaste et sauvage, observation des baleines à Tadoussac, Sept-Îles.',           desc_en: 'Vast wilderness, whale watching in Tadoussac, Sept-Îles.' },
  4:  { label: '08', desc_fr: 'Rocher Percé, parc national Forillon, route 132, mer omniprésente.',                      desc_en: 'Percé Rock, Forillon National Park, route 132, sea everywhere.' },
  16: { label: '09', desc_fr: 'Archipel de sable rouge, lagunes turquoise, pêcheurs, vent et grands espaces.',           desc_en: 'Red sand archipelago, turquoise lagoons, fishermen, wind and open spaces.' },
  11: { label: '10', desc_fr: 'Hautes-Laurentides, lacs tranquilles, Festival de Lanaudière, Saint-Gabriel.',            desc_en: 'Upper Laurentians, peaceful lakes, Lanaudière Festival, Saint-Gabriel.' },
  12: { label: '11', desc_fr: 'Mont-Tremblant, ski alpin, cyclotourisme, lacs à perte de vue, Sainte-Agathe.',           desc_en: 'Mont-Tremblant, alpine skiing, cycling, countless lakes, Sainte-Agathe.' },
  19: { label: '12', desc_fr: 'Première couronne de Montréal, Cosmodôme, Îles Laval, accès rapide.',                     desc_en: "Montréal's first ring city, Cosmodôme, Laval Islands, easy access." },
  10: { label: '13', desc_fr: 'Parc national de la Mauricie, rivières pour le canot-camping, Trois-Rivières.',           desc_en: 'La Mauricie National Park, rivers for canoe-camping, Trois-Rivières.' },
  13: { label: '14', desc_fr: 'Vergers, forts historiques, Mont-Saint-Hilaire, Saint-Jean-sur-Richelieu.',               desc_en: 'Orchards, historic forts, Mont-Saint-Hilaire, Saint-Jean-sur-Richelieu.' },
  1:  { label: '15', desc_fr: 'Métropole cosmopolite, vie culturelle intense, gastronomie, festivals.',                  desc_en: 'Cosmopolitan metropolis, vibrant culture, gastronomy, festivals.' },
  18: { label: '16', desc_fr: 'Grand Nord, aurores boréales, Cris et Inuits, Radisson, Baie-James.',                     desc_en: 'Far North, northern lights, Cree and Inuit, Radisson, James Bay.' },
  9:  { label: '17', desc_fr: "Parc de la Gatineau, Musée canadien de l'histoire, frontière ontarienne.",               desc_en: 'Gatineau Park, Canadian Museum of History, Ontario border.' },
  2:  { label: '18', desc_fr: "Ville fortifiée du XVIIe siècle, Château Frontenac, Plaines d'Abraham.",                 desc_en: '17th-century walled city, Château Frontenac, Plains of Abraham.' },
  6:  { label: '19', desc_fr: 'Fjord grandiose, lac immense, bleuets légendaires, Véloroute des Bleuets.',               desc_en: 'Grand fjord, vast lake, legendary blueberries, Véloroute des Bleuets.' },
}

export default async function DecouvrirPage({ params }) {
  const { lang } = await params
  const t = dicts[lang]
  const d = t.decouvrir

  const regionsData = getRegionsWithCounts().map(r => ({
    num: r.num,
    nom_fr: r.nom_fr,
    nom_en: r.nom_en ?? r.nom_fr,
    label: ALPHA_META[r.num]?.label ?? String(r.num),
    desc_fr: ALPHA_META[r.num]?.desc_fr ?? '',
    desc_en: ALPHA_META[r.num]?.desc_en ?? '',
    themes: getRegionThemeList(r.num).map(({ theme, count }) => ({
      theme: { id: theme.id, nom_fr: theme.nom_fr, nom_en: theme.nom_en ?? theme.nom_fr },
      count,
    })),
  }))

  return (
    <div className="min-h-screen bg-white">

      {/* Héros */}
      <div className="bg-gradient-to-br from-quebec-navy via-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-quebec-gold text-xs font-bold uppercase tracking-widest mb-3">
            {d.guide_since}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            {d.hero_title}
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            {d.hero_subtitle}
          </p>
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-blue-200">
            <span>🏔 {d.stat_attractions}</span>
            <span>🗺 {d.stat_regions}</span>
            <span>🌿 {d.stat_seasons}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-14">

        {/* Une province grand comme un continent + carte */}
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
            {d.continent_title}
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 mb-8">
            <p>{d.continent_p1}</p>
            <p>{d.continent_p2}</p>
          </div>

          {/* Carte + liste des régions (clic → modal) */}
          <QuebecMapClickable
            lang={lang}
            regionsData={regionsData}
            sectionTitle={d.regions_title}
            sectionSub={d.regions_sub}
          />
        </section>


        {/* Liens rapides */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href={`/${lang}/sites`} className="rounded-2xl bg-quebec-navy text-white p-6 hover:brightness-110 transition-all">
            <div className="text-2xl mb-3">🗺</div>
            <h3 className="font-bold text-lg mb-1">{d.box_attractions_title}</h3>
            <p className="text-blue-200 text-sm">{d.box_attractions_sub}</p>
          </Link>
          <Link href={`/${lang}/toutes-les-activites`} className="rounded-2xl bg-blue-700 text-white p-6 hover:brightness-110 transition-all">
            <div className="text-2xl mb-3">🏃</div>
            <h3 className="font-bold text-lg mb-1">{d.box_activities_title}</h3>
            <p className="text-blue-200 text-sm">{d.box_activities_sub}</p>
          </Link>
          <Link href={`/${lang}/nouvelles`} className="rounded-2xl bg-quebec-blue text-white p-6 hover:brightness-110 transition-all">
            <div className="text-2xl mb-3">📰</div>
            <h3 className="font-bold text-lg mb-1">{d.box_news_title}</h3>
            <p className="text-blue-200 text-sm">{d.box_news_sub}</p>
          </Link>
        </section>

      </div>
    </div>
  )
}
