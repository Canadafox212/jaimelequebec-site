/**
 * fix-r03-r14.mjs
 * Fix Cantons-de-l'Est (r03) and Montérégie (r14)
 * + scan pour trouver les couleurs inconnues dans le sud
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

// ─── Scan de la zone sud pour trouver Cantons-de-l'Est ───────────────
console.log('=== Scan zone sud (y=680-844) pour couleurs inconnues ===\n')

const connues = new Set(['#f7d3d3','#dee794','#fff794','#efb54a','#ff7339',
  '#fef8b8','#ef9c9c','#b5dead','#fdf9c7','#ebeec8','#c6fac6',
  '#efa39d','#efb59c','#ffb399','#ff9c7e'])

// Census par pixel dans zone sud
const cnt = new Map(), sumX=new Map(), sumY=new Map()
for(let y=700;y<height;y++){
  for(let x=30;x<820;x++){
    const c=getRGB(x,y)
    if(isPreserved(c)) continue
    const h=hex(c)
    if(connues.has(h)) continue
    cnt.set(h,(cnt.get(h)||0)+1)
    sumX.set(h,(sumX.get(h)||0)+x)
    sumY.set(h,(sumY.get(h)||0)+y)
  }
}
const sorted=[...cnt.entries()].sort((a,b)=>b[1]-a[1])
console.log('Top couleurs inconnues (y>700):')
for(const[h,n] of sorted.slice(0,20)){
  const cx=Math.round(sumX.get(h)/n), cy=Math.round(sumY.get(h)/n)
  console.log(`  ${h}  n=${String(n).padStart(5)}  centre(${cx},${cy})`)
}

// ─── Test seeds pour Montérégie ────────────────────────────────────
console.log('\n=== Test seeds Montérégie (bande sud dee794) ===')
const mseeds = [[165,805],[140,802],[180,800],[155,810],[170,808]]
for(const[x,y] of mseeds){
  const c=getRGB(x,y)
  const pres=isPreserved(c)
  console.log(`  (${x},${y}) ${hex(c)} ${pres?'→ préservé':''}`)
}

// ─── Flood-fill test pour Montérégie ──────────────────────────────
console.log('\n=== Flood-fill test Montérégie seed (165,805) ===')
const mpx=floodFill(165,805)
const mxmin=Math.min(...mpx.map(([x])=>x))
const mxmax=Math.max(...mpx.map(([x])=>x))
const mymin=Math.min(...mpx.map(([,y])=>y))
const mymax=Math.max(...mpx.map(([,y])=>y))
console.log(`  ${mpx.length} pixels, bounding box x=${mxmin}-${mxmax}, y=${mymin}-${mymax}`)

// ─── Test seed r04 pour comparaison ───────────────────────────────
console.log('\n=== Flood-fill test Centre-QC seed (450,690) ===')
const r04px=floodFill(450,690)
const r04xmin=Math.min(...r04px.map(([x])=>x))
const r04xmax=Math.max(...r04px.map(([x])=>x))
const r04ymin=Math.min(...r04px.map(([,y])=>y))
const r04ymax=Math.max(...r04px.map(([,y])=>y))
console.log(`  ${r04px.length} pixels, bounding box x=${r04xmin}-${r04xmax}, y=${r04ymin}-${r04ymax}`)

// ─── Génération des cartes ─────────────────────────────────────────
console.log('\n=== Génération cartes ===\n')

async function generateMap(id, pixels, colorHex) {
  const set = new Set(pixels.map(([x,y])=>y*width+x))
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

// Montérégie avec seed bande sud
await generateMap('r14', mpx, '#558B2F')

// Pour Cantons: chercher dans la zone top-couleur inconnue
// Essayer seeds autour du centre trouvé
const topColor = sorted[0]
if(topColor){
  const [h,n]=topColor
  const cx=Math.round(sumX.get(h)/n), cy=Math.round(sumY.get(h)/n)
  console.log(`\nTop couleur inconnue: ${h} (${n}px) centre(${cx},${cy})`)
  if(!isPreserved(getRGB(cx,cy))){
    const px3=floodFill(cx,cy)
    console.log(`Flood-fill: ${px3.length}px`)
    await generateMap('r03', px3, '#8E24AA')
  }
}

console.log('\nDone.')
