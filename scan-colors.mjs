import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
console.log(`Image: ${width}x${height}`)

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Quantise couleur: arrondir à 20 pour regrouper les teintes similaires
function quantise([r,g,b]) { return [Math.round(r/20)*20, Math.round(g/20)*20, Math.round(b/20)*20] }

// Exclure: blanc presque pur, noir presque pur, gris très clair (texte/fond)
function isBackground([r,g,b]) {
  const mn = Math.min(r,g,b), mx = Math.max(r,g,b)
  if (mx > 240) return true   // blanc
  if (mx < 20) return true    // noir (contours)
  return false
}

// Compter les couleurs quantisées
const counts = new Map()
const examples = new Map()

for (let y = 10; y < height - 10; y += 4) {
  for (let x = 10; x < width - 10; x += 4) {
    const c = px(x, y)
    if (isBackground(c)) continue
    const q = quantise(c)
    const key = q.join(',')
    counts.set(key, (counts.get(key) || 0) + 1)
    if (!examples.has(key)) examples.set(key, [x, y, c])
  }
}

// Trier par fréquence
const sorted = [...counts.entries()].sort((a,b) => b[1]-a[1])
console.log('\nTop 30 couleurs (quantisées):')
console.log('Rang  Couleur                  Count    Exemple(x,y)    RGB exact')
sorted.slice(0, 30).forEach(([k, n], i) => {
  const [x, y, c] = examples.get(k)
  const q = k.split(',').map(Number)
  console.log(`${String(i+1).padStart(2)}   rgb(${k.padEnd(12)}) ${String(n).padStart(6)}   (${x},${y})    rgb(${c.join(',')})  ${hex(c)}`)
})
