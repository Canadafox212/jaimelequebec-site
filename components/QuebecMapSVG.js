'use client'

// Carte SVG simplifiée du Québec — 19 régions touristiques colorées et cliquables
// Coordonnées approximatives, géographiquement inspirées

const REGIONS = [
  {
    num: 18, nom: 'Nord-du-Québec', short: 'Nord-QC', color: '#37474F',
    // Vaste territoire nord — bande supérieure pleine largeur
    d: 'M 5,5 L 475,5 L 475,175 L 420,185 L 350,180 L 270,185 L 200,180 L 130,185 L 60,180 L 5,185 Z',
    labelX: 240, labelY: 85,
  },
  {
    num: 17, nom: 'Abitibi-Témiscamingue', short: 'Abitibi', color: '#BF360C',
    // Extrême nord-ouest, sous Nord-du-QC
    d: 'M 5,185 L 130,185 L 135,370 L 80,378 L 5,372 Z',
    labelX: 62, labelY: 280,
  },
  {
    num: 9, nom: 'Outaouais', short: 'Outaouais', color: '#1A237E',
    // Vallée de l'Outaouais, bas gauche
    d: 'M 5,372 L 80,378 L 92,408 L 87,445 L 60,462 L 5,457 Z',
    labelX: 44, labelY: 415,
  },
  {
    num: 6, nom: 'Saguenay–Lac-Saint-Jean', short: 'Saguenay', color: '#1565C0',
    // Grand territoire central sous Nord-du-QC
    d: 'M 130,185 L 310,180 L 315,255 L 278,290 L 234,305 L 190,308 L 158,290 L 132,260 L 118,228 L 130,185 Z',
    labelX: 216, labelY: 245,
  },
  {
    num: 7, nom: 'Côte-Nord', short: 'Côte-Nord', color: '#006064',
    // Rive nord du Saint-Laurent, nord-est
    d: 'M 310,180 L 475,175 L 475,345 L 432,360 L 378,355 L 330,332 L 310,298 L 308,258 L 315,255 L 310,180 Z',
    labelX: 392, labelY: 262,
  },
  {
    num: 12, nom: 'Laurentides', short: 'Laurentides', color: '#4A148C',
    // Nord de Montréal, ouest
    d: 'M 80,378 L 135,370 L 162,365 L 167,400 L 152,428 L 122,435 L 90,430 L 87,408 L 92,408 L 80,378 Z',
    labelX: 122, labelY: 402,
  },
  {
    num: 11, nom: 'Lanaudière', short: 'Lanaudière', color: '#0277BD',
    // Nord-est de Montréal
    d: 'M 162,365 L 220,360 L 228,395 L 214,425 L 182,432 L 167,418 L 167,400 L 162,365 Z',
    labelX: 192, labelY: 395,
  },
  {
    num: 10, nom: 'Mauricie', short: 'Mauricie', color: '#880E4F',
    // Centre du Québec, corridor Saint-Laurent
    d: 'M 132,260 L 190,308 L 234,305 L 268,295 L 272,332 L 255,355 L 228,362 L 220,360 L 162,365 L 135,370 L 130,330 L 130,295 L 132,260 Z',
    labelX: 196, labelY: 330,
  },
  {
    num: 3, nom: 'Charlevoix', short: 'Charlevoix', color: '#2E7D32',
    // Nord-est de Québec, rive nord
    d: 'M 278,290 L 310,298 L 330,332 L 308,352 L 286,360 L 270,348 L 265,325 L 278,290 Z',
    labelX: 296, labelY: 328,
  },
  {
    num: 2, nom: 'Québec', short: 'Québec', color: '#4E342E',
    // Capitale nationale, région de Québec
    d: 'M 234,305 L 278,290 L 265,325 L 270,348 L 262,370 L 244,382 L 228,382 L 218,368 L 214,350 L 228,362 L 255,355 L 272,332 L 268,295 L 234,305 Z',
    labelX: 250, labelY: 350,
  },
  {
    num: 14, nom: 'Chaudière-Appalaches', short: 'Chaudière', color: '#E65100',
    // Rive sud, face à Québec
    d: 'M 228,382 L 262,370 L 278,380 L 285,405 L 268,422 L 248,425 L 235,415 L 228,400 L 228,382 Z',
    labelX: 256, labelY: 400,
  },
  {
    num: 15, nom: 'Centre-du-Québec', short: 'Centre-QC', color: '#F9A825',
    // Entre Montréal et Québec, rive sud
    d: 'M 182,432 L 214,425 L 228,400 L 235,415 L 225,435 L 210,448 L 190,450 L 175,440 L 182,432 Z',
    labelX: 204, labelY: 435,
  },
  {
    num: 5, nom: 'Bas-Saint-Laurent', short: 'Bas-St-L.', color: '#00695C',
    // Rive sud du Saint-Laurent, est
    d: 'M 278,380 L 330,365 L 370,372 L 368,400 L 342,418 L 305,425 L 285,415 L 285,405 L 278,380 Z',
    labelX: 325, labelY: 398,
  },
  {
    num: 4, nom: 'Gaspésie', short: 'Gaspésie', color: '#558B2F',
    // Péninsule gaspésienne, est
    d: 'M 370,372 L 432,360 L 475,345 L 475,430 L 455,450 L 425,462 L 390,458 L 360,440 L 355,415 L 368,400 L 370,372 Z',
    labelX: 418, labelY: 415,
  },
  {
    num: 13, nom: 'Montérégie', short: 'Montérégie', color: '#827717',
    // Rive sud, sud de Montréal (frontière US)
    d: 'M 87,445 L 122,435 L 152,428 L 167,418 L 175,440 L 170,470 L 150,485 L 110,490 L 80,482 L 75,462 L 87,445 Z',
    labelX: 125, labelY: 462,
  },
  {
    num: 8, nom: "Cantons-de-l'Est", short: 'Cantons-Est', color: '#6A1B9A',
    // Sud-est, frontières US et NB
    d: 'M 175,440 L 210,448 L 225,435 L 240,442 L 248,468 L 235,488 L 210,498 L 185,492 L 170,475 L 170,470 L 175,440 Z',
    labelX: 205, labelY: 468,
  },
  {
    num: 1, nom: 'Montréal', short: 'Montréal', color: '#B71C1C',
    // Île de Montréal
    d: 'M 87,445 L 112,442 L 120,456 L 110,468 L 88,466 L 80,456 L 87,445 Z',
    labelX: 100, labelY: 456,
  },
  {
    num: 19, nom: 'Laval', short: 'Laval', color: '#E91E63',
    // Au nord de l'île de Montréal, petite région
    d: 'M 112,435 L 132,432 L 138,445 L 128,454 L 112,452 L 110,442 L 112,435 Z',
    labelX: 124, labelY: 444,
  },
  {
    num: 16, nom: 'Îles-de-la-Madeleine', short: 'Îles-Mad.', color: '#00838F',
    // Archipel dans le golfe — représenté hors continent
    d: 'M 420,470 L 448,464 L 458,478 L 448,492 L 422,490 L 414,478 Z',
    labelX: 436, labelY: 479,
  },
]

