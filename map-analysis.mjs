import sharp from 'sharp'

// Lire les deux cartes pour comparer couleurs vs numéros
const BASE = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const NUMS = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec numeros.png'

const [baseImg, numsImg] = await Promise.all([
  sharp(BASE).raw().toBuffer({ resolveWithObject: true }),
  sharp(NUMS).raw().toBuffer({ resolveWithObject: true }),
])

const { data: bd, info: bi } = baseImg
const { data: nd, info: ni } = numsImg
console.log(`Base: ${bi.width}x${bi.height}ch${bi.channels}  Nums: ${ni.width}x${ni.height}ch${ni.channels}`)

function bpx(x, y) { const i=(y*bi.width+x)*bi.channels; return [bd[i],bd[i+1],bd[i+2]] }
function npx(x, y) { const i=(y*ni.width+x)*ni.channels; return [nd[i],nd[i+1],nd[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Chercher des pixels où numsImg est significativement plus sombre que baseImg
// → là où les numéros sont imprimés
// Ensuite regarder la couleur de base à cet endroit

// Scan toute la carte nums pour trouver les numéros (pixels noirs sur fond coloré)
// Méthode: numsImg a les mêmes couleurs + texte en noir
// Les numéros (1-19) sont écrits en noir sur les régions colorées

// Grille fine 20px pour trouver les zones de numéros
// Un "numéro" apparaît comme un cluster de pixels foncés entouré de pixels colorés

// Approche: pour chaque zone, vérifier si la base et nums diffèrent
// Si diff > 60 dans nums (pixel foncé là où base est clair) → on a un numéro
const numPixels = []
const STEP = 1

for (let y = 20; y < ni.height-20; y += STEP) {
  for (let x = 20; x < ni.width-20; x += STEP) {
    const nc = npx(x, y)
    const bc = bpx(x, y)
    const nBright = (nc[0]+nc[1]+nc[2])/3
    const bBright = (bc[0]+bc[1]+bc[2])/3
    // Dans numsImg: pixel très foncé, mais dans base: pixel normal (coloré)
    if (nBright < 80 && bBright > 120) {
      numPixels.push([x, y, bc])
    }
  }
}

console.log(`\nPixels "numéro" trouvés: ${numPixels.length}`)

// Regrouper par clusters (zones proches)
// Utiliser une grille de 30px pour regrouper
const grid = new Map()
for (const [x, y, c] of numPixels) {
  const gx = Math.round(x/30)*30
  const gy = Math.round(y/30)*30
  const k = `${gx},${gy}`
  if (!grid.has(k)) grid.set(k, { x:gx, y:gy, pixels: [], colors: [] })
  grid.get(k).pixels.push([x,y])
  grid.get(k).colors.push(c)
}

// Filtrer les clusters avec assez de pixels (vrai numéro vs bruit)
const clusters = [...grid.values()].filter(g => g.pixels.length >= 3)
console.log(`Clusters de numéros: ${clusters.length}`)

// Pour chaque cluster, calculer la couleur de base moyenne (= couleur de la région)
console.log('\nClusters (position → couleur de la région sous le numéro):')
clusters.sort((a,b) => a.y-b.y || a.x-b.x).forEach(g => {
  const avg = g.colors.reduce((s,c)=>[s[0]+c[0],s[1]+c[1],s[2]+c[2]],[0,0,0])
    .map(v => Math.round(v/g.colors.length))
  console.log(`  Pos(${g.x},${g.y}) n=${g.pixels.length} couleur=${hex(avg)} rgb(${avg.join(',')})`)
})
