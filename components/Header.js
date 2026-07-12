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

const ALL_LANGS = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']
const VISIBLE_LANGS = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'zh', 'hi']
const LANG_FLAGS  = { fr: 'fr', en: 'us', es: 'es', de: 'de', pt: 'pt', ru: 'ru', zh: 'cn', hi: 'in' }
const LANG_SHORT  = { fr: 'FR', en: 'EN', es: 'ES', de: 'DE', pt: 'PT', ru: 'RU', zh: '中文', hi: 'हिं' }
const LANG_LABELS = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', pt: 'Português', ru: 'Русский', zh: '中文', hi: 'हिन्दी' }

export default function Header({ lang, t }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [menuOpen, setMenuOpen]       = useState(false)
  const [tripCount, setTripCount]     = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    setTripCount(getTripCount())
    function onUpdate() { setTripCount(getTripCount()) }
    window.addEventListener('roadtrip-updated', onUpdate)
    return () => window.removeEventListener('roadtrip-updated', onUpdate)
  }, [])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (menuOpen || searchOpen) setMenuOpen(false)
    setLangMenuOpen(false)
  }, [pathname])

  function openSearch() {
    setMenuOpen(false)
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchValue('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const q = searchValue.trim()
    if (!q) return
    closeSearch()
    router.push(`/${lang}/recherche?q=${encodeURIComponent(q)}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') closeSearch()
  }

  const isHome     = pathname === `/${lang}` || pathname === `/${lang}/`
  const isSites    = pathname.startsWith(`/${lang}/sites`) || pathname.startsWith(`/${lang}/attractions`)
  const isActiv    = pathname.startsWith(`/${lang}/activites`)
  const isArticles = pathname.startsWith(`/${lang}/articles`)
  const isPlan     = pathname.startsWith(`/${lang}/planifier`)

  const navLinkClass = (active) =>
    `px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
      active
        ? 'bg-quebec-blue/10 text-quebec-blue font-semibold'
        : 'text-quebec-navy hover:bg-slate-100'
    }`

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center hover:opacity-90 transition-opacity shrink-0">
          <Image
            src="/images/logo.png"
            alt="J'aime le Québec"
            width={320}
            height={96}
            className="h-20 w-auto"
            priority
          />
        </Link>

        {/* Barre de recherche (inline, remplace la nav quand active) */}
        {searchOpen ? (
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.nav.search_placeholder}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quebec-blue"
            />
            <button
              type="submit"
              className="bg-quebec-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-quebec-blue transition-colors"
            >
              {t.nav.search_label}
            </button>
            <button
              type="button"
              onClick={closeSearch}
              className="text-gray-400 hover:text-gray-700 transition-colors p-2"
              aria-label="Fermer la recherche"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        ) : (
          /* Nav principale — desktop */
          <nav className="hidden md:flex items-center gap-1">
            <Link href={`/${lang}`} className={navLinkClass(isHome)}>
              {t.nav.home}
            </Link>
            <Link href={`/${lang}/sites`} className={navLinkClass(isSites)}>
              {t.nav.attractions}
            </Link>
            <Link href={`/${lang}/activites`} className={navLinkClass(isActiv)}>
              {t.nav.activities}
            </Link>
            <Link href={`/${lang}/articles`} className={navLinkClass(isArticles)}>
              {t.nav.articles}
            </Link>
            <Link href={`/${lang}/planifier`} className={`relative ${navLinkClass(isPlan)}`}>
              {t.planifier?.nav_title ?? 'Road trip'}
              {tripCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-quebec-blue text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {tripCount > 9 ? '9+' : tripCount}
                </span>
              )}
            </Link>
          </nav>
        )}

        {/* Droite : loupe + langue + CTA + hamburger */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Loupe */}
          {!searchOpen && (
            <button
              onClick={openSearch}
              aria-label={t.nav.search_label}
              className="flex items-center gap-1.5 text-quebec-navy hover:text-white hover:bg-quebec-navy transition-colors px-3 py-2 rounded-lg border border-quebec-navy/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <span className="text-xs font-semibold hidden sm:inline">{t.nav.search_label}</span>
            </button>
          )}

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

          {/* Hamburger — mobile uniquement */}
          {!searchOpen && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="md:hidden p-2 text-quebec-navy hover:bg-slate-100 rounded-lg transition-colors"
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
          )}
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            <Link
              href={`/${lang}`}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 border-b border-gray-100 text-base font-medium ${isHome ? 'text-quebec-blue' : 'text-quebec-navy'}`}
            >
              {t.nav.home}
            </Link>
            <Link
              href={`/${lang}/sites`}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 border-b border-gray-100 text-base font-medium ${isSites ? 'text-quebec-blue' : 'text-quebec-navy'}`}
            >
              {t.nav.attractions}
            </Link>
            <Link
              href={`/${lang}/activites`}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 border-b border-gray-100 text-base font-medium ${isActiv ? 'text-quebec-blue' : 'text-quebec-navy'}`}
            >
              {t.nav.activities}
            </Link>
            <Link
              href={`/${lang}/articles`}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 border-b border-gray-100 text-base font-medium ${isArticles ? 'text-quebec-blue' : 'text-quebec-navy'}`}
            >
              {t.nav.articles}
            </Link>
            <Link
              href={`/${lang}/planifier`}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 text-base font-medium flex items-center justify-between ${isPlan ? 'text-quebec-blue' : 'text-quebec-navy'}`}
            >
              <span>{t.planifier?.nav_title ?? 'Road trip'}</span>
              {tripCount > 0 && (
                <span className="bg-quebec-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {tripCount} étape{tripCount > 1 ? 's' : ''}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
