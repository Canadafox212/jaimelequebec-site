import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Distance couleur
function dist([r1,g1,b1],[r2,g2,b2]) {
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2)
}

// Couleurs cibles des régions (d'après le scan)
// Quantisées à ±25 pour tolérance
const TARGETS = {
  'jaune-vert-pale':  [235, 238, 200],  // #ebeec8 - Nord-QC?
  'gris-clair':       [231, 231, 231],  // #e7e7e7
  'gris-moyen':       [151, 151, 151],  // #979797
  'vert-pale':        [176, 223, 176],  // #b0dfb0 - Cote-Nord?
  'rose-saumon':      [239, 156, 156],  // #ef9c9c
  'jaune-vert':       [222, 231, 148],  // #dee794
  'orange':           [239, 181,  74],  // #efb54a
  'vert-moyen':       [100, 203, 100],  // #64cb64
  'vert-jaune-250':   [198, 250, 198],  // #c6fac6 (de mes premiers samples - Cote-Nord)
  'jaune-250':        [253, 249, 199],  // #fdf9c7 (très courant dans 1er scan)
  'jaune-248':        [254, 248, 184],  // #fef8b8 (Gaspésie)
  'vert-doux':        [181, 222, 173],  // #b5dead (Outaouais)
}

const sums = {}
for (const k of Object.keys(TARGETS)) sums[k] = { sx:0, sy:0, n:0, minX:9999,maxX:0,minY:9999,maxY:0 }

const THRESH = 25

for (let y = 0; y < height; y += 2) {
  for (let x = 0; x < width; x += 2) {
    const c = px(x, y)
    for (const [name, target] of Object.entries(TARGETS)) {
      if (dist(c, target) < THRESH) {
        sums[name].sx += x
        sums[name].sy += y
        sums[name].n++
        if (x < sums[name].minX) sums[name].minX = x
        if (x > sums[name].maxX) sums[name].maxX = x
        if (y < sums[name].minY) sums[name].minY = y
        if (y > sums[name].maxY) sums[name].maxY = y
        break
      }
    }
  }
}

console.log('Couleur            Pixels  CentreX CentreY  BBox(x1,y1,x2,y2)')
for (const [name, s] of Object.entries(sums)) {
  if (s.n === 0) { console.log(`${name.padEnd(18)} 0`); continue }
  const cx = Math.round(s.sx/s.n), cy = Math.round(s.sy/s.n)
  const col = TARGETS[name]
  console.log(`${name.padEnd(18)} ${String(s.n).padStart(6)}  (${cx},${cy})  [${s.minX},${s.minY},${s.maxX},${s.maxY}]  ${hex(col)}`)
}
