import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function isNeutral([r,g,b]) {
  const mx=Math.max(r,g,b)
  if (mx>225) return true  // presque blanc
  if (mx<25) return true   // presque noir
  const mn=Math.min(r,g,b)
  if (mx-mn < 8 && r>90) return true  // gris pur type fond/USA
  return false
}

// Scan grille 25px x 25px sur la zone de la carte (x=10-820, y=10-800)
// Afficher uniquement les couleurs non-neutres (=pixels dans une région)
const STEP = 25
const results = []

for (let y=25; y<820; y+=STEP) {
  for (let x=25; x<820; x+=STEP) {
    const c=px(x,y)
    if (!isNeutral(c)) {
      results.push({x,y,h:hex(c),r:c[0],g:c[1],b:c[2]})
    }
  }
}

// Afficher sous forme de grille lisible
console.log('Grille 25px (x,y → couleur)  [uniquement pixels non-neutres/non-blancs]')
console.log('Seules les couleurs intéressantes (régions) sont affichées')
console.log()

// Grouper par hex
const byColor = new Map()
for (const r of results) {
  if (!byColor.has(r.h)) byColor.set(r.h, [])
  byColor.get(r.h).push([r.x,r.y])
}

// Trier par fréquence
const sorted = [...byColor.entries()].sort((a,b)=>b[1].length-a[1].length)
console.log('Couleurs trouvées (triées par fréquence):')
for (const [h, pts] of sorted) {
  const xs = pts.map(p=>p[0])
  const ys = pts.map(p=>p[1])
  const cx = Math.round(pts.reduce((s,p)=>s+p[0],0)/pts.length)
  const cy = Math.round(pts.reduce((s,p)=>s+p[1],0)/pts.length)
  const xRange = `${Math.min(...xs)}-${Math.max(...xs)}`
  const yRange = `${Math.min(...ys)}-${Math.max(...ys)}`
  console.log(`${h}  n=${String(pts.length).padStart(3)}  centre(${cx},${cy})  x=[${xRange}] y=[${yRange}]`)
}

// Aussi afficher la grille visuelle (compacte)
console.log('\n=== GRILLE VISUELLE (y,x) ===')
console.log('(vide=blanc/gris, code=couleur abrégée)')
// Définir des abréviations
const colorMap = new Map()
const names = ['AB','SL','GN','GJ','JV','OR','SR','MV','LP','RO','BE','GR','BL','CY','OG','VD','VF','MG','PK','CR']
let ni=0
for (const [h] of sorted) {
  colorMap.set(h, names[ni] || h.slice(1,3))
  ni++
}

for (let y=25; y<820; y+=STEP) {
  const row = [`y${String(y).padStart(3)}`]
  for (let x=25; x<820; x+=STEP) {
    const c=px(x,y)
    if (isNeutral(c)) { row.push('..'); continue }
    const h=hex(c)
    row.push(colorMap.get(h)||'??')
  }
  // N'afficher la ligne que si elle a du contenu
  const nonEmpty = row.slice(1).filter(r=>r!=='..')
  if (nonEmpty.length > 0) console.log(row.join(' '))
}
