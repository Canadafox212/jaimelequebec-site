'use client'
import { useState, useRef, useEffect } from 'react'

export default function RegionDescription({ text, lang }) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      setOverflows(ref.current.scrollHeight > ref.current.clientHeight + 4)
    }
  }, [text])

  if (!text) return null

  return (
    <div className="mb-4">
      <div
        ref={ref}
        className={`text-gray-700 text-sm leading-relaxed${!expanded ? ' line-clamp-4' : ''}`}
      >
        {text}
      </div>
      {overflows && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-quebec-blue text-sm font-medium mt-1 hover:underline"
        >
          {lang === 'fr' ? 'Lire la suite…' : 'Read more…'}
        </button>
      )}
    </div>
  )
}
