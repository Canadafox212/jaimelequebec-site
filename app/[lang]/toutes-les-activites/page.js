import { readdirSync } from 'fs'
import { join } from 'path'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isFr = lang === 'fr'
  return {
    title: isFr
      ? "Toutes les activités au Québec — J'aime le Québec"
      : "All Activities in Québec — J'aime le Québec",
    description: isFr
      ? 'Découvrez les 130+ activités touristiques disponibles au Québec : sports nautiques, ski, randonnée, culture, gastronomie, nature et bien plus.'
      : 'Discover 130+ tourist activities available in Québec: water sports, skiing, hiking, culture, gastronomy, nature and much more.',
  }
}

// Libellés pour les fichiers tronqués ou à accent manquant
const LABEL_MAP = {
  '4x4': '4×4',
  'animation-pour-enfants': 'Animation pour enfants',
  'atelier': 'Atelier',
  'autocueillette': 'Autocueillette',
  'baignade': 'Baignade',
  'balade-en-traineau-en-cheval': 'Balade en traîneau à cheval',
  'balade-motorisee': 'Balade motorisée',
  'billard': 'Billard',
  'bmx': 'BMX',
  'canicross': 'Canicross',
  'canikart': 'Canikart',
  'canot-a-glace': 'Canot à glace',
  'canot-camping': 'Canot-camping',
  'canot-d-eau-vive': "Canot d'eau vive",
  'canot-gonflable': 'Canot gonflable',
  'canot-recreatif': 'Canot récréatif',
  'canyoning-de-glace': 'Canyoning de glace',
  'canyoning': 'Canyoning',
  'ceremonie-commemorative': 'Cérémonie commémorative',
  'chaloupe-a-moteur': 'Chaloupe à moteur',
  'chaloupe-a-rames': 'Chaloupe à rames',
  'chasse': 'Chasse',
  'concert-spectacle': 'Concert / Spectacle',
  'concours-tournoi': 'Concours / Tournoi',
  'conference': 'Conférence',
  'contes-et-legendes': 'Contes et légendes',
  'course-a-pied': 'Course à pied',
  'course-de-vehicules-motorises': 'Course de véhicules motorisés',
  'course-demonstration-hippique': 'Course / Démonstration hippique',
  'croisiere-excursion-en-bateau': 'Croisière / Excursion en bateau',
  'croisiere-excursion-en': 'Croisière / Excursion en mer',
  'danse': 'Danse',
  'degustation': 'Dégustation',
  'descente-en-rappel': 'Descente en rappel',
  'disque-golf': 'Disque-golf',
  'equitation': 'Équitation',
  'escalade-de-glace': 'Escalade de glace',
  'escalade-de-rocher': 'Escalade de rocher',
  'escalade-sur-paroi-artificielle': 'Escalade sur paroi artificielle',
  'experience-en-realite-virtuelle': 'Expérience en réalité virtuelle',
  'exposition': 'Exposition',
  'fatbike': 'Fatbike',
  'feux-d-artifice': "Feux d'artifice",
  'films-projection': 'Films / Projection',
  'geocaching': 'Géocaching',
  'glissade-d-eau': "Glissade d'eau",
  'glissade-sur-neige': 'Glissade sur neige',
  'golf-miniature': 'Golf miniature',
  'golf': 'Golf',
  'hebertisme': 'Hébergisme / Parcours aventure',
  'illumination': 'Illumination',
  'initiation-a-la-survie-en-foret': 'Initiation à la survie en forêt',
  'interpretation-de-la-culture-autochtone': 'Interprétation de la culture autochtone',
  'interpretation-de': 'Interprétation culturelle',
  'interpretation-observation-de-la-nature': 'Interprétation / Observation de la nature',
  'interpretation-observation-de-la': 'Interprétation de la nature',
  'interpretation-observation-de': 'Interprétation de la faune',
  'interpretation-observation': 'Interprétation / Observation',
  'jeu-d-evasion': "Jeu d'évasion",
  'jeu-de-laser': 'Jeu de laser',
  'jeu-de-role': 'Jeu de rôle',
  'jeux-d-arcade': "Jeux d'arcade",
  'jeux-de-casino-hasard': 'Jeux de casino / Hasard',
  'karaoke': 'Karaoké',
  'karting': 'Karting',
  'kayak-camping': 'Kayak-camping',
  'kayak-d-eau-vive': "Kayak d'eau vive",
  'kayak-de-mer-hivernal': 'Kayak de mer hivernal',
  'kayak-de-mer': 'Kayak de mer',
  'kayak-recreatif': 'Kayak récréatif',
  'kite-buggy': 'Kite buggy',
  'kitesurf': 'Kitesurf',
  'labyrinthe': 'Labyrinthe',
  'luge-d-eau': "Luge d'eau",
  'luge-d-ete': "Luge d'été",
  'luge-d-hiver': "Luge d'hiver",
  'maneges': 'Manèges',
  'mini-ferme': 'Mini-ferme',
  'motocyclette': 'Motocyclette',
  'motomarine': 'Motomarine',
  'motoneige': 'Motoneige',
  'mycologie': 'Mycologie',
  'natation': 'Natation',
  'observation-astronomi': 'Observation astronomique',
  'parachutisme': 'Parachutisme',
  'parcours-aerien': 'Parcours aérien',
  'patinage-a-roues-alignees': 'Patinage à roues alignées',
  'patinage-sur-glace': 'Patinage sur glace',
  'peche-sur-la-glace': 'Pêche sur la glace',
  'peche': 'Pêche',
  'pedalo': 'Pédalos',
  'planche-a-pagaie-sup': 'Planche à pagaie (SUP)',
  'planche-a-roulettes': 'Planche à roulettes',
  'planche-a-voile': 'Planche à voile',
  'plongee-en-apnee': 'Plongée en apnée',
  'plongee-sous-marine': 'Plongée sous-marine',
  'ponton': 'Ponton',
  'quad-vtt': 'Quad / VTT',
  'quilles': 'Quilles',
  'rabaska': 'Rabaska',
  'rafting': 'Rafting',
  'rallye': 'Rallye',
  'randonnee-pedestre': 'Randonnée pédestre',
  'raquette': 'Raquette à neige',
  'simulateur-de-vol-en-chute-libre': 'Simulateur de vol en chute libre',
  'ski-alpin-planche-a-neige': 'Ski alpin / Planche à neige',
  'ski-de-fond': 'Ski de fond',
  'ski-de-montagne-randonnee-alpine': 'Ski de montagne / Randonnée alpine',
  'ski-joering': 'Ski-joëring',
  'ski-nautique-wakeboard': 'Ski nautique / Wakeboard',
  'ski-nordique': 'Ski nordique',
  'ski-raquette-ski-hok': 'Ski-raquette / Ski-hok',
  'snowkite': 'Snowkite',
  'soccer': 'Soccer',
  'spectacle-immersif': 'Spectacle immersif',
  'speleologie': 'Spéléologie',
  'surf': 'Surf',
  'tennis': 'Tennis',
  'traineau-a-chiens': 'Traîneau à chiens',
  'trampoline': 'Trampoline',
  'trottinette-des-neiges': 'Trottinette des neiges',
  'trottinette-des': 'Trottinette des neiges',
  'tyrolienne': 'Tyrolienne',
  'velo-de-montagne': 'Vélo de montagne',
  'velo-de': 'Vélo de montagne',
  'velo': 'Vélo',
  'via-ferrata': 'Via ferrata',
  'visite-autonome': 'Visite autonome',
  'visite-guidee': 'Visite guidée',
  'voile': 'Voile',
  'volleyball-de-plage': 'Volleyball de plage',
  'yoga': 'Yoga',
}

