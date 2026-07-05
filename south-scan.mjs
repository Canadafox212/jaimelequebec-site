import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Scan à haute résolution de la zone sud (y=650-830, x=50-820)
// où se trouvent les petites régions: Laval, MTL, Montérégie, Cantons, etc.
console.log('=== Scan haute résolution zone sud (y=650-830) ===\n')

const rows = [655,665,675,685,695,705,715,725,735,745,755,765,775,785,795,805,815,825]
for (const y of rows) {
  const blocks = []
  let lastHex=null, startX=0
  for (let x=30; x<820; x++) {
    const c=px(x,y)
    const [r,g,b]=c
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
    // Exclure blanc quasi-pur, noir, gris neutre (étranger), vert bordure, eau
    const isBg = (mn>240 && mx-mn<15)  // blanc
      || mx<25  // noir
      || (mx-mn<12 && r>130 && r<200)  // gris neutre
      || (r<115 && g>190 && b<115)  // vert bordure
      || (b>200 && r<100 && g<100)  // eau foncée
      || (b>200 && r>140 && g>230)  // eau cyan
    const h = isBg ? '---' : hex(c)
    if (h !== lastHex) {
      if (lastHex && lastHex !== '---' && x-startX > 3) {
        blocks.push(`x=${startX}-${x-1}:${lastHex}`)
      }
      lastHex=h; startX=x
    }
  }
  if (lastHex && lastHex !== '---') blocks.push(`x=${startX}-819:${lastHex}`)
  if (blocks.length > 0) console.log(`y=${y}: ${blocks.join('  ')}`)
}

// Aussi, scanner quelques colonnes dans le sud
console.log('\n=== Colonnes verticales zone sud (x=50-800) ===\n')
const cols = [60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580, 620, 660, 700, 740, 780]
for (const x of cols) {
  const blocks = []
  let lastHex=null, startY=0
  for (let y=600; y<height; y++) {
    const c=px(x,y)
    const [r,g,b]=c
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
    const isBg = (mn>240 && mx-mn<15)
      || mx<25
      || (mx-mn<12 && r>130 && r<200)
      || (r<115 && g>190 && b<115)
      || (b>200 && r<100 && g<100)
      || (b>200 && r>140 && g>230)
    const h = isBg ? '---' : hex(c)
    if (h !== lastHex) {
      if (lastHex && lastHex !== '---' && y-startY > 2) {
        blocks.push(`y=${startY}-${y-1}:${lastHex}`)
      }
      lastHex=h; startY=y
    }
  }
  if (lastHex && lastHex !== '---') blocks.push(`y=${startY}-${height-1}:${lastHex}`)
  if (blocks.length > 0) console.log(`x=${x}: ${blocks.join('  ')}`)
}

// Échantillonner des points précis pour chaque région supposée
console.log('\n=== Échantillons ponctuels régions sud ===')
const samples = [
  [130, 720, 'Outaouais (17)?'],
  [170, 740, 'Outaouais/Laurentides?'],
  [250, 710, 'Laurentides (11)?'],
  [280, 730, 'Laurentides?'],
  [320, 720, 'Laurentides/Lanaudière?'],
  [370, 720, 'Lanaudière (10)?'],
  [400, 735, 'Laval (12)?'],
  [390, 750, 'Montréal (15)?'],
  [360, 765, 'Montérégie (14)?'],
  [440, 760, 'Montérégie/Cantons?'],
  [500, 755, 'Cantons-de-lEst (3)?'],
  [540, 745, 'Centre-du-Québec (4)?'],
  [480, 700, 'Centre-du-Québec?'],
  [620, 700, 'Capitale-Nationale (18)?'],
  [680, 650, 'Charlevoix (5)?'],
  [650, 620, 'Charlevoix?'],
  [730, 600, 'BSL (2)?'],
  [780, 630, 'BSL?'],
  [850, 580, 'BSL?'],
  [640, 700, 'Chaudière-App (6)?'],
  [700, 720, 'Chaudière-App?'],
  [1050, 510, 'Îles-de-la-Mad (9)?'],
  [1100, 490, 'ÎdM?'],
  [1120, 520, 'ÎdM?'],
]
for (const [x, y, label] of samples) {
  const c = px(x, y)
  console.log(`  (${x},${y}) ${hex(c)} rgb(${c.join(',')})  ← ${label}`)
}
