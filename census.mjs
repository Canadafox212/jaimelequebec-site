import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

// Known non-region colors (with tolerance 25)
const NON_REGION = [
  [100,203,100], // bordure verte #64cb64
  [0,58,166],    // eau Gulf #003aa6
  [156,247,247], // eau fleuve #9cf7f7
  [159,159,159], // territoire étranger #9f9f9f
]

function dist([r1,g1,b1],[r2,g2,b2]) {
  return Math.max(Math.abs(r1-r2),Math.abs(g1-g2),Math.abs(b1-b2))
}

function isSkip([r,g,b]) {
  // blanc quasi-pur
  if (Math.min(r,g,b) > 245 && Math.max(r,g,b)-Math.min(r,g,b) < 10) return true
  // noir
  if (Math.max(r,g,b) < 25) return true
  // couleurs de fond connues
  for (const nc of NON_REGION) {
    if (dist([r,g,b], nc) < 25) return true
  }
  return false
}

function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Census exact par couleur
const cnt = new Map(), sumX = new Map(), sumY = new Map()

for (let y=0; y<height; y++) {
  for (let x=0; x<width; x++) {
    const i=(y*width+x)*channels
    const c=[data[i],data[i+1],data[i+2]]
    if (isSkip(c)) continue
    const h=hex(c)
    cnt.set(h,(cnt.get(h)||0)+1)
    sumX.set(h,(sumX.get(h)||0)+x)
    sumY.set(h,(sumY.get(h)||0)+y)
  }
}

const sorted=[...cnt.entries()].sort((a,b)=>b[1]-a[1])

console.log(`Total couleurs distinctes: ${sorted.length}`)
console.log('\nTop 30 (par fréquence) — les 19 régions devraient être les premières:')
for (const [h,n] of sorted.slice(0,30)) {
  const cx=Math.round(sumX.get(h)/n), cy=Math.round(sumY.get(h)/n)
  console.log(`${h}  n=${String(n).padStart(7)}  centre(${String(cx).padStart(4)},${String(cy).padStart(3)})`)
}

// Aussi: pour chaque couleur >1000 pixels, montrer la boîte englobante
console.log('\nBoîtes englobantes (couleurs > 1000 pixels):')
const boxes = new Map()
for (let y=0; y<height; y++) {
  for (let x=0; x<width; x++) {
    const i=(y*width+x)*channels
    const c=[data[i],data[i+1],data[i+2]]
    if (isSkip(c)) continue
    const h=hex(c)
    if (!cnt.has(h) || cnt.get(h)<1000) continue
    if (!boxes.has(h)) boxes.set(h,{x1:width,y1:height,x2:0,y2:0})
    const b=boxes.get(h)
    if(x<b.x1)b.x1=x; if(x>b.x2)b.x2=x
    if(y<b.y1)b.y1=y; if(y>b.y2)b.y2=y
  }
}

for (const [h,n] of sorted) {
  if (n < 1000) break
  const b = boxes.get(h)
  if (!b) continue
  const cx=Math.round(sumX.get(h)/n), cy=Math.round(sumY.get(h)/n)
  console.log(`${h}  n=${String(n).padStart(7)}  box(x=${b.x1}-${b.x2}, y=${b.y1}-${b.y2})  centre(${cx},${cy})`)
}
