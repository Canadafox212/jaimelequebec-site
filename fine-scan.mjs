import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Couleurs connues à exclure
const KNOWN_SKIP = [
  [255,255,255], [235,238,200], [198,250,198], [253,249,199],
  [181,222,173], [239,156,156], [254,248,184], [239,181,74],
  [0,58,166], [156,247,247], [100,203,100], [159,159,159],
  [231,231,231],
]
function dist([r1,g1,b1],[r2,g2,b2]) { return Math.max(Math.abs(r1-r2),Math.abs(g1-g2),Math.abs(b1-b2)) }
function isKnown(c) {
  const mx=Math.max(...c), mn=Math.min(...c)
  if (mn>242) return true  // blanc
  if (mx<25) return true   // noir
  if (mx-mn<8 && r>120) return true  // gris pur
  return KNOWN_SKIP.some(k=>dist(c,k)<18)
}
// fixme: r not defined
function isBg([r,g,b]) {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
  if (mn>242) return true  // blanc
  if (mx<25) return true   // noir
  if (mx-mn<8 && mx>120) return true  // gris neutre
  return KNOWN_SKIP.some(k=>dist([r,g,b],k)<18)
}

// Census de la zone sud (y=600-844)
const cnt = new Map(), sumX = new Map(), sumY = new Map()

for (let y=600; y<height; y++) {
  for (let x=20; x<820; x++) {
    const c = px(x,y)
    if (isBg(c)) continue
    const h = hex(c)
    cnt.set(h,(cnt.get(h)||0)+1)
    sumX.set(h,(sumX.get(h)||0)+x)
    sumY.set(h,(sumY.get(h)||0)+y)
  }
}

const sorted=[...cnt.entries()].sort((a,b)=>b[1]-a[1])
console.log('Couleurs non-connues dans zone sud (y=600-844):')
for (const [h,n] of sorted.slice(0,25)) {
  const cx=Math.round(sumX.get(h)/n), cy=Math.round(sumY.get(h)/n)
  console.log(`  ${h}  n=${String(n).padStart(6)}  centre(${cx},${cy})`)
}

// Également: scan ultra-fin 5px dans zone y=680-840, x=50-700
console.log('\nScan ultra-fin 5px (y=680-840, nouvelles couleurs seulement):')
const seen = new Set(['#f7d3d3','#dee794','#fff794','#efb54a','#ff7339','#fef8b8','#ef9c9c','#b5dead','#fdf9c7','#ebeec8','#c6fac6'])
const newColors = new Map()
for (let y=680; y<height; y+=5) {
  for (let x=50; x<750; x+=5) {
    const c=px(x,y)
    const h=hex(c)
    if (isBg(c)) continue
    if (seen.has(h)) continue
    if (!newColors.has(h)) newColors.set(h,{n:0,sx:0,sy:0,ex:x,ey:y})
    const v=newColors.get(h); v.n++; v.sx+=x; v.sy+=y
    if (y>v.ey||x>v.ex) { v.ex=x; v.ey=y }
  }
}
const newSorted=[...newColors.entries()].sort((a,b)=>b[1].n-a[1].n)
for (const [h,v] of newSorted.slice(0,20)) {
  const cx=Math.round(v.sx/v.n), cy=Math.round(v.sy/v.n)
  console.log(`  ${h}  n=${v.n}  centre(${cx},${cy})`)
}

// Points de contrôle pour régions spécifiques
console.log('\nPoints de contrôle précis:')
const checks = [
  // Bas-Saint-Laurent (doit être rive sud, est de Qc)
  [750,560,'BSL?'], [780,580,'BSL?'], [810,560,'BSL?'],
  // Cantons-de-lEst (sud-est de Montréal)
  [520,740,'Cantons?'], [540,740,'Cantons?'], [560,760,'Cantons?'],
  // Centre-du-Québec
  [490,680,'CentreQC?'], [510,700,'CentreQC?'],
  // Chaudière-Appalaches (rive sud Qc)
  [640,680,'ChaudApp?'], [660,690,'ChaudApp?'], [680,680,'ChaudApp?'],
  // Laurentides (nord-ouest Montréal)
  [280,700,'Laurentides?'], [300,710,'Laurentides?'],
  // Lanaudière (nord-est Montréal)
  [390,700,'Lanaudière?'], [410,710,'Lanaudière?'],
  // Laval (île au nord de Montréal)
  [400,740,'Laval?'], [415,735,'Laval?'],
  // Montréal (île)
  [370,750,'Mtl?'], [380,755,'Mtl?'],
  // Outaouais (est de l'Ontario)
  [65,700,'Outaouais?'], [80,710,'Outaouais?'],
]
for (const [x,y,label] of checks) {
  const c=px(x,y)
  console.log(`  (${x},${y}) ${hex(c)} rgb(${c.join(',')})  ← ${label}`)
}
