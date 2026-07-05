/**
 * generate-maps.mjs
 * Génère 17 images de carte régionale du Québec:
 * - La région cible est colorée avec la couleur choisie
 * - Les autres régions sont converties en gris
 * - L'eau, les frontières et les territoires étrangers restent intacts
 *
 * Utilise un flood-fill depuis un point-graine pour identifier chaque région
 * (nécessaire car plusieurs régions partagent la même couleur sur la carte touristique).
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const OUT_DIR = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/jaimelequebec-site/public/maps'

const { data: raw, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const data = new Uint8ClampedArray(raw)  // copy for non-destructive processing

console.log(`Image chargée: ${width}×${height}px`)

// ─── Utilitaires pixels ───────────────────────────────────────────
function idx(x, y) { return (y * width + x) * channels }
function getRGB(x, y) { const i=idx(x,y); return [data[i],data[i+1],data[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function dist([r1,g1,b1],[r2,g2,b2]) {
  return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2)
}

// ─── Pixels à NE PAS retoucher (eau, bordure, territoire étranger) ──
function isPreserved([r,g,b]) {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
  // blanc quasi-pur (fond de la carte)
  if (mn > 240) return true
  // noir (texte/bordures fines)
  if (mx < 25) return true
  // vert bordure extérieure #64cb64
  if (g > 190 && r < 120 && b < 120 && g > r+80 && g > b+80) return true
  // eau Gulf #003aa6
  if (b > 140 && r < 40 && g < 80) return true
  // eau fleuve #9cf7f7 (cyan clair)
  if (b > 200 && r > 140 && g > 230 && b > g-30) return true
  // territoire étranger gris (#9f9f9f ± 35)
  if (mx-mn < 20 && r > 130 && r < 200) return true
  // fond carte gris clair (#e7e7e7 = Gulf background)
  if (mn > 220 && mx-mn < 20) return true
  return false
}

// ─── Flood-fill BFS ──────────────────────────────────────────────
const TOLERANCE = 22  // différence max (sum of channels) pour considérer même région

function floodFill(seedX, seedY) {
  const seedColor = getRGB(seedX, seedY)
  const visited = new Uint8Array(width * height)
  const pixels = []
  const queue = [[seedX, seedY]]
  visited[seedY * width + seedX] = 1

  const dx = [1,-1,0,0]
  const dy = [0,0,1,-1]

  while (queue.length > 0) {
    const [x, y] = queue.shift()
    pixels.push([x, y])

    for (let d = 0; d < 4; d++) {
      const nx = x + dx[d], ny = y + dy[d]
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      const ni = ny * width + nx
      if (visited[ni]) continue
      visited[ni] = 1

      const nc = getRGB(nx, ny)
      if (isPreserved(nc)) continue  // ne pas traverser eau/frontière
      if (dist(nc, seedColor) <= TOLERANCE) {
        queue.push([nx, ny])
      }
    }
  }
  return pixels
}

// ─── Configuration des 17 cartes (numérotation ALPHA 1-19) ────────
// Chaque entrée: { id, seeds, color }
// id = nom du fichier (r01, r02, ..., r05-18, r08-09)
// seeds = tableau de [x,y] points-graines
// color = couleur hex choisie pour la région
const MAPS = [
  {
    id: 'r01',  // Abitibi-Témiscamingue
    seeds: [[165, 490], [120, 520], [200, 450]],
    color: '#D84315',  // orange brûlé - terres minières
  },
  {
    id: 'r02',  // Bas-Saint-Laurent
    seeds: [[740, 500], [770, 490], [760, 510]],
    color: '#1565C0',  // bleu profond - rive du fleuve
  },
  {
    id: 'r03',  // Cantons-de-l'Est
    seeds: [[490, 690], [470, 705], [510, 685]],
    // Note: si ces seeds donnent #b5dead (Abitibi), on ajuste
    color: '#8E24AA',  // violet - vignobles et automne
  },
  {
    id: 'r04',  // Centre-du-Québec
    seeds: [[450, 690], [430, 695], [460, 685]],
    color: '#F9A825',  // ambre - terres agricoles
  },
  {
    id: 'r05-18',  // Charlevoix + Capitale-Nationale
    seeds: [[590, 540], [620, 510], [560, 560]],
    color: '#1B5E20',  // vert forêt - vallée Charlevoix + vieille capitale
  },
  {
    id: 'r06',  // Chaudière-Appalaches
    seeds: [[520, 650], [550, 640], [580, 630]],
    color: '#E65100',  // orange profond - terres agricoles rive sud
  },
  {
    id: 'r07',  // Côte-Nord (inclut Anticosti)
    seeds: [[900, 200], [800, 150], [1000, 300]],
    color: '#006064',  // bleu-vert arctique - côte nordique
  },
  {
    id: 'r08-09',  // Gaspésie + Îles-de-la-Madeleine
    seeds: [[920, 440], [950, 470], [960, 420]],
    color: '#00838F',  // teal - mer et montagnes
  },
  {
    id: 'r10',  // Lanaudière
    seeds: [[410, 700], [420, 690], [400, 710]],
    color: '#2E7D32',  // vert moyen - collines et lacs
  },
  {
    id: 'r11',  // Laurentides
    seeds: [[290, 690], [310, 680], [270, 700]],
    color: '#4527A0',  // pourpre - montagnes laurentiennes
  },
  {
    id: 'r12',  // Laval
    seeds: [[395, 740], [400, 738], [390, 742]],
    color: '#E91E63',  // rose vif - île urbaine
  },
  {
    id: 'r13',  // Mauricie
    seeds: [[430, 480], [400, 500], [440, 460]],
    color: '#C62828',  // rouge feuilles - forêt et rivières
  },
  {
    id: 'r14',  // Montérégie
    seeds: [[440, 760], [450, 755], [430, 765]],
    color: '#558B2F',  // vert - vergers et plaines
  },
  {
    id: 'r15',  // Montréal
    seeds: [[375, 750], [380, 752], [370, 748]],
    color: '#B71C1C',  // rouge vif - métropole
  },
  {
    id: 'r16',  // Nord-du-Québec
    seeds: [[250, 200], [150, 150], [350, 100]],
    color: '#37474F',  // bleu-ardoise - grand nord
  },
  {
    id: 'r17',  // Outaouais
    seeds: [[65, 700], [75, 710], [55, 695]],
    color: '#EF6C00',  // orange - vallée de l'Outaouais
  },
  {
    id: 'r19',  // Saguenay-Lac-Saint-Jean
    seeds: [[480, 350], [450, 300], [500, 380]],
    color: '#0277BD',  // bleu fjord - lac et fjord
  },
]

// ─── Créer le répertoire de sortie ───────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true })
console.log(`Répertoire: ${OUT_DIR}`)

// ─── Pour chaque carte: flood-fill + colorisation ─────────────────
for (const map of MAPS) {
  console.log(`\nTraitement ${map.id}...`)

  // Trouver un seed valide
  let regionPixels = null
  let usedSeed = null

  for (const seed of map.seeds) {
    const [sx, sy] = seed
    const sc = getRGB(sx, sy)
    if (isPreserved(sc)) {
      console.log(`  seed (${sx},${sy}) = ${hex(sc)} → préservé, essai suivant`)
      continue
    }
    console.log(`  seed (${sx},${sy}) = ${hex(sc)} → flood-fill...`)
    const pixels = floodFill(sx, sy)
    if (pixels.length < 100) {
      console.log(`  trop peu de pixels (${pixels.length}), essai suivant`)
      continue
    }
    regionPixels = pixels
    usedSeed = seed
    console.log(`  région trouvée: ${pixels.length} pixels`)
    break
  }

  if (!regionPixels) {
    console.log(`  ⚠️  Aucun seed valide pour ${map.id} — carte ignorée`)
    continue
  }

  // Créer le Set des pixels de la région cible (pour lookup O(1))
  const regionSet = new Set(regionPixels.map(([x,y]) => y*width+x))

  // Parser la couleur cible
  const cr = parseInt(map.color.slice(1,3),16)
  const cg = parseInt(map.color.slice(3,5),16)
  const cb = parseInt(map.color.slice(5,7),16)

  // Couleur gris pour les autres régions
  const GREY = 160

  // Générer l'image
  const out = Buffer.alloc(width * height * 3)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pi = y*width+x
      const oi = pi*3
      const ii = pi*channels
      const r=data[ii], g=data[ii+1], b=data[ii+2]

      if (isPreserved([r,g,b])) {
        // Garder l'original (eau, frontière, fond)
        out[oi]=r; out[oi+1]=g; out[oi+2]=b
      } else if (regionSet.has(pi)) {
        // Région cible: couleur choisie
        out[oi]=cr; out[oi+1]=cg; out[oi+2]=cb
      } else {
        // Autres régions: gris
        out[oi]=GREY; out[oi+1]=GREY; out[oi+2]=GREY
      }
    }
  }

  // Sauvegarder en JPEG qualité 90
  const outPath = path.join(OUT_DIR, `${map.id}.jpg`)
  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 90 })
    .toFile(outPath)

  console.log(`  ✓ Sauvegardé: ${outPath}`)
}

console.log('\n✅ Génération terminée!')
