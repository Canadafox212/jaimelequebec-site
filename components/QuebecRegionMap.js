'use client'
import { useState } from 'react'

const ALPHA_REGIONS = [
  { num: 17, label: 'Abitibi-Témiscamingue' },
  { num: 5,  label: 'Bas-Saint-Laurent' },
  { num: 8,  label: "Cantons-de-l'Est" },
  { num: 15, label: 'Centre-du-Québec' },
  { num: 3,  label: 'Charlevoix' },
  { num: 14, label: 'Chaudière-Appalaches' },
  { num: 7,  label: 'Côte-Nord' },
  { num: 4,  label: 'Gaspésie' },
  { num: 16, label: 'Îles-de-la-Madeleine' },
  { num: 11, label: 'Lanaudière' },
  { num: 12, label: 'Laurentides' },
  { num: 19, label: 'Laval' },
  { num: 10, label: 'Mauricie' },
  { num: 13, label: 'Montérégie' },
  { num: 1,  label: 'Montréal' },
  { num: 18, label: 'Nord-du-Québec' },
  { num: 9,  label: 'Outaouais' },
  { num: 2,  label: 'Québec (Capitale-Nationale)' },
  { num: 6,  label: 'Saguenay–Lac-Saint-Jean' },
]

const REGION_COLORS = {
  1:  '#B71C1C',
  2:  '#1B5E20',
  3:  '#2E7D32',
  4:  '#00838F',
  5:  '#1565C0',
  6:  '#0D47A1',
  7:  '#006064',
  8:  '#6A1B9A',
  9:  '#004D40',
  10: '#C62828',
  11: '#0277BD',
  12: '#4527A0',
  13: '#558B2F',
  14: '#E65100',
  15: '#F9A825',
  16: '#00838F',
  17: '#D84315',
  18: '#37474F',
  19: '#E91E63',
}

function mapSrc(alphaIdx) {
  return `/maps/r${String(alphaIdx).padStart(2, '0')}.png`
}

export default function QuebecRegionMap({ regionNum }) {
  const [open, setOpen] = useState(false)
  const idx = ALPHA_REGIONS.findIndex(r => r.num === regionNum)
  const alphaNum = idx >= 0 ? idx + 1 : null
  const regionLabel = idx >= 0 ? ALPHA_REGIONS[idx].label : ''
  const color = REGION_COLORS[regionNum] || '#1e3a5f'
  const src = alphaNum ? mapSrc(alphaNum) : null

  if (!src) return null

  return (
    <>
      {/* Vignette cliquable */}
      <button
        onClick={() => setOpen(true)}
        title="Carte de la région"
        aria-label="Voir la carte de la région"
        style={{
          width: 160, height: 120, flexShrink: 0, padding: 0,
          border: `2px solid ${color}`, borderRadius: 8,
          overflow: 'hidden', cursor: 'pointer', position: 'relative',
          display: 'block', background: '#f0f4f8',
        }}
      >
        <img
          src={src}
          alt={`Carte ${regionLabel}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
        <div style={{
          position: 'absolute', bottom: 4, right: 4,
          background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '3px 5px',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </div>
      </button>

      {/* Popup plein écran */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={() => setOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
          }} />
          <div style={{
            position: 'relative', zIndex: 1, background: 'white', borderRadius: 16,
            width: '90vw', maxWidth: 900, height: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            {/* En-tête */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px', background: color, color: 'white', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                  Régions touristiques du Québec
                </div>
                {regionLabel && (
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                    {alphaNum}. {regionLabel}
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer" style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* Carte image */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#f8fafc' }}>
              <img
                src={src}
                alt={`Carte de la région ${regionLabel}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
