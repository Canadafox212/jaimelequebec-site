import Link from 'next/link'

const SECTIONS = [
  {
    href:  '/admin/attractions',
    emoji: '⭐',
    titre: 'Mise en avant des attractions',
    desc:  'Gérer les coups de cœur et la priorité d\'affichage des sites.',
  },
  {
    href:  '/admin/services',
    emoji: '🏪',
    titre: 'Registre des services',
    desc:  'Descriptions, liens d\'affiliation et photos des établissements.',
  },
  {
    href:  '/admin/activites',
    emoji: '⚡',
    titre: 'Activités manquantes',
    desc:  'Ajouter des activités manuellement à un site touristique.',
  },
  {
    href:  '/admin/activites-saisons',
    emoji: '🗓️',
    titre: 'Saisons des activités',
    desc:  'Classer chaque activité en Été / Hiver / Toute l\'année.',
  },
  {
    href:  '/admin/articles',
    emoji: '📰',
    titre: 'Articles / Blog',
    desc:  'Créer et modifier les articles du blog.',
  },
  {
    href:  '/admin/images',
    emoji: '🖼️',
    titre: 'Gestion des images',
    desc:  'Uploader et associer des photos aux attractions.',
  },
  {
    href:  '/admin/photos',
    emoji: '📦',
    titre: 'Opérations en lot',
    desc:  'Traitements groupés sur les photos et données.',
  },
]

export default function AdminIndex() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#001a4d] text-white px-6 py-6">
        <h1 className="text-2xl font-bold mb-1">🛠️ Administration — J'aime le Québec</h1>
        <p className="text-blue-300 text-sm">Outils locaux de gestion du site</p>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="grid gap-3">
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <span className="text-3xl shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {s.titre}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{s.desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-blue-400 text-xl transition-colors shrink-0">→</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Ces outils fonctionnent uniquement en développement local.
        </p>
      </div>
    </div>
  )
}
