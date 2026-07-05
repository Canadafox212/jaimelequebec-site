'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function RegionImageBanner({ src, alt }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bouton d'agrandissement sur l'image */}
      <button
        onClick={() => setOpen(true)}
        className="absolute inset-0 w-full h-full cursor-zoom-in group focus:outline-none"
        aria-label={`Agrandir la photo : ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          sizes="100vw"
        />
        {/* Icône loupe en survol */}
        <span className="absolute top-3 right-3 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center text-base opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ⛶
        </span>
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold w-10 h-10 flex items-center justify-center hover:text-gray-300 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          >
            ✕
          </button>
          <div
            className="relative max-w-5xl w-full max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white/70 text-sm text-center mt-3">{alt}</p>
          </div>
        </div>
      )}
    </>
  )
}
