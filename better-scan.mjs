import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

// Filtre amélioré: exclure UNIQUEMENT blanc pur et noir pur
// Blanc pur: tous > 250 ET max-min < 8
// Noir pur: tous < 20
function isBackground([r,g,b]) {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
  if (mx < 20) return true      // noir
  if (mn > 252) return true     // blanc pur
  if (mx > 248 && mx-mn < 8) return true  // presque blanc avec pas de saturation
  return false
}

// Scan vertical des colonnes clés
const cols = [50,150,250,350,450,550,650,750,850,950,1050,1150]
console.log('Colonnes verticales (filtre amélioré)')
for (const x of cols) {
  const blocks = []
  let lastHex=null, startY=0
  for (let y=0; y<height; y++) {
    const c=px(x,y)
    const h = isBackground(c) ? '---' : hex(c)
    if (h !== lastHex) {
      if (lastHex && lastHex !== '---' && y-startY > 5) {
        blocks.push(`y=${startY}-${y-1}:${lastHex}`)
      }
      lastHex=h; startY=y
    }
  }
  if (lastHex && lastHex !== '---') blocks.push(`y=${startY}-${height-1}:${lastHex}`)
  console.log(`x=${String(x).padStart(4)}: ${blocks.join('  ')}`)
}

// Aussi scan horizontal pour quelques lignes clés
console.log('\nLignes horizontales (filtre amélioré)')
const rows = [100,150,200,250,300,350,400,450,500,550,600,650,700,750]
for (const y of rows) {
  const blocks = []
  let lastHex=null, startX=0
  for (let x=0; x<width; x++) {
    const c=px(x,y)
    const h = isBackground(c) ? '---' : hex(c)
    if (h !== lastHex) {
      if (lastHex && lastHex !== '---' && x-startX > 8) {
        blocks.push(`x=${startX}-${x-1}:${lastHex}`)
      }
      lastHex=h; startX=x
    }
  }
  if (lastHex && lastHex !== '---') blocks.push(`x=${startX}-${width-1}:${lastHex}`)
  console.log(`y=${String(y).padStart(3)}: ${blocks.join('  ')}`)
}
