import Link from 'next/link'

const FB_GROUP = 'https://www.facebook.com/groups/jaimelequebec'

export default function Footer({ t, lang }) {

  return (
    <footer className="bg-quebec-navy text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Encart Facebook */}
        <a
          href={FB_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-blue-700/30 hover:bg-blue-700/50 border border-blue-500/30 rounded-2xl px-6 py-4 mb-10 transition-colors group"
        >
          <svg className="shrink-0 w-9 h-9 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-snug">
              {t.footer.facebook_title ?? "Groupe Facebook — J'aime le Québec"}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              {t.footer.facebook_sub ?? '57 000 passionnés du Québec · Rejoignez-nous'}
            </p>
          </div>
          <span className="shrink-0 text-blue-300 group-hover:text-white transition-colors text-sm font-semibold">
            {t.footer.facebook_cta ?? 'Rejoindre →'}
          </span>
        </a>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Identité */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl font-bold text-white mb-2">
              <span className="text-quebec-red">J'aime</span> le Québec
            </p>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{t.footer.tagline}</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              {t.footer.nav_label ?? 'Navigation'}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/sites`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.attractions}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/activites`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.activities}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/articles`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.articles}
                </Link>
              </li>
            </ul>
          </div>

          {/* Partenaires */}
          <div>
            <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              {t.footer.partners_label ?? 'Partenaires'}
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Booking.com</li>
              <li>GetYourGuide</li>
              <li>Viator</li>
              <li>DiscoverCars</li>
            </ul>
          </div>

          {/* Légal & contact */}
          <div>
            <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              {t.footer.legal_label ?? 'Informations'}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/contact`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.contact_label ?? 'Contact'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/a-propos`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.about_label ?? 'À propos'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/mentions-legales`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.legal_notice_label ?? 'Mentions légales'}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-slate-500 text-center">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  )
}