function getLabel(filename) {
  const base = filename.replace(/\.(png|jpg|webp|jpeg)$/, '')
  return LABEL_MAP[base] ?? base.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function ToutesActivitesPage({ params }) {
  const { lang } = await params
  const isFr = lang === 'fr'

  const dir = join(process.cwd(), 'public', 'images', 'activites')
  const files = readdirSync(dir)
    .filter(f => /\.(png|jpg|webp|jpeg)$/.test(f))
    .sort((a, b) => {
      const la = getLabel(a)
      const lb = getLabel(b)
      return la.localeCompare(lb, 'fr', { sensitivity: 'base' })
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-quebec-navy to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link href={`/${lang}/activites`} className="text-blue-300 text-sm hover:text-white mb-4 inline-block">
            ← {isFr ? 'Retour aux activités' : 'Back to activities'}
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {isFr ? 'Toutes les activités' : 'All activities'}
          </h1>
          <p className="text-blue-200 mt-2">
            {isFr
              ? `${files.length} activités disponibles au Québec — été et hiver`
              : `${files.length} activities available in Québec — summer and winter`}
          </p>
        </div>
      </div>

      {/* Grille */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => {
            const label = getLabel(file)
            const src = `/images/activites/${file}`
            return (
              <Link
                key={file}
                href={`/${lang}/activites`}
                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={src}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-800 leading-snug text-center">
                    {label}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
