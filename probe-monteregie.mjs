import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, channels } = info

function px(x, y) {
  const i = (y * width + x) * channels
  return '#' + [data[i], data[i+1], data[i+2]].map(v => v.toString(16).padStart(2, '0')).join('')
}

console.log('=== Zone Montérégie/Montréal (x=300-480, y=750-820) ===')
for (let y = 750; y <= 820; y += 10) {
  let row = ''
  for (let x = 300; x <= 480; x += 10) row += `(${x},${y})=${px(x,y)} `
  console.log(row)
}

console.log('\n=== Zone Cantons-de-l\'Est (x=470-620, y=720-800) ===')
for (let y = 720; y <= 800; y += 10) {
  let row = ''
  for (let x = 470; x <= 620; x += 10) row += `(${x},${y})=${px(x,y)} `
  console.log(row)
}

console.log('\n=== Zone très sud (y=800-844) ===')
for (let y = 800; y <= 840; y += 10) {
  let row = ''
  for (let x = 50; x <= 700; x += 50) row += `(${x},${y})=${px(x,y)} `
  console.log(row)
}

// Chercher des pixels identiques à la zone Laval (île entre Montréal et rive nord)
console.log('\n=== Zone Laval/Montréal (x=380-440, y=730-765) ===')
for (let y = 730; y <= 765; y += 5) {
  let row = ''
  for (let x = 380; x <= 440; x += 5) row += `(${x},${y})=${px(x,y)} `
  console.log(row)
}
