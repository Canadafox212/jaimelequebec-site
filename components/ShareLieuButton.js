'use client'
import { useState } from 'react'

export default function ShareLieuButton({ slug, title, lang, t }) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const shareUrl = `https://jaimelequebec.com/go/share-${slug}`
  const s = t.detail.share

  async function handleShare() {
    const shareData = {
      title: `${title} — J'aime le Québec`,
      text: `${s.message}${title} 🍁`,
      url: shareUrl,
    }

    console.log('place_shared', { slug, lang })

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err)
      }
      return
    }

    // Fallback : presse-papier
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setShowModal(true)
    }
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={handleShare}
          className="flex items-center gap-2.5 border-2 border-quebec-navy text-quebec-navy bg-white hover:bg-blue-50 active:scale-95 transition-all font-semibold px-6 py-3 rounded-3xl min-h-[48px] text-sm"
        >
          <span aria-hidden>🏞️</span>
          <span className="hidden sm:inline">{s.button}</span>
          <span className="sm:hidden">{s.button_short}</span>
        </button>

        {/* Toast "Copié !" */}
        {copied && (
          <div className="absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
            ✓ {s.fallback_copied}
          </div>
        )}
      </div>

      {/* Modal fallback ultime (clipboard API refusée) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="font-bold text-gray-900 mb-1 text-base">{s.fallback_title}</p>
            <p className="text-xs text-gray-400 mb-4">{s.fallback_copy}</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-sm text-gray-700 break-all flex-1 select-all">{shareUrl}</span>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-quebec-navy text-white font-bold py-3 rounded-xl text-sm hover:bg-quebec-blue transition-colors"
            >
              {s.fallback_copy}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