export default function QuebecMapSVG({ lang, onRegionClick }) {
  return (
    <svg
      viewBox="0 0 480 510"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Carte des régions touristiques du Québec"
    >
      {/* Fond océan/territoire */}
      <rect x="0" y="0" width="480" height="510" fill="#e8f4f8" rx="8" />

      {/* Régions */}
      {REGIONS.map((r) => (
        <g
          key={r.num}
          onClick={() => onRegionClick(r.num)}
          className="cursor-pointer group"
          role="button"
          aria-label={r.nom}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onRegionClick(r.num)}
        >
          <path
            d={r.d}
            fill={r.color}
            stroke="white"
            strokeWidth="1.5"
            opacity="0.85"
            className="transition-opacity hover:opacity-100"
          />
          {/* Étiquette */}
          <text
            x={r.labelX}
            y={r.labelY}
            textAnchor="middle"
            fontSize={r.num === 18 ? '11' : r.num === 1 || r.num === 19 || r.num === 16 ? '6.5' : '8'}
            fontWeight="bold"
            fill="white"
            pointerEvents="none"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', userSelect: 'none' }}
          >
            {r.short}
          </text>
          {/* Numéro sous le nom pour les grandes régions */}
          {r.num !== 1 && r.num !== 19 && r.num !== 16 && (
            <text
              x={r.labelX}
              y={r.labelY + (r.num === 18 ? 13 : 10)}
              textAnchor="middle"
              fontSize="7"
              fill="rgba(255,255,255,0.7)"
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {r.num}
            </text>
          )}
        </g>
      ))}

      {/* Légende Îles-Madeleine */}
      <text x="420" y="460" textAnchor="middle" fontSize="6" fill="#555">archipel</text>
    </svg>
  )
}
