import Link from 'next/link'
import Image from 'next/image'
import { LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn ? "About — J'aime le Québec" : "À propos — J'aime le Québec",
    description: isEn
      ? "J'aime le Québec is an independent Quebec tourism guide created by Philippe Goupil (Fox) since 2008."
      : "J'aime le Québec est un guide touristique indépendant sur le Québec, créé par Philippe Goupil (Fox) depuis 2008.",
    alternates: getAlternates('/a-propos'),
  }
}

export default async function AProposPage({ params }) {
  const { lang } = await params
  const isFr = lang === 'fr'

  const t = {
    hero:         isFr ? "À propos de J'aime le Québec" : "About J'aime le Québec",
    mission_label: isFr ? 'Notre mission' : 'Our mission',
    mission_sub:   isFr ? "Proposer aux voyageurs qui aiment l'authenticité le meilleur du Québec en un seul endroit."
                        : "Bring the best of authentic Québec to travellers, all in one place.",
    mission_body:  isFr ? "J'aime le Québec est un guide éditorial indépendant qui présente le meilleur du tourisme québécois — sites naturels, attraits culturels, expériences gastronomiques — sans publicité ni influence promotionnelle. Nos 200 sites soigneusement sélectionnés sont le fruit de nombreuses années d'exploration, vérifiés par notre communauté de passionnés du Québec."
                        : "J'aime le Québec is an independent editorial guide presenting the best of Quebec tourism — natural sites, cultural attractions, gastronomic experiences — without advertising or promotional influence. Our 200 carefully selected sites are the result of years of exploration, verified by our community of Quebec lovers.",
    mission_cta:  isFr ? 'EXPLORER LES 200 SITES' : 'EXPLORE 200 SITES',
    stats_label:  isFr ? 'NOS CHIFFRES' : 'BY THE NUMBERS',
    stats: [
      { value: '2008',    label: isFr ? 'Année de création'    : 'Year founded'        },
      { value: '+200',    label: isFr ? 'Sites sélectionnés'   : 'Selected sites'      },
      { value: '19',      label: isFr ? 'Régions touristiques' : 'Tourist regions'     },
      { value: '11',      label: isFr ? "Lieux d'exception"    : 'Exceptional places'  },
      { value: '55 000',  label: isFr ? 'Membres Facebook'     : 'Facebook members'    },
    ],
    creator_label: isFr ? 'Notre créateur dévoué' : 'Our dedicated creator',
    creator_body:  isFr ? "Passionné de voyage au Québec depuis 2008, Philippe a créé J'aime le Québec pour partager son amour de la province avec les voyageurs du monde entier — et particulièrement d'Europe. Il gère le contenu éditorial, la communauté Facebook de 55 000 membres, et enrichit le guide année après année."
                        : "A Quebec travel enthusiast since 2008, Philippe created J'aime le Québec to share his love for the province with travellers from around the world — especially Europe. He manages the editorial content, the 55,000-member Facebook community, and expands the guide year after year.",
    spirit_label:  isFr ? "Notre état d'esprit" : 'Our philosophy',
    spirit_sub:    isFr ? 'Indépendant et transparent' : 'Independent and transparent',
    spirit_body:   isFr ? "J'aime le Québec est entièrement financé par des commissions d'affiliation touristique (Booking.com, GetYourGuide, Viator, DiscoverCars). Lorsque vous réservez un service via l'un de nos liens, nous percevons une petite commission, sans surcoût pour vous. Ce modèle nous permet de rester indépendants éditorialement et gratuits pour tous les lecteurs."
                        : "J'aime le Québec is entirely funded by tourism affiliate commissions (Booking.com, GetYourGuide, Viator, DiscoverCars). When you book a service through one of our links, we may receive a small commission at no additional cost to you. This allows us to remain editorially independent and free for all readers.",
    spirit_cta:    isFr ? 'EN SAVOIR +' : 'LEARN MORE',
    community_label: isFr ? 'Notre communauté' : 'Our community',
    community_body:  isFr ? "Au-delà du site web, J'aime le Québec c'est un groupe Facebook de 55 000 passionnés qui partagent leurs découvertes, conseils et photos du Québec. Que vous prépariez votre premier voyage ou votre vingtième, la communauté est là pour vous aider."
                           : "Beyond the website, J'aime le Québec is a Facebook group of 55,000 enthusiasts who share their discoveries, tips and photos of Québec. Whether you're planning your first trip or your twentieth, the community is here to help.",
    community_cta: isFr ? 'REJOINDRE NOTRE GROUPE' : 'JOIN OUR GROUP',
    contact_title: isFr ? 'Une question ? Un souhait de partenariat ?' : 'A question? A partnership proposal?',
    contact_cta:   isFr ? 'NOUS CONTACTER' : 'CONTACT US',
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src="/images/hero-quebec.jpg"
          alt="Québec"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/65" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white text-center uppercase tracking-wide drop-shadow-lg">
            {t.hero}
          </h1>
        </div>
      </div>

      {/* ── NOTRE MISSION ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-quebec-blue uppercase tracking-widest mb-4">{t.mission_label}</p>
          <p className="text-lg md:text-xl font-semibold text-gray-900 italic leading-snug mb-6">
            {t.mission_sub}
          </p>
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            {t.mission_body}
          </p>
          <Link
            href={`/${lang}/sites`}
            className="inline-block bg-quebec-blue text-white font-bold px-8 py-3.5 rounded-full hover:bg-blue-800 transition-colors text-sm tracking-wide shadow-md"
          >
            {t.mission_cta}
          </Link>
        </div>
      </section>

      {/* ── NOS CHIFFRES ──────────────────────────────────────────────── */}
      <div className="bg-quebec-navy text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest text-center mb-8">{t.stats_label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
            {t.stats.map((s, i) => (
              <div key={i} className="border-l border-white/10 first:border-0 pl-4 first:pl-0">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-blue-300 mt-1.5 uppercase tracking-wide leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NOTRE CRÉATEUR ────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-10">
          <div className="shrink-0">
            <Image
              src="/images/mascot.png"
              alt="Fox — mascotte J'aime le Québec"
              width={180}
              height={180}
              className="object-contain drop-shadow-lg"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-quebec-blue uppercase tracking-widest mb-3">{t.creator_label}</p>
            <p className="font-display text-2xl font-bold text-gray-900">
              Philippe Goupil <span className="text-gray-400 font-normal text-base">(Fox)</span>
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-4">
              {t.creator_body}
            </p>
            <p className="text-sm text-gray-500">
              {isFr ? 'Pour le contacter :' : 'Contact:'}{' '}
              <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline font-medium">
                philippegoupil@jaimelequebec.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── NOTRE ÉTAT D'ESPRIT ───────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-xs font-bold text-quebec-blue uppercase tracking-widest mb-3">{t.spirit_label}</p>
            <p className="font-display text-2xl font-bold text-gray-900 mb-4">{t.spirit_sub}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.spirit_body}</p>
            <Link
              href={`/${lang}/mentions-legales`}
              className="inline-block bg-quebec-blue text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
            >
              {t.spirit_cta}
            </Link>
          </div>
          <div className="shrink-0">
            <div className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <Image
                src="/images/attractions/festival-international-de-montgolfieres-de-saint-jean-sur-richelieu.webp"
                alt="Montgolfières — Québec"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── NOTRE COMMUNAUTÉ ──────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-12">
          <div className="shrink-0 relative">
            <div className="w-36 h-36 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo.svg"
                alt="J'aime le Québec"
                width={110}
                height={110}
                className="object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-quebec-blue uppercase tracking-widest mb-3">{t.community_label}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.community_body}</p>
            <a
              href="https://www.facebook.com/groups/jaimelequebec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1877F2] text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              {t.community_cta}
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ───────────────────────────────────────────────── */}
      <section className="bg-quebec-navy py-16 px-4 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-wide mb-8">
          {t.contact_title}
        </h2>
        <Link
          href={`/${lang}/contact`}
          className="inline-block bg-quebec-blue text-white font-bold px-10 py-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg text-sm tracking-wide"
        >
          {t.contact_cta}
        </Link>
      </section>
    </>
  )
}
