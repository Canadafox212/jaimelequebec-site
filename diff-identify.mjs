import sharp from 'sharp'

const BASE = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const NUMS = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec numéros.png'

const [b, n] = await Promise.all([
  sharp(BASE).raw().toBuffer({ resolveWithObject: true }),
  sharp(NUMS).raw().toBuffer({ resolveWithObject: true }),
])
const { data: bd, info: bi } = b
const { data: nd, info: ni } = n
const W = bi.width, H = bi.height, C = bi.channels

function bpx(x, y) { const i=(y*W+x)*C; return [bd[i],bd[i+1],bd[i+2]] }
function npx(x, y) { const i=(y*W+x)*C; return [nd[i],nd[i+1],nd[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Trouver les pixels qui ont changé entre les deux maps
// Les chiffres sont dessinés en bleu foncé sur les régions
// Dans la map numérotée: les pixels de chiffres sont beaucoup plus sombres
// Dans la map de base: ces mêmes pixels ont la couleur de la région

const changed = []

for (let y = 20; y < H-20; y++) {
  for (let x = 20; x < W-100; x++) {  // exclure la zone droite avec légende/drapeaux
    const bc = bpx(x, y)
    const nc = npx(x, y)
    const [br,bg,bb] = bc
    const [nr,ng,nb] = nc

    // La couleur de base doit être une couleur de région (pas trop sombre, pas blanc pur)
    const bmx = Math.max(br,bg,bb), bmn = Math.min(br,bg,bb)
    if (bmx < 50 || bmn > 245) continue  // trop sombre ou blanc pur
    if (bmx-bmn < 5) continue  // gris neutre = fond/eau/frontière

    // Le pixel numéroté doit être significativement plus sombre
    const nmx = Math.max(nr,ng,nb)
    const baseLum = 0.299*br + 0.587*bg + 0.114*bb
    const numsLum = 0.299*nr + 0.587*ng + 0.114*nb
    const darkened = baseLum - numsLum

    if (darkened < 80) continue  // pas assez foncé dans la map numéros

    changed.push({ x, y, baseColor: bc })
  }
}

console.log(`Pixels "numéro" trouvés: ${changed.length}`)

// Regrouper en clusters 30px
const grid = new Map()
for (const { x, y, baseColor } of changed) {
  const gx = Math.round(x/30)*30
  const gy = Math.round(y/30)*30
  const k = `${gx},${gy}`
  if (!grid.has(k)) grid.set(k, { x:gx, y:gy, n:0, sr:0, sg:0, sb:0 })
  const g = grid.get(k)
  g.n++; g.sr+=baseColor[0]; g.sg+=baseColor[1]; g.sb+=baseColor[2]
}

// Garder seulement les clusters significatifs (>= 10 pixels)
const clusters = [...grid.values()]
  .filter(g => g.n >= 8)
  .map(g => ({
    x: g.x, y: g.y, n: g.n,
    color: [Math.round(g.sr/g.n), Math.round(g.sg/g.n), Math.round(g.sb/g.n)]
  }))
  .sort((a,b) => a.y-b.y || a.x-b.x)

console.log(`\nClusters significatifs: ${clusters.length}`)
clusters.forEach(g => {
  const h = hex(g.color)
  console.log(`  pos(${String(g.x).padStart(4)},${String(g.y).padStart(3)})  n=${String(g.n).padStart(3)}  couleur=${h}  rgb(${g.color.join(',')})`)
})
