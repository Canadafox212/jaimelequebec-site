/**
 * fix-remaining.mjs
 * Génère les cartes restantes avec les bons seeds
 */
import sharp from 'sharp'
import path from 'path'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const OUT_DIR = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/jaimelequebec-site/public/maps'

const { data: raw, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const data = new Uint8ClampedArray(raw)

function getRGB(x, y) { const i=(y*width+x)*channels; return [data[i],data[i+1],data[i+2]] }
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function dist([r1,g1,b1],[r2,g2,b2]) { return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2) }
function isPreserved([r,g,b]) {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b)
  if (mn>240) return true; if (mx<25) return true
  if (g>190&&r<120&&b<120&&g>r+80&&g>b+80) return true
  if (b>140&&r<40&&g<80) return true
  if (b>200&&r>140&&g>230&&b>g-30) return true
  if (mx-mn<20&&r>130&&r<200) return true
  if (mn>220&&mx-mn<20) return true
  return false
}
function floodFill(sx, sy) {
  const sc=getRGB(sx,sy), vis=new Uint8Array(width*height), px=[]
  const q=[[sx,sy]]; vis[sy*width+sx]=1
  const dx=[1,-1,0,0],dy=[0,0,1,-1]
  while(q.length){
    const [x,y]=q.shift(); px.push([x,y])
    for(let d=0;d<4;d++){
      const nx=x+dx[d],ny=y+dy[d]
      if(nx<0||nx>=width||ny<0||ny>=height) continue
      const ni=ny*width+nx; if(vis[ni]) continue; vis[ni]=1
      const nc=getRGB(nx,ny)
      if(isPreserved(nc)) continue
      if(dist(nc,sc)<=22) q.push([nx,ny])
    }
  }
  return px
}

async function generateMap(id, pixels, colorHex) {
  const set=new Set(pixels.map(([x,y])=>y*width+x))
  const [cr,cg,cb]=[parseInt(colorHex.slice(1,3),16),parseInt(colorHex.slice(3,5),16),parseInt(colorHex.slice(5,7),16)]
  const GREY=160
  const out=Buffer.alloc(width*height*3)
  for(let y=0;y<height;y++){
    for(let x=0;x<width;x++){
      const pi=y*width+x,oi=pi*3,ii=pi*channels
      const r=data[ii],g=data[ii+1],b=data[ii+2]
      if(isPreserved([r,g,b])){out[oi]=r;out[oi+1]=g;out[oi+2]=b}
      else if(set.has(pi)){out[oi]=cr;out[oi+1]=cg;out[oi+2]=cb}
      else{out[oi]=GREY;out[oi+1]=GREY;out[oi+2]=GREY}
    }
  }
  const outPath=path.join(OUT_DIR,`${id}.jpg`)
  await sharp(out,{raw:{width,height,channels:3}}).jpeg({quality:90}).toFile(outPath)
  console.log(`✓ ${id}.jpg (${pixels.length}px, ${colorHex})`)
}

// ─── r03 Cantons-de-l'Est ──────────────────────────────────────────
// ef9c9c blob au SE de Centre-QC (séparé du blob Mauricie au nord)
// Seeds vérifiés: (540,740), (550,730), (520,720)
console.log('=== r03 Cantons-de-l\'Est ===')
let r03px = null
for(const[sx,sy] of [[540,740],[550,730],[520,720],[530,740]]){
  const c=getRGB(sx,sy)
  console.log(`  seed (${sx},${sy}) = ${hex(c)}`)
  if(isPreserved(c)) { console.log('  → préservé'); continue }
  const px=floodFill(sx,sy)
  console.log(`  → ${px.length} pixels`)
  // Mauricie = ~28864px: si beaucoup trop grand, mauvais seed
  if(px.length > 100 && px.length < 25000) { r03px=px; break }
  if(px.length >= 25000) { console.log('  → trop grand (Mauricie?), essai suivant'); continue }
}
if(r03px) await generateMap('r03', r03px, '#8E24AA')
else console.log('⚠️ r03 échec')

// ─── r12 Laval ──────────────────────────────────────────────────────
// Île de Laval: petite île au nord de Montréal
// Chercher dee794 dans la zone Laval (x=395-430, y=735-745)
console.log('\n=== r12 Laval ===')
let r12px = null
for(const[sx,sy] of [[405,742],[410,740],[415,740],[400,743],[420,742]]){
  const c=getRGB(sx,sy)
  console.log(`  seed (${sx},${sy}) = ${hex(c)}`)
  if(isPreserved(c)) { console.log('  → préservé'); continue }
  const px=floodFill(sx,sy)
  console.log(`  → ${px.length} pixels`)
  if(px.length >= 30) { r12px=px; break }
}
if(r12px) await generateMap('r12', r12px, '#E91E63')
else console.log('⚠️ r12 échec')

// ─── r15 Montréal ───────────────────────────────────────────────────
// Île de Montréal: petite île isolée par l'eau
// Seed (375,750) = dee794, isolée par eau (63b0f1) à (390,750)
console.log('\n=== r15 Montréal ===')
let r15px = null
for(const[sx,sy] of [[375,750],[370,750],[378,752],[373,748],[365,750]]){
  const c=getRGB(sx,sy)
  console.log(`  seed (${sx},${sy}) = ${hex(c)}`)
  if(isPreserved(c)) { console.log('  → préservé'); continue }
  const px=floodFill(sx,sy)
  console.log(`  → ${px.length} pixels`)
  if(px.length >= 20) { r15px=px; break }
}
if(r15px) await generateMap('r15', r15px, '#B71C1C')
else console.log('⚠️ r15 échec')

// ─── r14 Montérégie ─────────────────────────────────────────────────
// Montérégie partage la couleur dee794 avec Centre-QC sur cette carte touristique
// On utilise le blob central (le plus grand dee794 identifiable dans la zone sud)
console.log('\n=== r14 Montérégie ===')
const r14px = floodFill(450, 690)
console.log(`  seed (450,690) → ${r14px.length} pixels`)
await generateMap('r14', r14px, '#558B2F')

console.log('\nDone.')
