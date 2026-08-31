import Link from 'next/link'
import Image from 'next/image'
import CoupsDeCoeurCarousel from '@/components/CoupsDeCoeurCarousel'
import { getAllAttractions, getAttractionImageSrc } from '@/lib/attractions'
import { getCoupsDeCoeur } from '@/lib/activites'
import { getDictionary, LANGS, getAlternates } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { bookingRegionUrl, discovercarsUrl, gygUrl, viatorUrl } from '@/lib/affiliates'

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) return {}
  return {
    title: `J'aime le Québec — ${t.home.hero_title}`,
    description: t.home.hero_subtitle,
    alternates: getAlternates(''),
  }
}

export default async function HomePage({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) notFound()
  const attractions = getAllAttractions()
  const coups = getCoupsDeCoeur(6)
  const featuredRaw = coups.length ? coups : attractions.slice(0, 6)
  const featured = featuredRaw.map((a) => ({ ...a, imageSrc: getAttractionImageSrc(a.slug) }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "J'aime le Québec",
    url: `https://jaimelequebec.org/${lang}`,
    description: t.home.hero_subtitle,
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `https://jaimelequebec.org/${lang}/recherche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="/images/hero-quebec.jpg"
          alt="Le Québec — Château Frontenac, fleuve Saint-Laurent, activités nature"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-quebec-navy/50 via-quebec-navy/35 to-quebec-navy/65" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center flex flex-col items-center justify-center min-h-[520px] md:min-h-[600px]">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-5 uppercase tracking-wide drop-shadow-lg">
            {t.home.hero_title}
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto leading-relaxed mb-10 italic">
            {t.home.hero_subtitle}
          </p>

          <Link
            href={`/${lang}/sites`}
            className="inline-block bg-quebec-blue text-white text-base font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors shadow-xl"
          >
            {t.home.hero_cta ?? "J'Y VAIS !"}
          </Link>

          {/* Chevrons défilement */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 opacity-70 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 -mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>


      {/* ── TEXTE D'ACCUEIL ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold text-quebec-navy mb-6 uppercase tracking-wide">
            {t.home.welcome_title}
          </h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8">
            {t.home.welcome_text_pre}
            <a
              href="https://www.facebook.com/groups/jaimelequebec"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-quebec-blue hover:underline"
            >
              {t.home.welcome_facebook_label}
            </a>
            {t.home.welcome_text_mid}
            <Link href={`/${lang}/sites`} className="font-semibold text-quebec-blue hover:underline">
              {t.home.welcome_sites_label}
            </Link>
            {t.home.welcome_text_post}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${lang}/a-propos`}
              className="inline-block border-2 border-quebec-navy text-quebec-navy font-bold px-6 py-3 rounded-full hover:bg-quebec-navy hover:text-white transition-colors text-sm"
            >
              {t.home.welcome_cta_about}
            </Link>
            <Link
              href={`/${lang}/sites`}
              className="inline-block bg-quebec-blue text-white font-bold px-6 py-3 rounded-full hover:bg-blue-800 transition-colors text-sm shadow-md"
            >
              {t.home.welcome_cta_sites}
            </Link>
          </div>
        </div>
      </section>

      {/* ── COUPS DE CŒUR ────────────────────────────────────────────── */}
      <section className="bg-quebec-blue py-14 px-4">
        {/* En-tête */}
        <div className="flex flex-col items-center mb-10 text-center">
          {/* Icône médaillon */}
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-quebec-blue text-2xl leading-none">⚜</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            {lang === 'fr' ? 'Nos coups de cœur à ne pas manquer'
              : lang === 'en' ? 'Our top picks not to be missed'
              : t.home.featured_title}
          </h2>
        </div>

        {/* Carrousel */}
        <div className="max-w-6xl mx-auto">
          <CoupsDeCoeurCarousel attractions={featured} lang={lang} t={t} />
        </div>

        {/* Bouton bas */}
        <div className="text-center mt-10">
          <Link
            href={`/${lang}/sites`}
            className="inline-block border-2 border-white text-white font-bold px-10 py-3.5 rounded-full hover:bg-white hover:text-quebec-blue transition-colors text-sm"
          >
            {lang === 'fr' ? 'ACCÉDER AUX 200 SITES'
              : lang === 'en' ? 'ACCESS ALL 200 SITES'
              : t.home.see_all_annuaire?.toUpperCase() ?? 'ACCÉDER AUX 200 SITES'}
          </Link>
        </div>
      </section>

      {/* ── J'AIME LE QUÉBEC, C'EST AUSSI… ──────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-quebec-blue text-center uppercase tracking-wide mb-12">
            {lang === 'fr' ? "J'aime le Québec, c'est aussi…"
              : lang === 'en' ? "J'aime le Québec is also…"
              : lang === 'es' ? "J'aime le Québec también es…"
              : lang === 'de' ? "J'aime le Québec ist auch…"
              : lang === 'pt' ? "J'aime le Québec é também…"
              : "J'aime le Québec, c'est aussi…"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            {/* ── Activités ── */}
            <div className="flex flex-col items-center text-center px-8 py-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-quebec-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-gray-900 uppercase text-sm tracking-wide leading-snug mb-3">
                {lang === 'fr' ? '650 activités à faire selon vos envies'
                  : lang === 'en' ? '650 activities to suit your tastes'
                  : lang === 'es' ? '650 actividades según sus gustos'
                  : lang === 'de' ? '650 Aktivitäten nach Ihren Wünschen'
                  : lang === 'pt' ? '650 atividades ao seu gosto'
                  : '650 activités à faire selon vos envies'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {lang === 'fr' ? 'Pour vous faire plaisir tout au long de votre voyage.'
                  : lang === 'en' ? 'Enjoy them throughout your entire trip.'
                  : lang === 'es' ? 'Para disfrutar durante todo su viaje.'
                  : lang === 'de' ? 'Für Ihr Vergnügen auf der ganzen Reise.'
                  : lang === 'pt' ? 'Para aproveitar durante toda a sua viagem.'
                  : 'Pour vous faire plaisir tout au long de votre voyage.'}
              </p>
              <Link
                href={`/${lang}/activites`}
                className="inline-block bg-quebec-blue text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
              >
                {t.nav.activities.toUpperCase()}
              </Link>
            </div>

            {/* ── Road trip ── */}
            <div className="flex flex-col items-center text-center px-8 py-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-quebec-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10V7" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-gray-900 uppercase text-sm tracking-wide leading-snug mb-3">
                {lang === 'fr' ? 'Un estimateur de temps de trajet (road trip)'
                  : lang === 'en' ? 'A road trip travel time estimator'
                  : lang === 'es' ? 'Un estimador de tiempo de viaje (road trip)'
                  : lang === 'de' ? 'Ein Reisezeitrechner für Ihren Road Trip'
                  : lang === 'pt' ? 'Um estimador de tempo de viagem (road trip)'
                  : 'Un estimateur de temps de trajet (road trip)'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {lang === 'fr' ? 'Pour construire votre itinéraire et déterminer les étapes de votre voyage.'
                  : lang === 'en' ? 'Build your itinerary and plan the stages of your trip.'
                  : lang === 'es' ? 'Para construir su itinerario y determinar las etapas de su viaje.'
                  : lang === 'de' ? 'Erstellen Sie Ihre Route und planen Sie die Etappen Ihrer Reise.'
                  : lang === 'pt' ? 'Para construir o seu itinerário e determinar as etapas da sua viagem.'
                  : 'Pour construire votre itinéraire et déterminer les étapes de votre voyage.'}
              </p>
              <Link
                href={`/${lang}/planifier`}
                className="inline-block bg-quebec-blue text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
              >
                {t.nav.roadtrip?.toUpperCase() ?? 'ROAD TRIP'}
              </Link>
            </div>

            {/* ── Articles ── */}
            <div className="flex flex-col items-center text-center px-8 py-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-quebec-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-gray-900 uppercase text-sm tracking-wide leading-snug mb-3">
                {lang === 'fr' ? 'Des articles aux thématiques variées'
                  : lang === 'en' ? 'Articles on varied themes'
                  : lang === 'es' ? 'Artículos sobre temas variados'
                  : lang === 'de' ? 'Artikel zu verschiedenen Themen'
                  : lang === 'pt' ? 'Artigos sobre temas variados'
                  : 'Des articles aux thématiques variées'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {lang === 'fr' ? "Pour vous informer sur le Québec et être au courant des dernières actualités."
                  : lang === 'en' ? 'Stay informed about Québec and keep up with the latest news.'
                  : lang === 'es' ? 'Para informarse sobre Québec y estar al día de las últimas noticias.'
                  : lang === 'de' ? 'Um sich über Québec zu informieren und auf dem Laufenden zu bleiben.'
                  : lang === 'pt' ? 'Para se informar sobre o Québec e ficar a par das últimas notícias.'
                  : "Pour vous informer sur le Québec et être au courant des dernières actualités."}
              </p>
              <Link
                href={`/${lang}/articles`}
                className="inline-block bg-quebec-blue text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
              >
                {t.nav.articles.toUpperCase()}
              </Link>
            </div>

            {/* ── Expressions ── */}
            <div className="flex flex-col items-center text-center px-8 py-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-quebec-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-gray-900 uppercase text-sm tracking-wide leading-snug mb-3">
                {lang === 'fr' ? '1 985 mots et expressions québécoises'
                  : lang === 'en' ? '1,985 Quebec words and expressions'
                  : lang === 'es' ? '1 985 palabras y expresiones quebequesas'
                  : lang === 'de' ? '1 985 québecer Wörter und Ausdrücke'
                  : lang === 'it' ? '1 985 parole ed espressioni québécoises'
                  : lang === 'pt' ? '1 985 palavras e expressões québécoises'
                  : lang === 'ru' ? '1 985 слов и выражений Квебека'
                  : lang === 'zh' ? '1985个魁北克词汇和表达'
                  : lang === 'hi' ? '1,985 क्यूबेक शब्द और भाव'
                  : '1 985 mots et expressions québécoises'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {lang === 'fr' ? 'Pour comprendre et parler comme un vrai Québécois dès votre arrivée.'
                  : lang === 'en' ? 'Understand and speak like a true Quebecker from day one.'
                  : lang === 'es' ? 'Para entender y hablar como un verdadero québécois desde su llegada.'
                  : lang === 'de' ? 'Verstehen und sprechen wie ein echter Québécois ab Ihrer Ankunft.'
                  : lang === 'it' ? 'Per capire e parlare come un vero québécois fin dal vostro arrivo.'
                  : lang === 'pt' ? 'Para compreender e falar como um verdadeiro québécois desde a chegada.'
                  : lang === 'ru' ? 'Понимайте и говорите как настоящий квебекец с первого дня.'
                  : lang === 'zh' ? '从抵达第一天起，像真正的魁北克人一样理解和说话。'
                  : lang === 'hi' ? 'पहुंचने के पहले दिन से एक सच्चे क्यूबेकर की तरह समझें और बोलें।'
                  : 'Pour comprendre et parler comme un vrai Québécois dès votre arrivée.'}
              </p>
              <Link
                href={`/${lang}/expressions`}
                className="inline-block bg-quebec-blue text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
              >
                {(t.nav.expressions ?? 'EXPRESSIONS').toUpperCase()}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── PARTENAIRES VOYAGE ───────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between py-2">
              <span className="font-bold text-xs uppercase tracking-widest text-slate-400">
                {lang === 'fr' ? 'Nos partenaires voyage' : lang === 'en' ? 'Our travel partners' : lang === 'es' ? 'Nuestros socios de viaje' : lang === 'de' ? 'Unsere Reisepartner' : lang === 'pt' ? 'Os nossos parceiros de viagem' : 'Nos partenaires voyage'}
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-400 text-xl font-bold shadow-sm group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
            </summary>
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a href={bookingRegionUrl(lang)} target="_blank" rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-2 bg-[#003580] text-white rounded-xl p-4 hover:bg-[#00245c] transition-colors text-center">
                <span className="font-bold text-sm">Booking.com</span>
                <span className="text-xs text-blue-200 leading-snug">
                  {lang === 'fr' ? 'Hôtels & hébergements' : 'Hotels & accommodations'}
                </span>
              </a>
              <a href={discovercarsUrl(null, lang)} target="_blank" rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-2 bg-slate-800 text-white rounded-xl p-4 hover:bg-slate-900 transition-colors text-center">
                <span className="font-bold text-sm">DiscoverCars</span>
                <span className="text-xs text-slate-300 leading-snug">
                  {lang === 'fr' ? 'Location de voiture' : 'Car rental'}
                </span>
              </a>
              <a href={gygUrl('province-de-quebec-l561', lang)} target="_blank" rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-2 bg-[#FF5533] text-white rounded-xl p-4 hover:bg-red-700 transition-colors text-center">
                <span className="font-bold text-sm">GetYourGuide</span>
                <span className="text-xs text-red-100 leading-snug">
                  {lang === 'fr' ? 'Visites & activités' : 'Tours & activities'}
                </span>
              </a>
              <a href={viatorUrl(lang)} target="_blank" rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-2 bg-[#1a1a2e] text-white rounded-xl p-4 hover:bg-[#0f0f1a] transition-colors text-center">
                <span className="font-bold text-sm">Viator</span>
                <span className="text-xs text-slate-300 leading-snug">
                  {lang === 'fr' ? 'Excursions guidées' : 'Guided excursions'}
                </span>
              </a>
            </div>
          </details>
        </div>
      </section>

      {/* ── CONTACT CTA ───────────────────────────────────────────── */}
      <section className="relative bg-quebec-navy overflow-hidden py-16 px-4">
        {/* Filigrane décoratif */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5">
          <span className="text-white font-bold" style={{ fontSize: '28rem', lineHeight: 1 }}>⚜</span>
        </div>

        <div className="relative text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-wide mb-8">
            {lang === 'fr' ? 'Une question ? Contactez-nous !'
              : lang === 'en' ? 'A question? Contact us!'
              : lang === 'es' ? '¿Una pregunta? ¡Contáctenos!'
              : lang === 'de' ? 'Eine Frage? Kontaktieren Sie uns!'
              : lang === 'pt' ? 'Uma pergunta? Contacte-nos!'
              : 'Une question ? Contactez-nous !'}
          </h2>
          <Link
            href={`/${lang}/contact`}
            className="inline-block bg-quebec-blue text-white font-bold px-10 py-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg text-sm tracking-wide"
          >
            {lang === 'fr' ? 'ACCÉDER AU FORMULAIRE DE CONTACT'
              : lang === 'en' ? 'ACCESS THE CONTACT FORM'
              : lang === 'es' ? 'ACCEDER AL FORMULARIO DE CONTACTO'
              : lang === 'de' ? 'ZUM KONTAKTFORMULAR'
              : lang === 'pt' ? 'ACEDER AO FORMULÁRIO DE CONTACTO'
              : 'ACCÉDER AU FORMULAIRE DE CONTACT'}
          </Link>
        </div>
      </section>

    </>
  )
}
