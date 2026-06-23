'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header({ lang, t }) {
  const pathname  = usePathname()
  const otherLang = lang === 'fr' ? 'en' : 'fr'
  const otherPath = pathname.replace(`/${lang}`, `/${otherLang}`)

  return (
    <header className="bg-quebec-navy text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-1.5 font-display font-bold text-xl tracking-tight hover:opacity-90 transition-opacity shrink-0">
          <span className="text-quebec-red">J'aime</span>
          <span className="text-white">le Québec</span>
        </Link>

        {/* Nav principale */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href={`/${lang}`}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {t.nav.home}
          </Link>
          <Link
            href={`/${lang}/attractions`}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {t.nav.attractions}
          </Link>
        </nav>

        {/* Droite : langue + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={otherPath}
            className="text-xs font-bold border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white hover:text-quebec-navy transition-colors"
          >
            {otherLang.toUpperCase()}
          </Link>
          <Link
            href={`/${lang}/attractions`}
            className="hidden sm:inline-flex items-center gap-1.5 bg-quebec-red hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {lang === 'fr' ? '200 attractions' : '200 attractions'}
          </Link>
        </div>

      </div>
    </header>
  )
}
