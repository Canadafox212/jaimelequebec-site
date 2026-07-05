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

// r06: Chaudière-Appalaches — blob #fff794 EST (x=500-637, y=600-710)
// r10 a pris le blob OUEST (x=374-450, y=600-706)
// On utilise un seed dans la partie EST
const seeds = [[600,668],[580,670],[610,670]]
let region=null
for(const [sx,sy] of seeds){
  const c=getRGB(sx,sy)
  console.log(`seed (${sx},${sy}) = ${hex(c)}`)
  if(isPreserved(c)) { console.log('  → préservé'); continue }
  const px=floodFill(sx,sy)
  console.log(`  → ${px.length} pixels`)
  if(px.length>=200) { region=px; break }
}

if(!region){ console.log('Echec'); process.exit(1) }

const set=new Set(region.map(([x,y])=>y*width+x))
const [cr,cg,cb]=[0xE6,0x51,0x00]  // orange: Chaud-App
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
const outPath=path.join(OUT_DIR,'r06.jpg')
await sharp(out,{raw:{width,height,channels:3}}).jpeg({quality:90}).toFile(outPath)
console.log(`✓ ${outPath}`)
