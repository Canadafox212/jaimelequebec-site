'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const LS_KEY = 'jmlq_roadtrip'
function getTripCount() {
  try {
    const trip = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
    return trip?.stops?.length ?? 0
  } catch { return 0 }
}

const VISIBLE_LANGS = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'hi']
const LANG_FLAGS  = { fr: 'fr', en: 'us', es: 'es', de: 'de', it: 'it', pt: 'pt', ru: 'ru', zh: 'cn', hi: 'in' }
const LANG_SHORT  = { fr: 'FR', en: 'EN', es: 'ES', de: 'DE', it: 'IT', pt: 'PT', ru: 'RU', zh: '中文', hi: 'हिं' }
const LANG_LABELS = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', ru: 'Русский', zh: '中文', hi: 'हिन्दी' }

export default function Header({ lang, t }) {
  const pathname      = usePathname()
  const router        = useRouter()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [searchValue, setSearchValue]   = useState('')
  const [menuOpen, setMenuOpen]         = useState(false)
  const [tripCount, setTripCount]       = useState(0)
  const desktopInputRef = useRef(null)

  useEffect(() => {
    setTripCount(getTripCount())
    function onUpdate() { setTripCount(getTripCount()) }
    window.addEventListener('roadtrip-updated', onUpdate)
    return () => window.removeEventListener('roadtrip-updated', onUpdate)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setLangMenuOpen(false)
  }, [pathname])

  function handleSubmit(e) {
    e.preventDefault()
    const q = searchValue.trim()
    if (!q) return
    setSearchValue('')
    router.push(`/${lang}/recherche?q=${encodeURIComponent(q)}`)
  }

  const isHome     = pathname === `/${lang}` || pathname === `/${lang}/`
  const isSites    = pathname.startsWith(`/${lang}/sites`) || pathname.startsWith(`/${lang}/attractions`)
  const isActiv    = pathname.startsWith(`/${lang}/activites`)
  const isArticles = pathname.startsWith(`/${lang}/articles`)
  const isPlan     = pathname.startsWith(`/${lang}/planifier`)
  const isExpr     = pathname.startsWith(`/${lang}/expressions`)
  const isAnimaux  = pathname.startsWith(`/${lang}/animaux`)

  const navLinkClass = (active) =>
    `px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap ${
      active
        ? 'bg-quebec-blue/10 text-quebec-blue'
        : 'text-quebec-navy hover:bg-slate-100'
    }`

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">

        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center hover:opacity-90 transition-opacity shrink-0">
          <Image
            src="/images/logo.png"
            alt="J'aime le Québec"
            width={280}
            height={84}
            className="h-16 w-auto"
            priority
          />
        </Link>

        {/* Nav principale — desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <Link href={`/${lang}`} className={navLinkClass(isHome)}>
            {t.nav.home}
          </Link>
          <Link href={`/${lang}/sites`} className={navLinkClass(isSites)}>
            {t.nav.attractions}
          </Link>
          <Link href={`/${lang}/activites`} className={navLinkClass(isActiv)}>
            {t.nav.activities}
          </Link>
          <Link href={`/${lang}/planifier`} className={`relative ${navLinkClass(isPlan)}`}>
            {t.nav.roadtrip ?? 'Road trip'}
            {tripCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-quebec-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {tripCount > 9 ? '9+' : tripCount}
              </span>
            )}
          </Link>
          <Link href={`/${lang}/articles`} className={navLinkClass(isArticles)}>
            {t.nav.articles}
          </Link>
          <Link href={`/${lang}/expressions`} className={navLinkClass(isExpr)}>
            {t.nav.expressions ?? 'Expressions'}
          </Link>
          <Link href={`/${lang}/animaux`} className={navLinkClass(isAnimaux)}>
            🐕 {t.nav.animaux ?? 'Voyager avec son chien'}
          </Link>
        </nav>

        {/* Droite : recherche toujours visible + langue + hamburger */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">

          {/* Champ de recherche permanent — desktop */}
          <form
            onSubmit={handleSubmit}
            className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-50 hover:border-quebec-blue focus-within:border-quebec-blue focus-within:ring-1 focus-within:ring-quebec-blue/30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
            <input
              ref={desktopInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t.nav.search_label}
              className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-24 focus:w-36 transition-all duration-200"
            />
          </form>

          {/* Sélecteur de langue */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="border border-quebec-navy/30 text-quebec-navy rounded-lg px-2.5 py-1.5 hover:bg-quebec-navy hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className={`fi fi-${LANG_FLAGS[lang]} rounded-sm`} style={{width:'18px',height:'13px',display:'inline-block'}} />
              <span className="text-xs font-bold">{LANG_SHORT[lang]}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 min-w-[90px]">
                {VISIBLE_LANGS.map((l) => (
                  <Link
                    key={l}
                    href={pathname.replace(`/${lang}`, `/${l}`)}
                    onClick={() => setLangMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${l === lang ? 'text-quebec-blue bg-blue-50' : 'text-quebec-navy'}`}
                  >
                    <span className={`fi fi-${LANG_FLAGS[l]} rounded-sm`} style={{width:'20px',height:'15px',display:'inline-block'}} />
                    {LANG_LABELS[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger — mobile/tablet */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="lg:hidden p-2 text-quebec-navy hover:bg-slate-100 rounded-lg transition-colors"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          {/* Recherche mobile */}
          <form onSubmit={handleSubmit} className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-quebec-blue">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t.nav.search_placeholder}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </form>
          <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            <Link href={`/${lang}`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold ${isHome ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              {t.nav.home}
            </Link>
            <Link href={`/${lang}/sites`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold ${isSites ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              {t.nav.attractions}
            </Link>
            <Link href={`/${lang}/activites`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold ${isActiv ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              {t.nav.activities}
            </Link>
            <Link href={`/${lang}/planifier`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold flex items-center justify-between ${isPlan ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              <span>{t.nav.roadtrip ?? 'Road trip'}</span>
              {tripCount > 0 && (
                <span className="bg-quebec-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {tripCount}
                </span>
              )}
            </Link>
            <Link href={`/${lang}/articles`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold ${isArticles ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              {t.nav.articles}
            </Link>
            <Link href={`/${lang}/expressions`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 border-b border-gray-100 text-sm font-semibold ${isExpr ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              {t.nav.expressions ?? 'Expressions québécoises'}
            </Link>
            <Link href={`/${lang}/animaux`} onClick={() => setMenuOpen(false)} className={`py-3 px-2 text-sm font-semibold ${isAnimaux ? 'text-quebec-blue' : 'text-quebec-navy'}`}>
              🐕 {t.nav.animaux ?? 'Voyager avec son chien'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
