import Link from 'next/link'
import Image from 'next/image'
import { bookingRegionUrl, discovercarsUrl, gygUrl, viatorUrl } from '@/lib/affiliates'

const FB_GROUP = 'https://www.facebook.com/groups/jaimelequebec'

export default function Footer({ t, lang }) {
  return (
    <footer className="bg-quebec-navy text-slate-300">

      {/* ── Grille principale ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Identité */}
          <div className="flex flex-col gap-3">
            <Link href={`/${lang}`} className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="J'aime le Québec"
                width={180}
                height={54}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
              {t.footer?.tagline ?? "Votre guide touristique indépendant du Québec"}
            </p>
            <div className="flex gap-3 text-xs mt-1">
              <Link href={`/${lang}/a-propos`} className="text-slate-400 hover:text-white transition-colors">
                {t.footer?.about_label ?? 'À propos de nous'}
              </Link>
              <span className="text-slate-600">|</span>
              <Link href={`/${lang}/contact`} className="text-slate-400 hover:text-white transition-colors">
                {t.footer?.contact_label ?? 'Nous contacter'}
              </Link>
            </div>
          </div>

          {/* Facebook */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-xs leading-snug uppercase tracking-wide">
                  {t.footer?.facebook_title ?? "Groupe Facebook J'AIME LE QUÉBEC"}
                </p>
                <p className="text-xs text-blue-300 mt-0.5">
                  {t.footer?.facebook_sub ?? '+55 000 membres'}
                </p>
              </div>
            </div>
            <a
              href={FB_GROUP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/40 text-white font-bold text-xs px-5 py-2 rounded-full hover:bg-white hover:text-quebec-navy transition-colors"
            >
              {t.footer?.facebook_cta ?? 'NOUS REJOINDRE'}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {t.footer?.nav_label ?? 'Navigation'}
            </p>
            <ul className="space-y-2.5 text-sm">
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
                <Link href={`/${lang}/planifier`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.roadtrip ?? 'Road trip'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/articles`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.articles}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/expressions`} className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.expressions ?? 'Expressions québécoises'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Partenaires */}
          <div>
            <p className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {t.footer?.partners_label ?? 'Partenaires'}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={bookingRegionUrl(lang)} target="_blank" rel="noopener noreferrer sponsored" className="text-slate-400 hover:text-white transition-colors">
                  Booking.com
                </a>
              </li>
              <li>
                <a href={discovercarsUrl(null, lang)} target="_blank" rel="noopener noreferrer sponsored" className="text-slate-400 hover:text-white transition-colors">
                  Discovercars
                </a>
              </li>
              <li>
                <a href={gygUrl(undefined, lang)} target="_blank" rel="noopener noreferrer sponsored" className="text-slate-400 hover:text-white transition-colors">
                  GetYourGuide
                </a>
              </li>
              <li>
                <a href={viatorUrl?.(lang) ?? 'https://www.viator.com'} target="_blank" rel="noopener noreferrer sponsored" className="text-slate-400 hover:text-white transition-colors">
                  Viator
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Barre de copyright ────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <Link href={`/${lang}/mentions-legales`} className="hover:text-slate-300 transition-colors">
            {t.footer?.legal_notice_label ?? 'Mentions légales et politique de confidentialité'}
          </Link>
          <span>© {new Date().getFullYear()} — J'aime le Québec · {t.footer?.rights ?? 'Tous les droits sont réservés'}</span>
        </div>
      </div>

    </footer>
  )
}
