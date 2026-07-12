import Link from 'next/link'
import { LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn ? 'About — J\'aime le Québec' : 'À propos — J\'aime le Québec',
    description: isEn
      ? 'J\'aime le Québec is an independent Quebec tourism guide created by Philippe Goupil (Fox) since 2008.'
      : 'J\'aime le Québec est un guide touristique indépendant sur le Québec, créé par Philippe Goupil (Fox) depuis 2008.',
    alternates: getAlternates('/a-propos'),
  }
}

export default async function AProposPage({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-quebec-navy mb-3">
          {isEn ? 'About J\'aime le Québec' : 'À propos de J\'aime le Québec'}
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          {isEn
            ? 'An independent guide to the best of Québec, for travellers who love authenticity.'
            : 'Un guide indépendant sur le meilleur du Québec, pour les voyageurs qui aiment l\'authenticité.'}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-10 bg-quebec-cream rounded-2xl px-6 py-6">
        <h2 className="text-lg font-bold text-quebec-navy mb-3">
          {isEn ? '🎯 Our mission' : '🎯 Notre mission'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {isEn
            ? 'J\'aime le Québec is an independent editorial guide that presents the best of Quebec tourism — natural sites, cultural attractions, gastronomic experiences — without advertising or promotional influence. Our 200 carefully selected sites are the result of years of exploration, verified by our community of Quebec lovers.'
            : 'J\'aime le Québec est un guide éditorial indépendant qui présente le meilleur du tourisme québécois — sites naturels, attraits culturels, expériences gastronomiques — sans publicité ni influence promotionnelle. Nos 200 sites soigneusement sélectionnés sont le fruit de nombreuses années d\'exploration, vérifiés par notre communauté de passionnés du Québec.'}
        </p>
      </section>

      {/* Creator */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-quebec-navy mb-4">
          {isEn ? '👤 The creator' : '👤 Le créateur'}
        </h2>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-quebec-blue/10 flex items-center justify-center text-3xl shrink-0">🦝</div>
          <div>
            <p className="font-bold text-quebec-navy text-lg">Philippe Goupil <span className="text-gray-400 font-normal text-sm">(Fox)</span></p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              {isEn
                ? 'Quebec travel enthusiast since 2008, Philippe created J\'aime le Québec to share his passion for the province with travellers from around the world — especially from Europe. He manages the editorial content, the 55,000-member Facebook community, and continues to expand the guide year after year.'
                : 'Passionné de voyage au Québec depuis 2008, Philippe a créé J\'aime le Québec pour partager son amour de la province avec les voyageurs du monde entier — et particulièrement d\'Europe. Il gère le contenu éditorial, la communauté Facebook de 55 000 membres, et enrichit le guide année après année.'}
            </p>
            <a href="mailto:philippegoupil@jaimelequebec.com"
              className="inline-block mt-3 text-sm text-quebec-blue hover:underline">
              philippegoupil@jaimelequebec.com
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-quebec-navy mb-4">
          {isEn ? '📊 In numbers' : '📊 En chiffres'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '2008', label: isEn ? 'Founded' : 'Fondé en' },
            { value: '200+', label: isEn ? 'Tourist sites' : 'Sites touristiques' },
            { value: '20', label: isEn ? 'Tourist regions' : 'Régions touristiques' },
            { value: '55 000', label: isEn ? 'Facebook members' : 'Membres Facebook' },
          ].map(stat => (
            <div key={stat.value} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-quebec-blue">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Independence */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-quebec-navy mb-3">
          {isEn ? '🔍 Independent & transparent' : '🔍 Indépendant & transparent'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {isEn
            ? 'J\'aime le Québec is entirely funded by tourism affiliate commissions (Booking.com, GetYourGuide, Viator, DiscoverCars). When you book a service through one of our links, we may receive a small commission at no additional cost to you. This model allows us to remain editorially independent and free for all readers.'
            : 'J\'aime le Québec est entièrement financé par des commissions d\'affiliation touristique (Booking.com, GetYourGuide, Viator, DiscoverCars). Lorsque vous réservez un service via l\'un de nos liens, nous percevons une petite commission, sans surcoût pour vous. Ce modèle nous permet de rester indépendants éditorialement et gratuits pour tous les lecteurs.'}
        </p>
        <Link href={`/${lang === 'en' ? 'en' : 'fr'}/mentions-legales`}
          className="inline-block mt-3 text-xs text-gray-400 hover:text-quebec-blue transition-colors">
          {isEn ? 'Read our legal notice →' : 'Lire nos mentions légales →'}
        </Link>
      </section>

      {/* Community */}
      <section className="mb-10 bg-blue-700/5 border border-blue-200 rounded-2xl px-6 py-5">
        <h2 className="text-lg font-bold text-quebec-navy mb-3">
          {isEn ? '👥 The community' : '👥 La communauté'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {isEn
            ? 'Beyond the website, J\'aime le Québec is a 55,000-member Facebook group where Quebec enthusiasts share their discoveries, tips and photos. Whether you\'re planning your first trip or your twentieth, the community is here to help.'
            : 'Au-delà du site web, J\'aime le Québec c\'est un groupe Facebook de 55 000 passionnés qui partagent leurs découvertes, conseils et photos du Québec. Que vous prépariez votre premier voyage ou votre vingtième, la communauté est là pour vous aider.'}
        </p>
        <a href="https://www.facebook.com/groups/jaimelequebec" target="_blank" rel="noopener noreferrer"
          className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          {isEn ? 'Join the Facebook group →' : 'Rejoindre le groupe Facebook →'}
        </a>
      </section>

      {/* Contact CTA */}
      <div className="text-center border-t border-gray-200 pt-8">
        <p className="text-gray-500 text-sm mb-4">
          {isEn ? 'A question? A partnership proposal?' : 'Une question ? Une proposition de partenariat ?'}
        </p>
        <Link href={`/${lang}/contact`}
          className="inline-block bg-quebec-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-quebec-navy transition-colors text-sm">
          {isEn ? 'Contact us' : 'Nous contacter'}
        </Link>
      </div>

    </div>
  )
}
