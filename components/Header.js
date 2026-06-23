'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Header({ lang, t }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const otherLang = lang === 'fr' ? 'en' : 'fr'
  const otherPath = pathname.replace(`/${lang}`, `/${otherLang}`)

  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  function openSearch() {
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
          /* Nav principale */
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href={`/${lang}`}
              className="px-4 py-2 rounded-lg text-quebec-navy hover:bg-slate-100 transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link
              href={`/${lang}/attractions`}
              className="px-4 py-2 rounded-lg text-quebec-navy hover:bg-slate-100 transition-colors"
            >
              {t.nav.attractions}
            </Link>
          </nav>
        )}

        {/* Droite : loupe + langue + CTA */}
        <div className="flex items-center gap-3 shrink-0">

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

          <Link
            href={otherPath}
            className="text-xs font-bold border border-quebec-navy/30 text-quebec-navy rounded-lg px-3 py-1.5 hover:bg-quebec-navy hover:text-white transition-colors"
          >
            {otherLang.toUpperCase()}
          </Link>
          <Link
            href={`/${lang}/attractions`}
            className="hidden sm:inline-flex items-center gap-1.5 bg-quebec-red hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {lang === 'fr' ? '200 sites' : '200 sites'}
          </Link>
        </div>

      </div>
    </header>
  )
}
