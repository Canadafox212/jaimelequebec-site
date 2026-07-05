/**
 * fix-maps.mjs — Régénère uniquement les cartes avec de mauvais seeds
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const OUT_DIR = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/jaimelequebec-site/public/maps'

const { data: raw, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const data = new Uint8ClampedArray(raw)

function idx(x, y) { return (y * width + x) * channels }
function getRGB(x, y) { const i=idx(x,y); return [data[i],data[i+1],data[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function dist([r1,g1,b1],[r2,g2,b2]) { return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2) }

function isPreserved([r,g,b]) {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
  if (mn > 240) return true
  if (mx < 25) return true
  if (g > 190 && r < 120 && b < 120 && g > r+80 && g > b+80) return true
  if (b > 140 && r < 40 && g < 80) return true
  if (b > 200 && r > 140 && g > 230 && b > g-30) return true
  if (mx-mn < 20 && r > 130 && r < 200) return true
  if (mn > 220 && mx-mn < 20) return true
  return false
}

const TOLERANCE = 22

function floodFill(seedX, seedY) {
  const seedColor = getRGB(seedX, seedY)
  const visited = new Uint8Array(width * height)
  const pixels = []
  const queue = [[seedX, seedY]]
  visited[seedY * width + seedX] = 1
  const dx = [1,-1,0,0], dy = [0,0,1,-1]
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
      if (isPreserved(nc)) continue
      if (dist(nc, seedColor) <= TOLERANCE) queue.push([nx, ny])
    }
  }
  return pixels
}

// Tester les seeds pour identifier les couleurs disponibles
console.log('=== Test des seeds corrigés ===\n')
const testSeeds = [
  // Laurentides (11): doit être dans le bloc dee794 à l'ouest (x=111-208, y=675-820)
  [175, 735, 'Laurentides-dee794-ouest'],
  [185, 750, 'Laurentides-dee794-ouest2'],
  [195, 760, 'Laurentides-dee794-ouest3'],
  // Montérégie (14): bloc dee794 centre (x=365-497, y=720-780) — éviter les icônes
  [460, 720, 'Montérégie-dee794-centre'],
  [465, 730, 'Montérégie-dee794-centre2'],
  [475, 725, 'Montérégie-dee794-centre3'],
  // Cantons (03): chercher une couleur unique non encore trouvée
  [530, 760, 'Cantons-essai1'],
  [550, 755, 'Cantons-essai2'],
  [560, 770, 'Cantons-essai3'],
  [540, 768, 'Cantons-essai4'],
  // Chaud-App (06): rive sud de Québec
  [550, 640, 'ChaudApp-essai1'],
  [570, 640, 'ChaudApp-essai2'],
  [600, 650, 'ChaudApp-essai3'],
  [580, 660, 'ChaudApp-essai4'],
  // Laval (12): très petite île nord de Montréal
  [395, 738, 'Laval-essai1'],
  [402, 742, 'Laval-essai2'],
  [398, 745, 'Laval-essai3'],
  // Montréal (15): île
  [380, 750, 'Montréal-essai1'],
  [375, 753, 'Montréal-essai2'],
]

for (const [x,y,label] of testSeeds) {
  const c = getRGB(x,y)
  const pres = isPreserved(c)
  const fill = pres ? '(préservé)' : `→ ${hex(c)}`
  console.log(`  (${x},${y}) ${fill}  ← ${label}`)
}

// Régénérer les cartes corrigées
console.log('\n=== Régénération des cartes corrigées ===\n')

const FIXED_MAPS = [
  {
    id: 'r11',  // Laurentides — dee794 bande ouest
    seeds: [[185, 750], [175, 735], [195, 760]],
    color: '#4527A0',
    note: 'bloc dee794 bande ouest x=111-208, y=675-820',
  },
  {
    id: 'r14',  // Montérégie — dee794 centre-sud
    seeds: [[460, 720], [475, 725], [465, 730]],
    color: '#558B2F',
    note: 'bloc dee794 centre x=365-497, y=720-780',
  },
]

const GREY = 160

for (const map of FIXED_MAPS) {
  console.log(`Traitement ${map.id} (${map.note})...`)
  let regionPixels = null

  for (const [sx,sy] of map.seeds) {
    const sc = getRGB(sx,sy)
    if (isPreserved(sc)) { console.log(`  seed (${sx},${sy}) = ${hex(sc)} → préservé`); continue }
    console.log(`  seed (${sx},${sy}) = ${hex(sc)} → flood-fill...`)
    const pixels = floodFill(sx,sy)
    console.log(`  → ${pixels.length} pixels`)
    if (pixels.length >= 50) { regionPixels = pixels; break }
    console.log(`  trop peu, essai suivant`)
  }

  if (!regionPixels) { console.log(`  ⚠️ Echec ${map.id}`); continue }

  const regionSet = new Set(regionPixels.map(([x,y]) => y*width+x))
  const cr=parseInt(map.color.slice(1,3),16)
  const cg=parseInt(map.color.slice(3,5),16)
  const cb=parseInt(map.color.slice(5,7),16)

  const out = Buffer.alloc(width * height * 3)
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const pi=y*width+x, oi=pi*3, ii=pi*channels
      const r=data[ii],g=data[ii+1],b=data[ii+2]
      if (isPreserved([r,g,b])) { out[oi]=r; out[oi+1]=g; out[oi+2]=b }
      else if (regionSet.has(pi)) { out[oi]=cr; out[oi+1]=cg; out[oi+2]=cb }
      else { out[oi]=GREY; out[oi+1]=GREY; out[oi+2]=GREY }
    }
  }

  const outPath = path.join(OUT_DIR, `${map.id}.jpg`)
  await sharp(out, { raw:{width,height,channels:3} }).jpeg({quality:90}).toFile(outPath)
  console.log(`  ✓ ${outPath}`)
}

console.log('\nDone.')
