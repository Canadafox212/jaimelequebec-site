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
  const mx=Math.max(r,g,b)
  return mx>230 || mx<20
}

// Scanner des lignes horizontales pour voir la transition des couleurs
// On affiche chaque changement de couleur (les "blocs" de couleur sur chaque ligne)
const scanY = [80,120,160,200,240,280,320,360,400,440,480,520,560,600,640,680,720,760,800,840]

console.log('Scan ligne par ligne - blocs de couleur')
for (const y of scanY) {
  const blocks = []
  let lastHex = null, startX = 0
  for (let x = 0; x < width; x++) {
    const c = px(x, y)
    const h = isBorderOrWhite(c) ? '---' : hex(c)
    if (h !== lastHex) {
      if (lastHex && lastHex !== '---' && x - startX > 5) {
        blocks.push(`x=${startX}-${x-1}:${lastHex}`)
      }
      lastHex = h
      startX = x
    }
  }
  if (lastHex && lastHex !== '---') blocks.push(`x=${startX}-${width-1}:${lastHex}`)
  console.log(`y=${String(y).padStart(3)}: ${blocks.join('  ')}`)
}
