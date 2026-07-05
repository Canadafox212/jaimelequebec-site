'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Mascot({ lang }) {
  const [hovered, setHovered] = useState(false)
  const bubble = lang === 'fr' ? 'Explorez le Québec !' : 'Explore Québec!'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">

      {/* Bulle au survol */}
      <div className={`pointer-events-none bg-white text-quebec-navy text-xs font-semibold px-3 py-2 rounded-2xl rounded-br-sm shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-300 ${
        hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        {bubble}
      </div>

      {/* Mascotte → page /decouvrir */}
      <Link
        href={`/${lang}/decouvrir`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Découvrir le Québec"
        className="pointer-events-auto w-24 h-24 rounded-full overflow-hidden shadow-xl border-2 border-white hover:scale-110 active:scale-95 transition-transform duration-300"
      >
        <Image
          src="/images/mascot.png"
          alt="Raton laveur mascotte J'aime le Québec"
          width={200}
          height={200}
          className="w-full h-full object-cover object-top"
          priority
        />
      </Link>
    </div>
  )
}
