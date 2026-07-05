// Re-génère les SVG polygones des régions touristiques du Québec
// depuis le GeoJSON officiel, avec projection améliorée (ratio 1.27 comme image réf)
const GEOJSON_URL = 'https://gist.githubusercontent.com/carmoreira/73f4d87b7c42834669dd8f734b1e3a58/raw/0198532fd51f2526a9ec7d301d048fef310dfb00/quebec_regions.geojson'

// Nouvelle projection: viewBox "0 0 700 550" — ratio 1.27 comme l'image de référence
const W = 700, H = 550
function toSVG([lng, lat]) {
  const x = Math.round(((lng + 80) / 25 * W) * 10) / 10
  const y = Math.round(((63.5 - lat) / 19 * H) * 10) / 10
  return [x, y]
}

function perp([px,py],[ax,ay],[bx,by]) {
  const dx=bx-ax,dy=by-ay,len=Math.sqrt(dx*dx+dy*dy)
  if(!len) return Math.hypot(px-ax,py-ay)
  return Math.abs(dy*px-dx*py+bx*ay-by*ax)/len
}
function dp(pts, eps) {
  if(pts.length<=2) return pts
  let mx=0,mi=0
  for(let i=1;i<pts.length-1;i++){const d=perp(pts[i],pts[0],pts[pts.length-1]);if(d>mx){mx=d;mi=i}}
  if(mx>eps) return [...dp(pts.slice(0,mi+1),eps).slice(0,-1),...dp(pts.slice(mi),eps)]
  return [pts[0],pts[pts.length-1]]
}
function polyArea(pts){
  let a=0; for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;a+=pts[i][0]*pts[j][1]-pts[j][0]*pts[i][1]} return Math.abs(a/2)
}
function simplify(ring, eps) {
  const svgPts = ring.map(toSVG)
  const s = dp(svgPts, eps)
  const last=s[s.length-1]
  if(s[0][0]===last[0]&&s[0][1]===last[1]) return s.slice(0,-1)
  return s
}
function ptsStr(pts) { return pts.map(([x,y])=>`${x},${y}`).join(' ') }
function simplifyStr(ring, eps) { return ptsStr(simplify(ring, eps)) }

// Mapping admin → tourist regions
const MAP = {
  'Outaouais': 9, 'Saguenay - Lac-Saint-Jean': 6, 'Abitibi-Témiscamingue': 17,
  'Mauricie': 10, 'Capitale-Nationale': 2, 'Laurentides': 12,
  'Chaudière-Appalaches': 14, 'Lanaudière': 11, 'Montérégie': 13,
  'Estrie': 8, 'Nord-du-Québec': 18, 'Montréal': 1, 'Côte-Nord': 7,
  'Bas-Saint-Laurent': 5, 'Laval': 19, 'Centre-du-Québec': 15,
}

// Epsilon par région (simplification)
const EPS = {
  18: 7,  // Nord-du-Québec: très grande
  7: 5,   // Côte-Nord: grande
  9: 3,   // Outaouais
  17: 3,  // Abitibi
  6: 3,   // Saguenay
  5: 2,   // BSL
  12: 2,  // Laurentides
  default: 2
}

const resp = await fetch(GEOJSON_URL)
const gj = await resp.json()
const results = {}

for (const feat of gj.features) {
  const name = feat.properties.res_nm_reg
  const geom = feat.geometry

  // Gaspésie-ÎdM: séparer Gaspésie (#4) et ÎdM (#16)
  if (name === 'Gaspésie-Îles-de-la-Madeleine') {
    if (geom.type === 'MultiPolygon') {
      const polys = geom.coordinates.map(poly => poly[0])
      polys.sort((a,b) => b.length-a.length)
      const gaspSvg = simplify(polys[0], 2.5)
      results[4] = ptsStr(gaspSvg)
      console.log(`4 (Gaspésie): ${polys[0].length} raw → ${gaspSvg.length} pts`)
      // ÎdM: le plus grand fragment restant
      let bestArea=0, bestPts=null
      for(let i=1;i<polys.length;i++) {
        const pts=simplify(polys[i], 0.5)
        const a=polyArea(pts)
        if(a>bestArea){bestArea=a;bestPts=pts}
      }
      if(bestPts&&bestArea>5){results[16]=ptsStr(bestPts);console.log(`16 (ÎdM): area=${bestArea.toFixed(0)}, ${bestPts.length} pts`)}
      else {results[16]='494.4,528.7 507,529.6 507.4,536 498.5,536.7 494.4,533.3';console.log('16 (ÎdM): manuel')}
    } else {
      results[4] = simplifyStr(geom.coordinates[0], 2.5)
      results[16] = '494.4,528.7 507,529.6 507.4,536 498.5,536.7 494.4,533.3'
    }
    continue
  }

  const num = MAP[name]
  if(!num) { console.log('UNKNOWN:', name); continue }

  const eps = EPS[num] ?? EPS.default
  let ring
  if(geom.type==='Polygon') { ring=geom.coordinates[0] }
  else { const polys=geom.coordinates.map(p=>p[0]); polys.sort((a,b)=>b.length-a.length); ring=polys[0] }

  const pts = simplify(ring, eps)
  results[num] = ptsStr(pts)
  console.log(`${num} (${name}): ${ring.length} raw → ${pts.length} pts`)
}

// Charlevoix (#3): région touristique = sous-ensemble de Capitale-Nationale
// Bornes géo approx: lat 47.3-48.7°N, lng 70.0-71.5°W (rive nord St-Laurent)
// Avec la nouvelle projection W=700, H=550:
// x=(lng+80)/25*700, y=(63.5-lat)/19*550
// (71.5°W,47.3°N): x=(80-71.5)/25*700=238, y=(63.5-47.3)/19*550=469
// (70.0°W,47.3°N): x=(80-70)/25*700=280, y=469
// (69.6°W,48.7°N): x=(80-69.6)/25*700=291.2, y=(63.5-48.7)/19*550=428
// (70.7°W,48.7°N): x=271.8, y=428
// En tenant compte des points limites avec les régions voisines:
results[3] = '239.5,465 271.8,443 291.2,432 296,456 290,476 270,485 250,480 238,470'
console.log('3 (Charlevoix): 8 pts manuel')

// Missing?
const missing=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].filter(n=>!results[n])
if(missing.length) console.log('MANQUANTS:', missing)

console.log('\n=== PATHS (nouveau viewBox 700×550) ===')
Object.entries(results).sort(([a],[b])=>Number(a)-Number(b)).forEach(([n,pts])=>{
  const count=pts.split(' ').length
  console.log(`  ${n}: '${pts}',`)
})
