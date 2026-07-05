'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const DISMISSED_KEY  = 'jlq:installPromptDismissed'
const PAGEVIEWS_KEY  = 'jlq:installPromptPageviews'
const COOLDOWN_MS    = 30 * 24 * 60 * 60 * 1000  // 30 days
const MIN_PAGES      = 3
const MIN_DELAY_MS   = 45_000  // 45 s if < MIN_PAGES seen

const TEXTS = {
  fr: {
    cta:     "Ajoutez J'aime le Québec à votre écran d'accueil",
    install: 'Installer',
    later:   'Plus tard',
    ios_hint:'Appuyez sur le bouton Partage \u{1F4E4} puis « Sur l\'écran d\'accueil »',
  },
  en: {
    cta:     "Add J'aime le Québec to your home screen",
    install: 'Install',
    later:   'Later',
    ios_hint:'Tap the Share button \u{1F4E4} then "Add to Home Screen"',
  },
  es: {
    cta:     "Añade J'aime le Québec a tu pantalla de inicio",
    install: 'Instalar',
    later:   'Más tarde',
    ios_hint:'Toca el botón Compartir \u{1F4E4} y luego «En la pantalla de inicio»',
  },
  de: {
    cta:     "Füge J'aime le Québec zu deinem Startbildschirm hinzu",
    install: 'Installieren',
    later:   'Später',
    ios_hint:'Tippe auf Teilen \u{1F4E4} und dann auf „Zum Home-Bildschirm"',
  },
  pt: {
    cta:     "Adicione J'aime le Québec à sua tela inicial",
    install: 'Instalar',
    later:   'Mais tarde',
    ios_hint:'Toque em Compartilhar \u{1F4E4} e depois em «Tela de início»',
  },
  ru: {
    cta:     "Добавьте J'aime le Québec на экран",
    install: 'Установить',
    later:   'Позже',
    ios_hint:'Нажмите кнопку «Поделиться» \u{1F4E4} затем «На экран «Домой»»',
  },
  zh: {
    cta:     "将 J'aime le Québec 添加到主屏幕",
    install: '安装',
    later:   '稍后',
    ios_hint:'点按分享按钮 \u{1F4E4}，然后选择「添加到主屏幕」',
  },
  hi: {
    cta:     "J'aime le Québec को अपनी होम स्क्रीन में जोड़ें",
    install: 'इंस्टॉल करें',
    later:   'बाद में',
    ios_hint:'शेयर बटन \u{1F4E4} दबाएं, फिर «होम स्क्रीन में जोड़ें» चुनें',
  },
}

export default function InstallPrompt({ lang = 'fr' }) {
  const [show,  setShow]  = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredRef = useRef(null)

  useEffect(() => {
    // Already installed as standalone — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (navigator.standalone) return  // iOS Safari legacy check

    // Dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < COOLDOWN_MS) return

    // Track page views in session
    const pv = Number(sessionStorage.getItem(PAGEVIEWS_KEY) || 0) + 1
    sessionStorage.setItem(PAGEVIEWS_KEY, String(pv))

    // iOS detection (no beforeinstallprompt support)
    const ua  = navigator.userAgent || ''
    const ios = /iphone|ipad|ipod/i.test(ua) && !/chrome/i.test(ua)
    setIsIOS(ios)

    if (ios) {
      // Show after MIN_PAGES views or MIN_DELAY_MS delay
      if (pv >= MIN_PAGES) {
        setTimeout(() => setShow(true), 1500)
      } else {
        setTimeout(() => setShow(true), MIN_DELAY_MS)
      }
      return
    }

    // Android Chrome / Edge: capture deferred prompt
    // The prompt may have been captured before this component mounted (see layout script)
    const bip = window.__bip
    if (bip) {
      deferredRef.current = bip
      window.__bip = null
      scheduleShow(pv)
      return
    }

    // Listen if not yet fired
    const handler = (e) => {
      e.preventDefault()
      deferredRef.current = e
      scheduleShow(pv)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)

    function scheduleShow(pv) {
      if (pv >= MIN_PAGES) setShow(true)
      else setTimeout(() => setShow(true), MIN_DELAY_MS)
    }
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  async function install() {
    const prompt = deferredRef.current
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      deferredRef.current = null
      // Future: analytics pwa_installed / pwa_dismissed
      void outcome
    }
    setShow(false)
  }

  if (!show) return null

  const tx = TEXTS[lang] ?? TEXTS.fr

  return (
    <div
      role="dialog"
      aria-label={tx.cta}
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
    >
      <div className="bg-quebec-navy text-white shadow-xl px-4 py-3 flex items-center gap-3">
        {/* Logo raton */}
        <div className="shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="J'aime le Québec"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{tx.cta}</p>
          {isIOS && (
            <p className="text-xs text-blue-200 mt-0.5">{tx.ios_hint}</p>
          )}
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={install}
              className="bg-white text-quebec-navy text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
            >
              {tx.install}
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label={tx.later}
            className="text-blue-300 hover:text-white text-xs underline transition-colors"
          >
            {isIOS ? tx.later : '✕'}
          </button>
        </div>
      </div>
    </div>
  )
}
