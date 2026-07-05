import sharp from 'sharp'

const BASE = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
// Nom du fichier avec l'accent (é)
const NUMS = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec numéros.png'

const [baseResult, numsResult] = await Promise.all([
  sharp(BASE).raw().toBuffer({ resolveWithObject: true }),
  sharp(NUMS).raw().toBuffer({ resolveWithObject: true }),
])

const { data: bd, info: bi } = baseResult
const { data: nd, info: ni } = numsResult
console.log(`Base: ${bi.width}x${bi.height}  Nums: ${ni.width}x${ni.height}`)

function bpx(x, y) { const i=(y*bi.width+x)*bi.channels; return [bd[i],bd[i+1],bd[i+2]] }
function npx(x, y) { const i=(y*ni.width+x)*ni.channels; return [nd[i],nd[i+1],nd[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Trouver les pixels bleu foncé dans numsImg (couleur des numéros)
// Les numéros sont écrits en bleu foncé (~#003a96 ou similaire)
// Dans baseImg ces mêmes pixels ont la couleur de la région

const numPixels = []
for (let y=10; y<ni.height-10; y++) {
  for (let x=10; x<ni.width-10; x++) {
    const nc = npx(x, y)
    const bc = bpx(x, y)
    const [nr,ng,nb] = nc
    const [br,bg,bb] = bc
    // Blue foncé dans numsImg: B dominant, R et G faibles
    const isBlue = nb > 100 && nr < nb-50 && ng < nb-30 && nb > 150
    // Région sous-jacente dans base: pas blanc ni noir
    const bmx = Math.max(br,bg,bb)
    const isRegion = bmx > 30 && bmx < 230
    if (isBlue && isRegion) {
      numPixels.push([x, y, bc])
    }
  }
}
console.log(`Pixels "numéro bleu" trouvés: ${numPixels.length}`)

// Regrouper en clusters de 50px
const grid = new Map()
for (const [x, y, c] of numPixels) {
  const gx = Math.round(x/50)*50
  const gy = Math.round(y/50)*50
  const k = `${gx},${gy}`
  if (!grid.has(k)) grid.set(k, { x:gx, y:gy, n:0, sr:0, sg:0, sb:0 })
  const g = grid.get(k)
  g.n++; g.sr+=c[0]; g.sg+=c[1]; g.sb+=c[2]
}

// Clusters valides (assez de pixels)
const clusters = [...grid.values()]
  .filter(g=>g.n>=5)
  .map(g=>({
    x:g.x, y:g.y, n:g.n,
    color:[Math.round(g.sr/g.n),Math.round(g.sg/g.n),Math.round(g.sb/g.n)]
  }))
  .sort((a,b)=>a.y-b.y||a.x-b.x)

console.log(`\nClusters trouvés: ${clusters.length}`)
clusters.forEach(g=>{
  console.log(`  (${g.x},${g.y}) n=${g.n}  couleur=${hex(g.color)} rgb(${g.color.join(',')})`)
})
