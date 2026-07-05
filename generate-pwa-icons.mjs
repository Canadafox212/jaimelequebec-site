import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'

const SOURCE = 'public/images/Raton-laveur avec sac à dos transparent.png'
const ICONS_DIR = 'public/icons'
const BLUE = { r: 0, g: 48, b: 135, alpha: 1 } // #003087
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }

mkdirSync(ICONS_DIR, { recursive: true })

// Transparent "any" icon — raccoon trimmed then scaled to fill the square
async function anyIcon(size) {
  return sharp(SOURCE)
    .trim()
    .resize(size, size, { fit: 'contain', background: CLEAR })
    .png()
    .toBuffer()
}

// Maskable icon — raccoon in the 80% safe zone, blue background
async function maskableIcon(size) {
  const inner = Math.round(size * 0.8)
  const pad   = Math.round((size - inner) / 2)
  const buf   = await sharp(SOURCE)
    .trim()
    .resize(inner, inner, { fit: 'contain', background: CLEAR })
    .png()
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: BLUE } })
    .composite([{ input: buf, top: pad, left: pad }])
    .png()
    .toBuffer()
}

// Blue-background icon — raccoon at given ratio of the square
async function blueIcon(size, ratio = 0.75) {
  const inner = Math.round(size * ratio)
  const pad   = Math.round((size - inner) / 2)
  const buf   = await sharp(SOURCE)
    .trim()
    .resize(inner, inner, { fit: 'contain', background: CLEAR })
    .png()
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: BLUE } })
    .composite([{ input: buf, top: pad, left: pad }])
    .png()
    .toBuffer()
}

// Build a multi-resolution .ico from PNG buffers
function buildIco(entries) {
  const count  = entries.length
  let   offset = 6 + 16 * count
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // type: ICO
  header.writeUInt16LE(count, 4)
  const dirs = entries.map(({ w, h, buf }) => {
    const d = Buffer.alloc(16)
    d.writeUInt8(w < 256 ? w : 0, 0)
    d.writeUInt8(h < 256 ? h : 0, 1)
    d.writeUInt8(0, 2); d.writeUInt8(0, 3)
    d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6)
    d.writeUInt32LE(buf.length, 8)
    d.writeUInt32LE(offset, 12)
    offset += buf.length
    return d
  })
  return Buffer.concat([header, ...dirs, ...entries.map(e => e.buf)])
}

console.log('Generating PWA icons from raton source…')

const [i192, i512, m192, m512, apple, f16, f32, f48] = await Promise.all([
  anyIcon(192),
  anyIcon(512),
  maskableIcon(192),
  maskableIcon(512),
  blueIcon(180, 0.75),
  blueIcon(16, 0.85),
  blueIcon(32, 0.82),
  blueIcon(48, 0.80),
])

writeFileSync(`${ICONS_DIR}/icon-192.png`,          i192)
writeFileSync(`${ICONS_DIR}/icon-512.png`,          i512)
writeFileSync(`${ICONS_DIR}/icon-192-maskable.png`, m192)
writeFileSync(`${ICONS_DIR}/icon-512-maskable.png`, m512)
writeFileSync('public/apple-touch-icon.png',        apple)
writeFileSync('public/favicon.ico', buildIco([
  { w: 16, h: 16, buf: f16 },
  { w: 32, h: 32, buf: f32 },
  { w: 48, h: 48, buf: f48 },
]))

console.log('Done. Files written:')
console.log('  public/icons/icon-192.png')
console.log('  public/icons/icon-512.png')
console.log('  public/icons/icon-192-maskable.png')
console.log('  public/icons/icon-512-maskable.png')
console.log('  public/apple-touch-icon.png')
console.log('  public/favicon.ico')
