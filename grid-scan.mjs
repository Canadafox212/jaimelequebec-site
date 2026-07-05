import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function isBorder([r,g,b]) {
  const mx=Math.max(r,g,b)
  return mx > 235 || mx < 30  // blanc ou noir
}

// Grille systématique tous les 50px pour voir quelle couleur est où
console.log('Grille de couleurs (x, y) → RGB  [on ignore blanc/noir]')
console.log('y\\x'.padEnd(6), ...[...Array(Math.ceil(width/80))].map((_,i) => String(i*80).padStart(6)))
console.log()

for (let y = 20; y < height; y += 60) {
  const row = [`y=${y}`]
  for (let x = 20; x < width; x += 80) {
    const c = px(x, y)
    if (isBorder(c)) { row.push('      '); continue }
    row.push(hex(c))
  }
  console.log(row.join(' '))
}
