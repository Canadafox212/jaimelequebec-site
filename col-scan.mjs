import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function isBorderOrWhite([r,g,b]) {
  const mx=Math.max(r,g,b); return mx>230 || mx<20
}

// Scan vertical de plusieurs colonnes clés pour voir tous les changements de couleur
const cols = [50,150,250,350,450,550,650,750,850,950,1050]

console.log('Colonnes verticales - blocs de couleur (de haut en bas)')
for (const x of cols) {
  const blocks = []
  let lastHex=null, startY=0
  for (let y=0; y<height; y++) {
    const c=px(x,y)
    const h = isBorderOrWhite(c) ? '---' : hex(c)
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
